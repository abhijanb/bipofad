# BIPOFAD — Digital Silver & Gold Savings

Start saving silver or gold with as little as **Rs 10**.

BIPOFAD is a digital metal vault: add money to your wallet, buy fractional
silver or gold at the current rate, watch your collection grow, and redeem it
for physical metal or its equivalent value.

> Current status: authentication, the wallet, buy/sell, and savings goals are
> working. Recurring buys and physical redemption are still being built.

## Tech stack

| Layer | Stack |
|---|---|
| Backend | FastAPI, SQLAlchemy (async), PostgreSQL, Alembic, Pydantic v2 |
| Frontend | React 19, TypeScript, Bun, Tailwind CSS, Redux Toolkit Query |
| Auth | JWT access + rotating refresh tokens, bcrypt |

## Project structure

```text
backend/
  alembic/            database migrations
  src/auth/           register, login, refresh, admin bootstrap
  src/goals/          savings goals and derived progress
  src/vault/          metal balances, collections, price history
  src/wallet/         wallet ledger and admin credits
  config.py           environment settings
  database.py         async session + engine
  models.py           User, RefreshToken, Product, PriceHistory, VaultCollection,
                      WalletTransaction
  main.py             FastAPI app + CORS

frontend/
  src/features/auth/    auth forms, guards, session
  src/features/goals/   savings goal card, progress, goal API
  src/features/product/ Silver/Gold switcher state
  src/features/vault/   vault cards, collect/sell forms, price chart
  src/features/wallet/  wallet ledger history
  src/pages/            home, auth, vault pages
  src/features/app/     RTK Query base API, store, shared UI
```

## Prerequisites

