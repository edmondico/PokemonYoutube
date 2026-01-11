import { createClient } from '@supabase/supabase-js';
import { VideoIdea, TodoItem, Task, Note } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert VideoIdea to DB format
const ideaToDb = (idea: VideoIdea) => ({
  id: idea.id,
  title: idea.title,
  description: idea.description,
  category: idea.category,
  viral_score: idea.viralScore,
  competition: idea.competition,
  reasoning: idea.reasoning,
  tags: idea.tags,
  status: idea.status,
  script: idea.script,
  created_at: idea.createdAt,
  is_disliked: idea.isDisliked,
});

// Helper to convert DB format to VideoIdea
const dbToIdea = (row: any): VideoIdea => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  viralScore: row.viral_score,
  competition: row.competition,
  reasoning: row.reasoning,
  tags: row.tags || [],
  status: row.status,
  script: row.script,
  createdAt: row.created_at,
  isDisliked: row.is_disliked,
});

// ==================== NOTES ====================

export const getNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    isPinned: row.is_pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const saveNote = async (note: Note): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .upsert({
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      is_pinned: note.isPinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });

  if (error) {
    console.error('Error saving note:', error);
  }
};

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note:', error);
  }
};

// ==================== SAVED IDEAS ====================

export const getSavedIdeas = async (): Promise<VideoIdea[]> => {
  const { data, error } = await supabase
    .from('saved_ideas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved ideas:', error);
    return [];
  }

  return (data || []).map(dbToIdea);
};

export const saveIdea = async (idea: VideoIdea): Promise<void> => {
  const { error } = await supabase
    .from('saved_ideas')
    .upsert(ideaToDb(idea));

  if (error) {
    console.error('Error saving idea:', error);
  }
};

export const updateIdea = async (idea: VideoIdea): Promise<void> => {
  const { error } = await supabase
    .from('saved_ideas')
    .update(ideaToDb(idea))
    .eq('id', idea.id);

  if (error) {
    console.error('Error updating idea:', error);
  }
};

export const deleteIdea = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('saved_ideas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting idea:', error);
  }
};

// ==================== DAILY TODOS ====================

export const getDailyTodos = async (): Promise<TodoItem[]> => {
  const { data, error } = await supabase
    .from('daily_todos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily todos:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
  }));
};

export const saveDailyTodo = async (todo: TodoItem): Promise<void> => {
  const { error } = await supabase
    .from('daily_todos')
    .upsert({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
    });

  if (error) {
    console.error('Error saving daily todo:', error);
  }
};

export const deleteDailyTodo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('daily_todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting daily todo:', error);
  }
};

export const clearDailyTodos = async (): Promise<void> => {
  const { error } = await supabase
    .from('daily_todos')
    .delete()
    .neq('id', ''); // Delete all

  if (error) {
    console.error('Error clearing daily todos:', error);
  }
};

export const syncDailyTodos = async (todos: TodoItem[]): Promise<void> => {
  // Clear and re-insert all
  await clearDailyTodos();
  for (const todo of todos) {
    await saveDailyTodo(todo);
  }
};

// ==================== TOMORROW TODOS ====================

export const getTomorrowTodos = async (): Promise<TodoItem[]> => {
  const { data, error } = await supabase
    .from('tomorrow_todos')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tomorrow todos:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
  }));
};

export const saveTomorrowTodo = async (todo: TodoItem): Promise<void> => {
  const { error } = await supabase
    .from('tomorrow_todos')
    .upsert({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
    });

  if (error) {
    console.error('Error saving tomorrow todo:', error);
  }
};

export const deleteTomorrowTodo = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tomorrow_todos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tomorrow todo:', error);
  }
};

export const clearTomorrowTodos = async (): Promise<void> => {
  const { error } = await supabase
    .from('tomorrow_todos')
    .delete()
    .neq('id', '');

  if (error) {
    console.error('Error clearing tomorrow todos:', error);
  }
};

export const syncTomorrowTodos = async (todos: TodoItem[]): Promise<void> => {
  await clearTomorrowTodos();
  for (const todo of todos) {
    await saveTomorrowTodo(todo);
  }
};

// ==================== TASKS (NEW DATE-BASED SYSTEM) ====================

export const getTasksByDate = async (date: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    date: row.date,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }));
};

export const getTasksForDateRange = async (startDate: string, endDate: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks range:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    text: row.text,
    completed: row.completed,
    date: row.date,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }));
};

export const addTask = async (text: string, date: string): Promise<Task | null> => {
  const newTask = {
    id: Math.random().toString(36).substr(2, 9),
    text,
    completed: false,
    date,
  };

  const { error } = await supabase
    .from('tasks')
    .insert(newTask);

  if (error) {
    console.error('Error adding task:', error);
    return null;
  }

  return { ...newTask, createdAt: new Date().toISOString(), completedAt: null };
};

