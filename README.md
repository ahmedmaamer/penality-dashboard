# ⚽ Penalty Tracker

A Next.js web app that reads player penalty data from an Excel file and displays it as a color-coded table. Deployable on Vercel for free.

## How it works

- `public/PENALTY.xlsx` is the "database"
- The `/api/players` route reads and parses it on each request
- The frontend renders a styled table with green (1) / red (0) cells, percentages, and sorting

## Local development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Done — you'll get a live URL.

### Option B — GitHub + Vercel dashboard

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new
3. Import the repo
4. Click **Deploy** (no env vars needed)

## Updating players

Replace `public/PENALTY.xlsx` with your new file (keep the same structure: a row with NOM header, columns of 0/1 values). Commit and push — Vercel auto-redeploys.

## Excel file structure expected

| NOM    | 1 | 2 | 3 | ... |
|--------|---|---|---|-----|
| PLAYER | 1 | 0 | 1 | ... |

The app auto-detects the header row and all test columns.