- Python 3.13+
- PostgreSQL
- [Bun](https://bun.com)
- (Windows) PowerShell or Git Bash

## Backend setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

On macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Create the database, then configure and migrate:

```bash
cd backend
cp .env.example .env
# edit .env with your database URL and secret key
alembic upgrade head
uvicorn main:app --reload --port 8000
```

The API is available at `http://localhost:8000`; interactive docs are at
`http://localhost:8000/docs`.

### Backend environment variables

Copy `backend/.env.example` to `backend/.env`.

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | local PostgreSQL URL | Async SQLAlchemy connection string |
| `ENVIRONMENT` | `development` | `development`, `test`, or `production` |
| `DEBUG` | `false` | SQLAlchemy echo / debug mode |
| `CORS_ORIGINS` | local frontend origins | Comma-separated origins or a JSON array |
| `SECRET_KEY` | dev-only value | JWT signing key; **required in production** |
| `DEMO_BALANCE_PAISA` | `0` | Starting wallet balance for new users (demo only) |
| `ADMIN_EMAIL` | — | One-time admin bootstrap only |
| `ADMIN_USERNAME` | — | One-time admin bootstrap only |
| `ADMIN_PASSWORD` | — | One-time admin bootstrap only |

In production (`ENVIRONMENT=production`), startup fails if:

- `SECRET_KEY` is missing, still a placeholder, or shorter than 32 bytes
- `CORS_ORIGINS` contains `*` (credentials are enabled)
- `DEBUG=true`

Generate a secret key with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## Frontend setup

```bash
cd frontend
bun install
cp .env.example .env
bun run dev
```

The dev server runs at `http://localhost:3000`.

| Script | Command | Purpose |
|---|---|---|
| Dev | `bun run dev` | Hot-reloading dev server |
| Build | `bun run build` | Production bundle in `dist/` |
| Start | `bun run start` | Serve the production build |
| Typecheck | `bun run typecheck` | `tsc --noEmit` |

### Frontend environment variables

Copy `frontend/.env.example` to `frontend/.env`.

| Variable | Example | Purpose |
|---|---|---|
| `BUN_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL |

`BUN_PUBLIC_API_URL` is baked into the browser bundle at build time. Set it
before running `bun run build` for production.

## Create the first admin

Admin price management is restricted to superusers. Create or promote one with
the environment-driven bootstrap command, run from `backend/`:

```bash
python -m src.auth.create_admin
```

| Variable | When needed | Purpose |
|---|---|---|
| `ADMIN_EMAIL` | Always | Existing user → promoted; new email → account created |
| `ADMIN_USERNAME` | Only when creating | Username for the new admin |
| `ADMIN_PASSWORD` | Only when creating | Password for the new admin |

**Create a new admin (PowerShell):**

```powershell
cd backend
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_PASSWORD = "choose-a-strong-password"
python -m src.auth.create_admin
Remove-Item Env:ADMIN_PASSWORD
```

**Create a new admin (bash):**

```bash
cd backend
ADMIN_EMAIL=admin@example.com \
ADMIN_USERNAME=admin \
ADMIN_PASSWORD='choose-a-strong-password' \
python -m src.auth.create_admin
```

**Promote an existing user:**

```bash
cd backend
ADMIN_EMAIL=existing@example.com python -m src.auth.create_admin
```

Behavior:

- Existing email → sets `is_superuser=True`, keeps the existing password.
- Existing superuser → no-op.
- New email → validates against the same rules as registration and creates an
  active superuser with a zero wallet balance.
- The password is never printed.
- Exit codes: `0` success/no-op, `1` username conflict, `2` missing or invalid
  configuration.

You can also put `ADMIN_EMAIL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in
`backend/.env`. Remove the password from the file after the account is created.

## API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Create an account |
| `POST` | `/auth/login` | Public | Log in and receive tokens |
| `POST` | `/auth/refresh` | Public | Rotate the refresh token |
| `POST` | `/auth/logout` | Public | Revoke a refresh token |
| `GET` | `/auth/me` | Bearer | Current user |
| `GET` | `/vault?product=SILVER` (or `GOLD`) | Bearer | Wallet, metal balance, collections, cash-outs |
| `POST` | `/vault/collect` | Bearer | Buy silver or gold with wallet balance |
| `POST` | `/vault/sell` | Bearer | Cash out metal into the wallet |
| `GET` | `/goals` | Bearer | Savings goals with live progress |
| `GET` | `/goals/{id}` | Bearer | One savings goal |
| `POST` | `/goals` | Bearer | Create a goal for a metal |
| `PATCH` | `/goals/{id}` | Bearer | Change a goal's target weight |
| `DELETE` | `/goals/{id}` | Bearer | Delete a goal |
| `GET` | `/vault/prices?product=SILVER` (or `GOLD`) | Public | Recent metal price history |
| `POST` | `/vault/prices` | Superuser | Record a new metal price |
| `GET` | `/wallet/transactions` | Bearer | Wallet ledger history |
| `POST` | `/wallet/credit` | Superuser | Credit a user's wallet (testing/support) |

Money-moving `POST` endpoints (`/vault/collect`, `/vault/sell`,
`/wallet/credit`) require a client-generated `idempotency_key`. Retrying with
the same key and amount returns the original result instead of moving money
twice.

Money is stored as integer **paisa**; metal balances are stored as whole
**grams** (integer). Because grams are whole units, a purchase is charged only
for the grams it actually buys; any remainder stays in the wallet.
`POST /vault/collect`, `POST /vault/sell`, and `POST /vault/prices` accept a
`product` field (`SILVER` or `GOLD`; default `SILVER`).

Savings goals target a whole-gram weight. Progress is derived from the current
metal balance, so it updates automatically after a purchase.

Cash-out currently credits the user's wallet rather than paying to a bank.
Each product has a minimum cash-out weight (`products.min_cashout_grams`):
both Silver and Gold start at **1 g** in development.

## Build roadmap

See [`plan.md`](plan.md) for the full step-by-step learning roadmap.

- [x] Project foundation and environment config
- [x] Authentication and session handling
- [x] Vault domain model and silver/gold purchases
- [x] Gold product and Silver/Gold switcher
- [x] Admin price management
- [x] Admin bootstrap CLI
- [x] Wallet funding and transaction ledger
- [x] Sell / cash-out into wallet (minimum weight per metal)
- [x] Savings goals with derived progress
- [ ] Recurring buys
- [ ] Physical redemption workflow
- [ ] Admin operations dashboard
- [ ] Receipts and notifications
- [ ] Payments and KYC integration
- [ ] Tests, CI, and deployment
