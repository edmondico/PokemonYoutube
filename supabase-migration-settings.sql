-- Migration: User Settings and Statistics
-- Run this in Supabase SQL Editor

-- Settings table for user preferences and AI configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statistics table for tracking usage
CREATE TABLE IF NOT EXISTS statistics (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'search', 'idea_saved', 'idea_completed', 'script_generated'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster stats queries
CREATE INDEX IF NOT EXISTS statistics_event_type_idx ON statistics(event_type);
CREATE INDEX IF NOT EXISTS statistics_created_at_idx ON statistics(created_at);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all" ON statistics FOR ALL USING (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('theme', '"dark"'),
  ('ai_instructions', '""'),
  ('user_api_key', '""'),
  ('default_niche', '"Pokemon Investing"'),
  ('language', '"es"')
ON CONFLICT (key) DO NOTHING;
