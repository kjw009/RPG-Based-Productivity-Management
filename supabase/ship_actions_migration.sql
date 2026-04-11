-- ============================================================
-- Ship Actions — cooldown tracking migration
-- Run in Supabase SQL Editor after schema.sql
-- ============================================================

-- One row per (user, action). Upserting on activation
-- refreshes activated_at without creating duplicate rows.
CREATE TABLE IF NOT EXISTS ship_actions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id    TEXT        NOT NULL,   -- 'resupply' | 'eagle_rearm' | 'charge_orbital'
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, action_id)
);

ALTER TABLE ship_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ship actions"
  ON ship_actions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ship_actions_user_id
  ON ship_actions (user_id);
