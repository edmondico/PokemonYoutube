-- PokeTrend AI Database Schema for Supabase

-- Saved Video Ideas
CREATE TABLE IF NOT EXISTS saved_ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  viral_score INTEGER,
  competition TEXT,
  reasoning TEXT,
  tags TEXT[], -- Array of tags
  status TEXT DEFAULT 'saved',
  script TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  is_disliked BOOLEAN DEFAULT FALSE
);

-- Daily Todos (Today)
CREATE TABLE IF NOT EXISTS daily_todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tomorrow Todos
CREATE TABLE IF NOT EXISTS tomorrow_todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disliked Ideas (for AI training)
CREATE TABLE IF NOT EXISTS disliked_ideas (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id TEXT PRIMARY KEY,
  niche TEXT NOT NULL,
  outliers JSONB,
  video_ideas JSONB,
  trending JSONB,
  most_searched JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, for multi-user later)
ALTER TABLE saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tomorrow_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disliked_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single user app)
CREATE POLICY "Allow all" ON saved_ideas FOR ALL USING (true);
CREATE POLICY "Allow all" ON daily_todos FOR ALL USING (true);
CREATE POLICY "Allow all" ON tomorrow_todos FOR ALL USING (true);
CREATE POLICY "Allow all" ON disliked_ideas FOR ALL USING (true);
CREATE POLICY "Allow all" ON search_history FOR ALL USING (true);
