# RPG Productivity Hub — Setup Guide

## Prerequisites
- Node.js 18+ (install via https://nodejs.org or `brew install node`)
- A free Supabase account (https://supabase.com)
- A free Vercel account for deployment (https://vercel.com)

---

## 1. Install Dependencies

```bash
npm install
```

---

## 2. Set Up Supabase

1. Go to https://supabase.com → New Project
2. Once created, open **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run it — this creates all tables, RLS policies, and the seed function
4. *(Optional)* Enable `pg_cron` in **Database → Extensions**, then run the mana reset schedule shown at the bottom of `schema.sql`

---

## 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your values from **Supabase → Settings → API**:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 4. Run Locally

```bash
npm run dev
```

Open http://localhost:5173

---

## 5. Deploy to Vercel

```bash
npm run build         # verify the build passes first
```

Then either:
- Push to GitHub and connect the repo in the Vercel dashboard, **or**
- `npx vercel` from the project root

Set the same environment variables in **Vercel → Project → Settings → Environment Variables**.

The `vercel.json` in this repo handles SPA routing and service worker headers automatically.

---

## Game Rules Summary

| Action | Gold | HP |
|---|---|---|
| Complete daily (diff × 10 × streak mult, max 3×) | ✅ | — |
| Complete todo (diff × 10) | ✅ | — |
| Log good habit (diff × 5) | ✅ | — |
| Miss daily | — | -diff × 8 |
| Log bad habit | — | -diff × 6 |
| Overdue todo | — | -diff × 10 |
| HP hits 0 | Gold → 0 | → max HP |

**Streak bonuses:** 7-day +50g, 30-day +150g, 100-day +500g

**Rank titles:** Pickpocket → Cutpurse → Rogue → Shadow → Phantom → Shadow Master

---

## Folder Structure

```
src/
  components/
    abilities/   AbilityGrid, AbilityCard
    dailies/     DailyTaskList, DailyTaskCard, AddDailyForm
    habits/      HabitSection, HabitCard, HabitForm
    player/      PlayerPanel, HPBar, ManaBar, GoldCounter, KOOverlay, PixelAvatar
    projects/    ProjectGrid, ProjectCard, ProjectForm
    quote/       DailyQuote
    shared/      PixelButton, PixelPanel, DifficultyGem, StreakCounter, ProgressBar, SectionHeader
    shop/        ShopGrid, ShopItemCard, AddRewardForm
    todos/       TodoList, TodoCard, TodoForm
  context/       GameContext (KO overlay state)
  hooks/         usePlayer, useDailies, useHabits, useProjects, useTodos,
                 useShop, useAbilities, useGameEconomy, useDailyReset
  lib/           supabase.ts, gameRules.ts
  pages/         Login.tsx, Dashboard.tsx
  types/         index.ts
```
