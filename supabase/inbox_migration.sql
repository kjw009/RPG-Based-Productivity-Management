-- ============================================================
-- Inbox — capture layer migration
-- Run in Supabase SQL Editor after schema.sql
-- ============================================================

-- Each player gets a sync_token UUID used by the Apps Script
-- so external sources can insert items without the service role key.
ALTER TABLE player
  ADD COLUMN IF NOT EXISTS sync_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Inbox items
CREATE TABLE IF NOT EXISTS inbox_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'manual'
                CHECK (source IN ('manual', 'tasks', 'gmail')),
  source_id   TEXT,       -- external dedup key (Keep note name, Gmail thread ID)
  source_meta JSONB,      -- { subject, from, body_preview, keep_title, … }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- prevent double-syncing the same external item
  UNIQUE (user_id, source_id)
);

ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inbox items"
  ON inbox_items FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS inbox_items_user_created
  ON inbox_items (user_id, created_at ASC);

-- ── RPC called by the Google Apps Script ─────────────────────────────────────
-- SECURITY DEFINER so it can bypass RLS. The only write path is:
-- "look up user_id by sync_token → insert one row". The anon key
-- is enough to call this; no service role key is needed in the script.

CREATE OR REPLACE FUNCTION insert_inbox_via_token(
  p_token       UUID,
  p_content     TEXT,
  p_source      TEXT  DEFAULT 'manual',
  p_source_id   TEXT  DEFAULT NULL,
  p_source_meta JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_id      UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM player WHERE sync_token = p_token
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid sync token';
  END IF;

  -- Silently skip duplicates for external sources
  IF p_source_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM inbox_items
    WHERE user_id = v_user_id AND source_id = p_source_id
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO inbox_items (user_id, content, source, source_id, source_meta)
  VALUES (v_user_id, p_content, p_source, p_source_id, p_source_meta)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
