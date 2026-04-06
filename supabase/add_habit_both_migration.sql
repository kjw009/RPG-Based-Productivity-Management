-- Migration: allow habits.type = 'both'
-- Run this in Supabase Dashboard → SQL Editor

-- Drop the old check constraint (name may vary; this covers the default Supabase naming)
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_type_check;

-- Add updated constraint that includes 'both'
ALTER TABLE habits
  ADD CONSTRAINT habits_type_check
  CHECK (type IN ('good', 'bad', 'both'));
