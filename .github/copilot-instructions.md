# Copilot / AI agent instructions for this repository

Purpose: help an AI coding agent be productive quickly in this React + Laravel monorepo.

Quick summary
- Frontend: `client/` — React + Vite. Dev server runs on port `5173` (see `client/package.json`).
- Backend: `server/` — Laravel (PHP 8.2+, Laravel ^12). Dev server runs on `http://127.0.0.1:8000` by default.
- The front-end proxies `/api` to the Laravel backend (see `client/vite.config.js`).

Essential commands (Windows PowerShell)
- Install backend deps and setup (recommended):
  - `cd .\server` 
  - `composer install`
  - `composer run setup`    # copies .env, generates key, runs migrations, runs `npm install` and builds frontend as defined in composer.json
- Start combined development (recommended):
  - `cd .\server` 
  - `composer run dev`      # runs `php artisan serve`, queue listener and `npm run dev` via `npx concurrently`
- Or run front/back separately:
  - `cd .\server` && `php artisan serve` (starts backend at 8000)
  - `cd .\client` && `npm install` && `npm run dev` (starts Vite dev server at 5173)
- Run backend tests:
  - `cd .\server` && `composer run test` (runs `php artisan test`)

Architecture & important patterns
- Two top-level projects in this repo: `client/` (React) and `server/` (Laravel). Treat them as two cooperating services.
- Frontend <-> Backend API: API endpoints are namespaced under `/api` (see `server/routes/api.php`). The client sets the base API URL in `client/src/api/axios.js`:
  - `baseURL: 'http://localhost:8000/api'`
  - Uses `withCredentials: true` and a helper `setToken(token)` to set `Authorization: Bearer <token>` on the Axios instance. When working on auth, modify `src/api/axios.js` or call `setToken()` directly.
- API auth: Laravel Sanctum is used (routes grouped with `auth:sanctum` middleware in `server/routes/api.php`). Expect cookie-based auth in some flows and token-based in others — check controllers under `server/app/Http/Controllers/` for exact behavior.
- Database: `server/config/database.php` defaults to `sqlite` (database file: `database/database.sqlite`) unless `DB_CONNECTION` is set. The composer `post-create-project-cmd` touches `database/database.sqlite` automatically.

Project-specific conventions
- API structure: Most server endpoints live in `server/routes/api.php` and map to controllers in `server/app/Http/Controllers/`. Use that file to quickly discover endpoints used by the frontend.
- Frontend routing: client uses `react-router` with a clear split between public pages and admin pages in `client/src/router.jsx`. Admin pages are under `/admin` and located in `client/src/pages/admin/`.
- File alias: Vite config aliases `@` to `client/src` (see `client/vite.config.js`). Use `@/...` imports in the front-end.
- Frontend API client: `client/src/api/axios.js` centralizes axios configuration. Use this instance across features so headers, credentials, and baseURL stay consistent.

Debugging tips / quick references
- If the client cannot reach APIs in dev, confirm `vite.config.js` proxy target and `php artisan serve` are running on `127.0.0.1:8000`.
- To create a .env quickly (if missing): `cd .\server` and `copy .env.example .env` or run `composer run setup` which does this automatically.
- Database migrations: `cd .\server` && `php artisan migrate` (or `migrate:fresh --seed` for a clean DB).
- If you need to debug API routing, check `server/routes/api.php` and the corresponding controller. Controller methods are short and expressive — use them to find validation rules and response format.

Where to look first (examples)
- API base client: `client/src/api/axios.js` (how requests, auth headers are set)
- Frontend routes/layout: `client/src/router.jsx` and `client/src/pages/` (public vs admin)
- Vite proxy and alias: `client/vite.config.js`
- Backend routes: `server/routes/api.php` (full endpoint catalog)
- Backend controllers: `server/app/Http/Controllers/` (business logic)
- Database config: `server/config/database.php` (sqlite by default)
- Composer scripts: `server/composer.json` (see `setup`, `dev`, `test` for common workflows)

Agent behavioral guidance (how to make helpful edits here)
- When changing API contracts, update both `server/routes/api.php` (or controller) and client calls in `client/src` — the repo keeps client and server together.
- Prefer editing `client/src/api/axios.js` for cross-cutting API changes (baseURL, headers, timeouts) rather than scattering axios config.
- For dev environment edits, assume the maintainer runs on Windows PowerShell (shell-specific commands are in this file). Use `composer run dev` for multi-process dev runs.
- Avoid changing database driver assumptions silently — this repo expects SQLite in dev; if switching to MySQL, document steps and update `.env.example`.

If anything here is unclear or you'd like examples added (e.g., sample `php artisan` flows, typical PR checklist for this repo), tell me which area to expand and I will iterate.
