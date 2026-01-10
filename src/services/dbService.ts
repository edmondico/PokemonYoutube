import { VideoIdea, TodoItem } from '../types';

const DB_NAME = 'PokeTrendDB';
const DB_VERSION = 1;

interface DBSchema {
  savedIdeas: VideoIdea[];
  dailyTodos: TodoItem[];
  tomorrowTodos: TodoItem[];
  dislikedIdeas: string[];
  searchHistory: Array<{
    id: string;
    timestamp: number;
    niche: string;
    outliers: VideoIdea[];
    videoIdeas: VideoIdea[];
    trending: VideoIdea[];
    mostSearched: VideoIdea[];
  }>;
}

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Store for saved ideas
      if (!database.objectStoreNames.contains('savedIdeas')) {
        database.createObjectStore('savedIdeas', { keyPath: 'id' });
      }

      // Store for daily todos
      if (!database.objectStoreNames.contains('dailyTodos')) {
        database.createObjectStore('dailyTodos', { keyPath: 'id' });
      }

      // Store for tomorrow todos
      if (!database.objectStoreNames.contains('tomorrowTodos')) {
        database.createObjectStore('tomorrowTodos', { keyPath: 'id' });
      }

      // Store for disliked ideas (simple key-value)
      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      // Store for search history
      if (!database.objectStoreNames.contains('searchHistory')) {
        const historyStore = database.createObjectStore('searchHistory', { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

// Generic helpers
const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const putInStore = async <T>(storeName: string, item: T): Promise<void> => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const deleteFromStore = async (storeName: string, id: string): Promise<void> => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const clearStore = async (storeName: string): Promise<void> => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Saved Ideas
export const getSavedIdeas = () => getAllFromStore<VideoIdea>('savedIdeas');
export const saveIdea = (idea: VideoIdea) => putInStore('savedIdeas', idea);
export const deleteIdea = (id: string) => deleteFromStore('savedIdeas', id);
export const updateIdea = (idea: VideoIdea) => putInStore('savedIdeas', idea);

// Daily Todos
export const getDailyTodos = () => getAllFromStore<TodoItem>('dailyTodos');
export const saveDailyTodo = (todo: TodoItem) => putInStore('dailyTodos', todo);
export const deleteDailyTodo = (id: string) => deleteFromStore('dailyTodos', id);
export const clearDailyTodos = () => clearStore('dailyTodos');

// Tomorrow Todos
export const getTomorrowTodos = () => getAllFromStore<TodoItem>('tomorrowTodos');
export const saveTomorrowTodo = (todo: TodoItem) => putInStore('tomorrowTodos', todo);
export const deleteTomorrowTodo = (id: string) => deleteFromStore('tomorrowTodos', id);
export const clearTomorrowTodos = () => clearStore('tomorrowTodos');

// Settings (disliked ideas, etc.)
export const getDislikedIdeas = async (): Promise<string[]> => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('dislikedIdeas');
    request.onsuccess = () => resolve(request.result?.value || []);
    request.onerror = () => reject(request.error);
  });
};

export const saveDislikedIdeas = async (ideas: string[]): Promise<void> => {
  return putInStore('settings', { key: 'dislikedIdeas', value: ideas });
};

// Search History
export const getSearchHistory = async () => {
  const database = await openDB();
  return new Promise<DBSchema['searchHistory']>((resolve, reject) => {
    const transaction = database.transaction('searchHistory', 'readonly');
    const store = transaction.objectStore('searchHistory');
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result.reverse()); // Most recent first
    request.onerror = () => reject(request.error);
  });
};

export const saveSearchResult = async (
  niche: string,
  outliers: VideoIdea[],
  videoIdeas: VideoIdea[],
  trending: VideoIdea[],
  mostSearched: VideoIdea[]
): Promise<void> => {
  const entry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    niche,
    outliers,
    videoIdeas,
    trending,
    mostSearched,
  };
  return putInStore('searchHistory', entry);
};

export const deleteSearchHistory = (id: string) => deleteFromStore('searchHistory', id);
export const clearSearchHistory = () => clearStore('searchHistory');

// Migration from localStorage (run once on first load)
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Migrate saved ideas
    const savedIdeasStr = localStorage.getItem('pokeTrend_saved');
    if (savedIdeasStr) {
      const savedIdeas: VideoIdea[] = JSON.parse(savedIdeasStr);
      for (const idea of savedIdeas) {
        await saveIdea(idea);
      }
      localStorage.removeItem('pokeTrend_saved');
    }

    // Migrate daily todos
    const dailyTodosStr = localStorage.getItem('pokeTrend_todos');
    if (dailyTodosStr) {
      const dailyTodos: TodoItem[] = JSON.parse(dailyTodosStr);
      for (const todo of dailyTodos) {
        await saveDailyTodo(todo);
      }
      localStorage.removeItem('pokeTrend_todos');
    }

    // Migrate tomorrow todos
    const tomorrowTodosStr = localStorage.getItem('pokeTrend_todos_tomorrow');
    if (tomorrowTodosStr) {
      const tomorrowTodos: TodoItem[] = JSON.parse(tomorrowTodosStr);
      for (const todo of tomorrowTodos) {
        await saveTomorrowTodo(todo);
      }
      localStorage.removeItem('pokeTrend_todos_tomorrow');
    }
  } catch (error) {
    console.error('Migration from localStorage failed:', error);
  }
};

// Initialize DB
export const initDB = async (): Promise<void> => {
  await openDB();
  await migrateFromLocalStorage();
};
