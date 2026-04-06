-- ============================================================
-- Migration: add areas support
-- Run this in Supabase SQL Editor if you already ran the
-- original schema.sql and need to add the new columns/table.
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS).
-- ============================================================

-- 1. Create the areas palette table
CREATE TABLE IF NOT EXISTS areas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'areas' AND policyname = 'areas_self'
  ) THEN
    CREATE POLICY "areas_self" ON areas FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Add areas column to each entity table (no-op if already present)
ALTER TABLE daily_tasks ADD COLUMN IF NOT EXISTS areas TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE habits      ADD COLUMN IF NOT EXISTS areas TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE projects    ADD COLUMN IF NOT EXISTS areas TEXT[] NOT NULL DEFAULT '{}';

-- todos used to have area (singular) — rename it and ensure it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'todos' AND column_name = 'area'
  ) THEN
    ALTER TABLE todos RENAME COLUMN area TO areas;
  END IF;
END $$;

ALTER TABLE todos ADD COLUMN IF NOT EXISTS areas TEXT[] NOT NULL DEFAULT '{}';
