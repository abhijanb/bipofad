# BIPOFAD Frontend

React 19 + TypeScript + Bun + Tailwind CSS frontend for the digital silver and
gold savings app. See the [root README](../README.md) for backend setup,
environment variables, and the admin bootstrap command.

## Setup

```bash
bun install
cp .env.example .env
bun run dev
```

The dev server runs at `http://localhost:3000`.

## Scripts

| Command | Purpose |
|---|---|
| `bun run dev` | Hot-reloading dev server |
| `bun run build` | Production bundle in `dist/` |
| `bun run start` | Serve the production build |
| `bun run typecheck` | Type-check with `tsc --noEmit` |

## Environment

| Variable | Example | Purpose |
|---|---|---|
| `BUN_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL |

`BUN_PUBLIC_API_URL` is baked into the browser bundle at build time, so set it
before running `bun run build`.

## Structure

```text
src/
  features/app/    RTK Query base API, store, shared UI
  features/auth/   auth forms, guards, session handling
  features/home/    home dashboard sections
  features/product/ Silver/Gold product selection
  features/vault/   balance, collect/sell forms, price chart, admin price card
  features/wallet/ wallet ledger history
  pages/           home, auth, vault
```

Feature modules follow the same shape: `types.ts`, `schema.ts`, `*Api.ts`,
`components/`, and a page under `src/pages/`.
