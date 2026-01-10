import { createClient } from '@supabase/supabase-js';
import { VideoIdea, TodoItem, Task } from '../types';

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
