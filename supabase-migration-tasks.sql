-- Migration: Improved Tasks System with Date Support
-- Run this in Supabase SQL Editor

-- Drop old tables if they exist (backup data first if needed!)
DROP TABLE IF EXISTS daily_todos;
DROP TABLE IF EXISTS tomorrow_todos;

-- New unified tasks table with date support
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL, -- The date this task belongs to (YYYY-MM-DD)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster date queries
CREATE INDEX IF NOT EXISTS tasks_date_idx ON tasks(date);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow all operations (single user app)
DROP POLICY IF EXISTS "Allow all" ON tasks;
CREATE POLICY "Allow all" ON tasks FOR ALL USING (true);
