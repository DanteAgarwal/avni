# Hamari Sukoon Wali Jagah

A small, calming client-side note/poetry wall built as a static site that stores content in Supabase. It supports note types (normal, quiet, night, sealed) and poetry entries, realtime updates, and a simple input panel.

## Features
- Add notes (types: normal, quiet, night, sealed with unlock date)
- Add poetry entries
- Realtime wall updates (Supabase Realtime)
- Simple glass-like UI with responsive bottom sheet / floating panel
- Sealed messages remain locked until the specified date

## Tech
- Plain HTML/CSS/JS (ES module)
- Supabase JS client (CDN ESM)
- Static site, no build step required
- Runs in the provided dev container (Ubuntu 24.04)

## Files of interest
- `/index.html` — entire app, CSS + JS + embedded Supabase client usage
- `/README.md` — this file

## Local development (dev container)
1. Open the dev container (already running Ubuntu 24.04 in this workspace).
2. Serve the project folder as static files. From `/workspaces/avni` run:
   - Python: `python3 -m http.server 8000 --bind 127.0.0.1`
   - or Node: `npx http-server -p 8000`
3. Open the app in your host browser from the container:
   - In the container shell run: `"$BROWSER" "http://localhost:8000"`
   - Or open `http://localhost:8000` manually from the host.

Notes:
- The workspace provides common CLI tools (curl, git, docker, etc.) if needed.
- If the container is remote, ensure port 8000 is forwarded.

## Supabase setup
The app uses the Supabase JS client and expects two values in :
- `supabaseUrl` — your Supabase project URL
- `supabaseAnonKey` — your anonymous (public) API key

Options to configure keys:
- Quick (current): edit  and replace the constants directly.
- Better (recommended): create a small `config.js` (loaded before the main script) that sets `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`, then reference those in the script.
- For production, restrict access with Row Level Security (RLS) and policies; do not rely on client-side secrecy.

## Database schema (recommended)
Run the following SQL in Supabase SQL editor to create the tables used by the app:

```sql
-- Notes table
create table if not exists public.notes (
  id bigserial primary key,
  message text not null,
  type text not null default 'normal', -- 'normal'|'silent'|'night'|'sealed'
  unlock_date date,                     -- used when type = 'sealed'
  created_at timestamp with time zone default timezone('utc', now())
);

-- Poetry table
create table if not exists public.poetry (
  id bigserial primary key,
  lines text not null,
  created_at timestamp with time zone default timezone('utc', now())
);
```

Realtime:
- Supabase Realtime will broadcast inserts/updates. The app subscribes to `notes` and `poetry` for live updates.

Permissions:
- For a public app, the anon key can be used with limited RLS policies. Example basic policy: allow inserts but restrict selects to public if desired. Configure policies in the Supabase Dashboard.

## Running and testing
- Open the app, add notes or poetry, and watch them appear on the wall.
- For "sealed" notes, set an unlock date; content will remain hidden until that date.
- "Night" notes are only allowed between 20:00–06:00 (client-enforced).

## Security & production notes
- The anon key in the client is public by design; protect sensitive operations with server-side functions or use RLS.
- Add Row Level Security (RLS) policies in Supabase to control who can read/write rows.
- Consider moving write operations to a small backend if you must hide logic or keys.

## Deploy
- This is a static app — deploy to any static host (Netlify, Vercel, GitHub Pages, static S3 + CloudFront).
- Ensure environment keys are injected securely at build/deploy time.

## Contributing
- Make a fork/branch, keep changes small, and open a PR with a clear description.
- For UI changes, adjust  inline styles or extract styles to a CSS file as needed.

## License
- Add a license file (e.g., MIT) to the repo if you plan to open-source.

If you want, I can:
- Add a minimal config loader (config.js) to avoid editing  directly.
- Provide a small Node/Express proxy to keep the anon key server-side for write operations.