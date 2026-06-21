# GastosTelegramBot

Two-project repo: .NET 10 backend (ASP.NET Core Web API) + React 19 / Vite 8 frontend. PostgreSQL database. Telegram bot for expense/income tracking via inline keyboards.

## Quick start

```bash
# Prerequisites: .NET 10 SDK, Node 20+, Docker (optional)

# Backend (local)
cd Gastos.Backend
# Needs config.toml and .env with TELEGRAM_BOT_TOKEN, SERVER_IP etc.
dotnet run

# Frontend (local)
cd Gastos.Frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run lint       # ESLint flat config, JSX files only
npm run preview    # preview production build

# Everything via Docker
docker compose up -d   # reads .env at repo root
```

## Repo structure

```
Gastos.Backend/       .NET 10 Web API (target net10.0)
  Controller/         TransactionController, StatsController
  Data/               EF Core DbContext
  Models/             Category, Transaction, HarvestDetail (TransactionType enum)
  Dtos/               Request/response DTOs
  Repositoy/          TransactionRepository (note: typo in folder name)
  Services/           TelegramPoolingService (BackgroundService, long-polling)
  Helpers/            DateTimeHelper.ToUtc()
  config.toml         DB & Telegram config (gitignored, created locally)
  Gastos.Backend.slnx Solution file (.slnx format)

Gastos.Frontend/      React 19 + Vite 8 + Tailwind v4 + JSX
  src/
    pages/             TransactionsPage, StatsPage
    components/        Layout, TransactionForm, CategoryPieChart, IncomeExpenseChart
    hooks/             useTransactions, useStats
    config/api.ts      API base URL from VITE_API_BASE_URL or fallback to :8080
```

## Backend details

- **config.toml** (not in repo): `[telegram] token + allowed_user_id`, `[database]` or `[database_docker]` sections with host/name/user/password. The `database_docker` section is used when `DOTNET_RUNNING_IN_CONTAINER=true`.
- **HTTPS**: disabled when running in Docker (`app.UseHttpsRedirection()` skipped if `isDocker`).
- **DB schema** in `script.sql`: Categories, Transactions, HarvestDetails tables.
- **API base path**: `/api/Transaction`, `/api/Stats`.
- **Ports**: `8080` (Docker), `5016` (local HTTP), `7129` (local HTTPS).
- Telegram uses **long polling** (not webhooks), requires `telegram:token` and optional `telegram:allowed_user_id`.
- CORS allows `FRONTEND_CORS_ORIGINS` env var or defaults to `http://localhost:5173, http://127.0.0.1:5173, http://${SERVER_IP}:5173`.
- TransactionType: `0` = Expense, `1` = Income.
- All dates converted to UTC via `DateTimeHelper.ToUtc()`.

## Frontend details

- **Tailwind v4** via `@tailwindcss/vite` plugin in `vite.config.js`. The legacy PostCSS setup (`postcss.config.js`/`tailwind.config.js`) may be unused.
- **`VITE_API_BASE_URL`** env var sets backend URL (e.g. `http://192.168.1.10:8080/api`). Autodetects hostname as fallback.
- Root `package.json` has stale/leftover deps; use `Gastos.Frontend/package.json` for frontend.

## Docker

- `docker compose up -d` from repo root. Needs `.env` file with: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `TELEGRAM_BOT_TOKEN`, `SERVER_IP`, `APP_ENV`.
- Frontend hot-reloads via volume mount + `CHOKIDAR_USEPOLLING=true`.
- Backend mounts `config.toml` at `/app/config.toml`.

## Repo quirks

- The `Repositoy/` folder is a persistent typo (not `Repository`).
- `TransactionRepository` is instantiated directly in controllers (`new TransactionRepository(context)`) despite also being registered as scoped in DI.
- No tests found in repo.
- No `.env` file checked in; `.env*` is gitignored.
