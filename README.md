# RPG Productivity Hub

A gamified productivity app where every task is a quest. Built with a retro JRPG pixel-art aesthetic, it turns your daily habits, to-dos, and projects into an RPG adventure — complete with gold, HP, mana, abilities, streaks, and a shop to spend your rewards.

Installable as a Progressive Web App (PWA) on desktop and mobile.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Build:** Vite + vite-plugin-pwa
- **Backend:** Supabase (PostgreSQL + anonymous auth)
- **Data Fetching:** TanStack Query
- **Deployment:** Vercel

---

## Prerequisites

- **Node.js 18+** — install via [nodejs.org](https://nodejs.org) or `brew install node`
- **A free Supabase account** — [supabase.com](https://supabase.com)
- *(Optional)* A free [Vercel](https://vercel.com) account for deployment

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/RPG-Based-Productivity-Management.git
cd RPG-Based-Productivity-Management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a **New Project**.
2. Once the project is ready, open the **SQL Editor**.
3. Paste the contents of `supabase/schema.sql` and run it. This creates all required tables, Row Level Security policies, and seed data.
4. Run any additional migration files in the `supabase/` folder in order:
   - `supabase/add_areas_migration.sql`
   - `supabase/add_habit_both_migration.sql`
   - `supabase/inbox_migration.sql`
5. Enable **Anonymous sign-ins**: go to **Authentication > Providers > Anonymous** and toggle it on.
6. *(Optional)* To enable weekly mana resets, enable the `pg_cron` extension in **Database > Extensions**, then run the cron schedule shown at the bottom of `schema.sql`.

### 4. Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find both values in your Supabase dashboard under **Settings > API**.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app will automatically create an anonymous session — no login required.

---

## Usage

### Core Concepts

| Feature | Description |
|---|---|
| **Dailies** | Recurring tasks that reset each day. Missing them costs HP. |
| **Todos** | One-time tasks with optional due dates. Overdue todos cost HP. |
| **Habits** | Trackable behaviors (good or bad). Good habits earn gold; bad habits cost HP. |
| **Projects** | Group related tasks together for larger goals. |
| **Shop** | Spend your earned gold on custom rewards you define. |
| **Abilities** | Special skills that cost mana (e.g., Pickpocket, Shadow Step, Smoke Bomb, Backstab). |

### Game Economy

| Action | Gold | HP |
|---|---|---|
| Complete a daily | +difficulty x 10 x streak multiplier (max 3x) | -- |
| Complete a todo | +difficulty x 10 | -- |
| Log a good habit | +difficulty x 5 | -- |
| Miss a daily | -- | -difficulty x 8 |
| Log a bad habit | -- | -difficulty x 6 |
| Overdue todo | -- | -difficulty x 10 |
| HP hits 0 (KO) | Gold reset to 0 | HP reset to max |

**Streak bonuses:** +50g at 7 days, +150g at 30 days, +500g at 100 days

**Rank progression:** Pickpocket > Cutpurse > Rogue > Shadow > Phantom > Shadow Master

### Installing as a PWA

Since the app is a Progressive Web App, you can install it on your device:

- **Desktop (Chrome/Edge):** Click the install icon in the address bar, or open the browser menu and select "Install app."
- **Mobile (iOS Safari):** Tap the share button, then "Add to Home Screen."
- **Mobile (Android Chrome):** Tap the browser menu, then "Add to Home Screen" or "Install app."

---

## Building for Production

```bash
npm run build
```

The output is written to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## Deploying to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com), import the repository, and Vercel will auto-detect the Vite framework.
3. Add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) in **Project Settings > Environment Variables**.
4. Deploy. The included `vercel.json` handles SPA routing and service worker headers automatically.

Alternatively, deploy from the command line:

```bash
npx vercel
```

---

## Project Structure

```
src/
  components/
    abilities/    Ability grid and cards
    dailies/      Daily task list, cards, and add form
    habits/       Habit section, cards, and form
    player/       Player panel, HP/mana bars, gold counter, KO overlay, avatar
    projects/     Project grid, cards, and form
    quote/        Daily motivational quote
    shared/       Reusable UI (PixelButton, PixelPanel, DifficultyGem, etc.)
    shop/         Shop grid, item cards, and add reward form
    todos/        Todo list, cards, and form
  context/        GameContext (KO overlay state)
  hooks/          Data hooks (usePlayer, useDailies, useHabits, useTodos, etc.)
  lib/            supabase.ts (client), gameRules.ts (gold/HP formulas)
  pages/          Dashboard.tsx
  types/          TypeScript type definitions
supabase/         SQL schema and migration files
```

---

## License

This project is for personal use. Feel free to fork and adapt it for your own productivity needs.
