-- ============================================================
-- RPG Productivity Hub — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Player
CREATE TABLE IF NOT EXISTS player (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name          TEXT NOT NULL DEFAULT 'Hero',
  rank_title    TEXT NOT NULL DEFAULT 'Cadet',
  hp            INTEGER NOT NULL DEFAULT 100,
  max_hp        INTEGER NOT NULL DEFAULT 100,
  mana          INTEGER NOT NULL DEFAULT 100,
  max_mana      INTEGER NOT NULL DEFAULT 100,
  xp            INTEGER NOT NULL DEFAULT 0,
  max_xp        INTEGER NOT NULL DEFAULT 1599,
  gold          INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User-defined area tags (e.g. "Learning", "Health", "Work")
-- Areas are stored by name on each entity (text[]), so this table
-- acts as the user's tag palette — rename/delete here, not on entities.
CREATE TABLE IF NOT EXISTS areas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Daily Tasks
CREATE TABLE IF NOT EXISTS daily_tasks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title               TEXT NOT NULL,
  recurrence_days     INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}',
  difficulty          INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  streak              INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  areas               TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('good', 'bad')),
  difficulty  INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  total_count INTEGER NOT NULL DEFAULT 0,
  areas       TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habit Logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id  UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  areas       TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Todos
CREATE TABLE IF NOT EXISTS todos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  areas           TEXT[] NOT NULL DEFAULT '{}',
  difficulty      INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  due_date        DATE,
  completed       BOOLEAN NOT NULL DEFAULT false,
  completed_at    TIMESTAMPTZ,
  overdue_checked BOOLEAN NOT NULL DEFAULT false,
  shadow_stepped  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shop Items
CREATE TABLE IF NOT EXISTS shop_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cost        INTEGER NOT NULL DEFAULT 0,
  type        TEXT NOT NULL CHECK (type IN ('consumable', 'custom_reward')),
  quantity    INTEGER NOT NULL DEFAULT 1,
  effect_type TEXT NOT NULL DEFAULT 'custom',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Abilities
CREATE TABLE IF NOT EXISTS abilities (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  effect_type    TEXT NOT NULL,
  mana_cost      INTEGER NOT NULL DEFAULT 0,
  uses_remaining INTEGER NOT NULL DEFAULT -1,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active Effects
CREATE TABLE IF NOT EXISTS active_effects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  effect_type  TEXT NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL,
  metadata     JSONB
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE player        ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_self"  ON player        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "areas_self"   ON areas         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "daily_self"   ON daily_tasks   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "habit_self"   ON habits        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "hlog_self"    ON habit_logs    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "proj_self"    ON projects      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "todo_self"    ON todos         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "shop_self"    ON shop_items    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "abil_self"    ON abilities     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fx_self"      ON active_effects FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SEED FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION seed_new_user(p_user_id UUID, p_name TEXT DEFAULT 'Hero')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM player WHERE user_id = p_user_id) THEN

    INSERT INTO player (user_id, name, rank_title)
    VALUES (p_user_id, p_name, 'Pickpocket');

    INSERT INTO abilities (user_id, name, description, effect_type, mana_cost, uses_remaining)
    VALUES
      (p_user_id, 'Pickpocket',  'Recover 30 gold when HP hits zero.',                                        'pickpocket',  20, -1),
      (p_user_id, 'Shadow Step', 'Extend one todo deadline by 3 days without HP penalty.',                    'shadow_step', 25, -1),
      (p_user_id, 'Smoke Bomb',  'One bad habit log this week does not cost HP.',                             'smoke_bomb',  30, -1),
      (p_user_id, 'Backstab',    'Triple gold from the next task completed while on a streak. Once per day.', 'backstab',    35, -1);

    INSERT INTO shop_items (user_id, name, description, cost, type, quantity, effect_type)
    VALUES
      (p_user_id, 'Health Potion',      'Restores 25 HP. Cannot exceed max HP.',     50, 'consumable', 1, 'health_potion'),
      (p_user_id, 'Double Gold Scroll', 'Doubles gold earned for the next 24 hours.', 80, 'consumable', 1, 'double_gold');

  END IF;
END;
$$;

-- ============================================================
-- MANA RESET (weekly, every Monday via pg_cron)
-- Enable pg_cron in Supabase Dashboard → Database → Extensions, then run:
--
--   SELECT cron.schedule(
--     'weekly-mana-reset',
--     '0 0 * * 1',
--     $$ UPDATE player SET mana = max_mana; $$
--   );
-- ============================================================