export const updateTask = async (task: Task): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({
      text: task.text,
      completed: task.completed,
      completed_at: task.completed ? new Date().toISOString() : null,
    })
    .eq('id', task.id);

  if (error) {
    console.error('Error updating task:', error);
  }
};

export const toggleTaskComplete = async (id: string, completed: boolean): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error toggling task:', error);
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
  }
};

export const getDatesWithTasks = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('date')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching dates with tasks:', error);
    return [];
  }

  // Get unique dates
  const uniqueDates = [...new Set((data || []).map(row => row.date))];
  return uniqueDates;
};

// ==================== DISLIKED IDEAS ====================

export const getDislikedIdeas = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('disliked_ideas')
    .select('title');

  if (error) {
    console.error('Error fetching disliked ideas:', error);
    return [];
  }

  return (data || []).map(row => row.title);
};

export const addDislikedIdea = async (title: string): Promise<void> => {
  const { error } = await supabase
    .from('disliked_ideas')
    .insert({ title });

  if (error) {
    console.error('Error adding disliked idea:', error);
  }
};

export const saveDislikedIdeas = async (ideas: string[]): Promise<void> => {
  // Clear existing and insert new
  await supabase.from('disliked_ideas').delete().neq('id', 0);

  if (ideas.length > 0) {
    const { error } = await supabase
      .from('disliked_ideas')
      .insert(ideas.map(title => ({ title })));

    if (error) {
      console.error('Error saving disliked ideas:', error);
    }
  }
};

// ==================== SEARCH HISTORY ====================

export const getSearchHistory = async () => {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching search history:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    timestamp: new Date(row.created_at).getTime(),
    niche: row.niche,
    outliers: row.outliers || [],
    videoIdeas: row.video_ideas || [],
    trending: row.trending || [],
    mostSearched: row.most_searched || [],
  }));
};

export const saveSearchResult = async (
  niche: string,
  outliers: VideoIdea[],
  videoIdeas: VideoIdea[],
  trending: VideoIdea[],
  mostSearched: VideoIdea[]
): Promise<void> => {
  const { error } = await supabase
    .from('search_history')
    .insert({
      id: Math.random().toString(36).substr(2, 9),
      niche,
      outliers,
      video_ideas: videoIdeas,
      trending,
      most_searched: mostSearched,
    });

  if (error) {
    console.error('Error saving search result:', error);
  }
};

export const deleteSearchHistory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting search history:', error);
  }
};

export const clearSearchHistory = async (): Promise<void> => {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .neq('id', '');

  if (error) {
    console.error('Error clearing search history:', error);
  }
};

// ==================== SETTINGS ====================

export interface AppSettings {
  theme: 'light' | 'dark';
  aiInstructions: string;
  userApiKey: string;
  defaultNiche: string;
  language: string;
  perpetualTasks: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  aiInstructions: '',
  userApiKey: '',
  defaultNiche: 'Pokemon Investing',
  language: 'es',
  perpetualTasks: []
};

export const getSetting = async <T>(key: string, defaultValue: T): Promise<T> => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error || !data) {
    return defaultValue;
  }

  return data.value as T;
};

export const setSetting = async <T>(key: string, value: T): Promise<void> => {
  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error saving setting:', error);
  }
};

export const getAllSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error || !data) {
    return DEFAULT_SETTINGS;
  }

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    switch (row.key) {
      case 'theme':
        settings.theme = row.value as 'light' | 'dark';
        break;
      case 'ai_instructions':
        settings.aiInstructions = row.value as string;
        break;
      case 'user_api_key':
        settings.userApiKey = row.value as string;
        break;
      case 'default_niche':
        settings.defaultNiche = row.value as string;
        break;
      case 'language':
        settings.language = row.value as string;
        break;
      case 'perpetual_tasks':
        settings.perpetualTasks = row.value as string[];
        break;
    }
  }

  return settings;
};

export const saveAllSettings = async (settings: AppSettings): Promise<void> => {
  const entries = [
    { key: 'theme', value: settings.theme },
    { key: 'ai_instructions', value: settings.aiInstructions },
    { key: 'user_api_key', value: settings.userApiKey },
    { key: 'default_niche', value: settings.defaultNiche },
    { key: 'language', value: settings.language },
    { key: 'perpetual_tasks', value: settings.perpetualTasks },
  ];

  for (const entry of entries) {
    await setSetting(entry.key, entry.value);
  }
};

// ==================== TASK HELPERS ====================

