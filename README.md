# GastosTelegramBot

Este repositorio contiene una aplicación completa para el seguimiento de gastos e ingresos. Está compuesta por dos proyectos principales:

-   **Backend:** Una API web en .NET 10 (ASP.NET Core Web API).
-   **Frontend:** Una interfaz de usuario construida con React 19 / Vite 8.

La aplicación utiliza una base de datos PostgreSQL y se integra con un bot de Telegram para el registro de transacciones mediante teclados inline, facilitando la gestión de finanzas personales.

## Características Clave

-   **Seguimiento de Transacciones:** Registra y gestiona gastos e ingresos.
-   **Clasificación por Categorías:** Organiza tus movimientos financieros con categorías.
-   **Interfaz de Usuario Web:** Visualiza tus finanzas y gestiona transacciones a través de una aplicación web.
-   **Bot de Telegram:** Añade transacciones de forma rápida y sencilla directamente desde Telegram.
-   **Gestión de Triaje:** Separa las transacciones nuevas para una revisión y confirmación antes de ser aprobadas.

## Estructura del Repositorio

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
    pages/             TransactionsPage, StatsPage, TriagePage (nueva)
    components/        Layout, TransactionForm, CategoryPieChart, IncomeExpenseChart
    hooks/             useTransactions, useStats, useTriageTransactions (nuevo)
    config/api.ts      API base URL from VITE_API_BASE_URL or fallback to :8080
```

## Cómo Empezar

### Prerrequisitos

-   SDK de .NET 10
-   Node.js 20+ (para el frontend)
-   Docker (opcional, para una configuración rápida)

### Backend (local)

```bash
cd Gastos.Backend
# Necesita config.toml y .env con TELEGRAM_BOT_TOKEN, SERVER_IP, etc.
dotnet run
```

### Frontend (local)

```bash
cd Gastos.Frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # compilación para producción
npm run lint       # ESLint flat config, solo archivos JSX
npm run preview    # previsualizar compilación de producción
```

### Todo con Docker

```bash
docker compose up -d   # lee .env en la raíz del repositorio
```

## Detalles Adicionales

-   **config.toml** (no incluido en el repositorio): Contiene la configuración de Telegram (`token` y `allowed_user_id`) y la base de datos (`database` o `database_docker`).
-   **HTTPS:** Deshabilitado cuando se ejecuta en Docker.
-   **Esquema de Base de Datos:** Definido en `script.sql` (tablas Categories, Transactions, HarvestDetails).
-   **Rutas de API:** `/api/Transaction`, `/api/Stats`.
-   **Puertos:** `8080` (Docker), `5016` (HTTP local), `7129` (HTTPS local).
-   **Telegram:** Utiliza long polling.
-   **CORS:** Permite orígenes definidos por la variable de entorno `FRONTEND_CORS_ORIGINS` o un valor por defecto.
-   **TransactionType:** `0` = Gasto, `1` = Ingreso.
-   **Fechas:** Todas las fechas se convierten a UTC.
-   **Tailwind v4:** Utilizado en el frontend.
-   **`VITE_API_BASE_URL`:** Variable de entorno para la URL base del backend.

## Notas del Repositorio

-   Hay un error tipográfico persistente en la carpeta `Repositoy/` (debería ser `Repository`).
-   `TransactionRepository` se instancia directamente en los controladores a pesar de estar registrado en DI.
-   No se encontraron tests unitarios en el repositorio.
-   El archivo `.env` no está versionado (está en `.gitignore`).