export const ensureDailyTasksForDate = async (date: string): Promise<void> => {
  // 1. Check if ANY tasks exist for this date
  const { count, error } = await supabase
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('date', date);

  if (error) {
    console.error('Error checking tasks count:', error);
    return;
  }

  // 2. If tasks exist, we assume the day is initialized.
  if (count && count > 0) {
    return;
  }

  // 3. If no tasks, fetch perpetual tasks from settings
  const perpetualTasks = await getSetting<string[]>('perpetual_tasks', []);

  if (perpetualTasks.length === 0) {
    return;
  }

  // 4. Create tasks
  const newTasks = perpetualTasks.map(text => ({
    id: Math.random().toString(36).substr(2, 9),
    text,
    completed: false,
    date,
    created_at: new Date().toISOString()
  }));

  const { error: insertError } = await supabase
    .from('tasks')
    .insert(newTasks);

  if (insertError) {
    console.error('Error inserting perpetual tasks:', insertError);
  }
};


// ==================== STATISTICS ====================

export type StatEventType = 'search' | 'idea_saved' | 'idea_completed' | 'script_generated' | 'task_completed';

export const trackEvent = async (eventType: StatEventType, metadata?: Record<string, any>): Promise<void> => {
  const { error } = await supabase
    .from('statistics')
    .insert({
      event_type: eventType,
      metadata: metadata || {},
    });

  if (error) {
    console.error('Error tracking event:', error);
  }
};

export const getStatistics = async (): Promise<{
  totalSearches: number;
  totalIdeasSaved: number;
  totalIdeasCompleted: number;
  totalScriptsGenerated: number;
  totalTasksCompleted: number;
  searchesByDay: Array<{ date: string; count: number }>;
  recentActivity: Array<{ type: string; date: string; metadata?: any }>;
}> => {
  // Get counts
  const { data: stats, error } = await supabase
    .from('statistics')
    .select('event_type, created_at, metadata')
    .order('created_at', { ascending: false });

  if (error || !stats) {
    return {
      totalSearches: 0,
      totalIdeasSaved: 0,
      totalIdeasCompleted: 0,
      totalScriptsGenerated: 0,
      totalTasksCompleted: 0,
      searchesByDay: [],
      recentActivity: [],
    };
  }

  const counts = {
    search: 0,
    idea_saved: 0,
    idea_completed: 0,
    script_generated: 0,
    task_completed: 0,
  };

  const searchesByDay: Record<string, number> = {};

  for (const stat of stats) {
    if (stat.event_type in counts) {
      counts[stat.event_type as keyof typeof counts]++;
    }

    if (stat.event_type === 'search') {
      const date = new Date(stat.created_at).toISOString().split('T')[0];
      searchesByDay[date] = (searchesByDay[date] || 0) + 1;
    }
  }

  return {
    totalSearches: counts.search,
    totalIdeasSaved: counts.idea_saved,
    totalIdeasCompleted: counts.idea_completed,
    totalScriptsGenerated: counts.script_generated,
    totalTasksCompleted: counts.task_completed,
    searchesByDay: Object.entries(searchesByDay)
      .map(([date, count]) => ({ date, count }))
      .slice(0, 30),
    recentActivity: stats.slice(0, 20).map(s => ({
      type: s.event_type,
      date: s.created_at,
      metadata: s.metadata,
    })),
  };
};

// ==================== INITIALIZATION ====================

export const initDB = async (): Promise<void> => {
  // Test connection
  const { error } = await supabase.from('saved_ideas').select('id').limit(1);

  if (error) {
    console.error('Failed to connect to Supabase:', error);
    throw new Error('Database connection failed. Make sure tables are created.');
  }

  console.log('Supabase connected successfully');
};

// Migration from localStorage (run once)
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Check if already migrated
    const migrated = localStorage.getItem('pokeTrend_migrated_to_supabase');
    if (migrated) return;

    // Migrate saved ideas
    const savedIdeasStr = localStorage.getItem('pokeTrend_saved');
    if (savedIdeasStr) {
      const savedIdeas: VideoIdea[] = JSON.parse(savedIdeasStr);
      for (const idea of savedIdeas) {
        await saveIdea(idea);
      }
    }

    // Migrate daily todos
    const dailyTodosStr = localStorage.getItem('pokeTrend_todos');
    if (dailyTodosStr) {
      const dailyTodos: TodoItem[] = JSON.parse(dailyTodosStr);
      for (const todo of dailyTodos) {
        await saveDailyTodo(todo);
      }
    }

    // Migrate tomorrow todos
    const tomorrowTodosStr = localStorage.getItem('pokeTrend_todos_tomorrow');
    if (tomorrowTodosStr) {
      const tomorrowTodos: TodoItem[] = JSON.parse(tomorrowTodosStr);
      for (const todo of tomorrowTodos) {
        await saveTomorrowTodo(todo);
      }
    }

    // Mark as migrated
    localStorage.setItem('pokeTrend_migrated_to_supabase', 'true');
    console.log('Migration from localStorage completed');
  } catch (error) {
    console.error('Migration from localStorage failed:', error);
  }
};
