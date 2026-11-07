# BIPOFAD Build Plan

The build order for the digital silver and gold savings app, organized as
learning steps. Each step should be demoable before moving to the next one.

## The roadmap

### Step 0 — Foundation ✅

- **Built:** FastAPI + PostgreSQL + Alembic, React + Bun + Tailwind, Redux
  Toolkit Query, env config.
- **Learned:** project structure, migrations, API wiring.

### Step 1 — Authentication ✅

- **Built:** register, login, JWT access + refresh rotation, lockout, guards,
  session revalidation.
- **Learned:** password hashing, tokens, protected routes, auth state.

### Step 2 — Domain model ✅

- **Built:** `User`, `Product`, `PriceHistory`, `VaultCollection`, cached
  wallet/silver/gold balances, SILVER and GOLD seeds.
- **Learned:** relational modeling, constraints, migration chains.

### Step 3 — Buy silver or gold ✅

- **Built:** multi-metal vault summary, collect endpoint, atomic wallet debit,
  paisa → grams conversion, collection history, Silver/Gold header switcher.
- **Learned:** DB transactions, concurrency, money precision, form validation.

### Step 4 — Admin price control ✅

- **Built:** superuser-only price entry, latest price, price history chart.
- **Learned:** role checks, admin UI, time-series display.

### Step 5 — Admin bootstrap ✅

- **Built:** env-driven `python -m src.auth.create_admin` command that creates
  or promotes a superuser.
- **Learned:** scripts, environment-based setup, safe role assignment.
- **Done when:** ✅ one command creates an admin, and the price card appears
  after login.

### Step 6 — Wallet funding + ledger ✅

- **Built:** `wallet_transactions` ledger, backfill from cached balances,
  superuser credit endpoint, wallet history API/UI, idempotent silver
  purchases, and a local-only pytest suite (gitignored) for reconciliation,
  retries, and insufficient balance.
- **Learn:** ledger design, idempotency keys, reconciliation, transaction
  boundaries.
- **Done when:** every balance change has a ledger row, retries cannot double
  charge, and reconciliation reports zero mismatches.

### Step 7 — Sell / cash-out redemption ✅

- **Built:** sell grams at the current price, per-product minimum weights
  (`SILVER` 1 g, `GOLD` 0.1 g), wallet credit, sale history, sale ledger rows,
  and idempotent retries.
- **Learn:** reversible money flows, pricing rules, rounding, failure handling.
- **Done when:** ✅ buy → sell back → wallet and ledger explain every paisa.
- **Later:** add a fee/spread and a real bank/cash payout step.

### Step 8 — Savings goals

- **Build:** goal amount or grams, progress bar, edit/delete, “keep buying
  until…” experience.
- **Learn:** derived state, UX feedback, CRUD.
- **Done when:** set a 10 g goal, buy, and see progress update automatically.

### Step 9 — Recurring savings

- **Build:** “buy Rs 100 every Friday” schedule, pause/resume, background job.
- **Learn:** schedulers, cron/workers, idempotent job execution.
- **Done when:** a scheduled buy runs once and never double-charges on retry.

### Step 10 — Physical redemption workflow

- **Build:** redemption request, minimum grams, delivery address, statuses
  (requested → approved → shipped → delivered), admin fulfillment.
- **Learn:** state machines, workflows, operational tooling.
- **Done when:** request physical silver and an admin can move it through every
  status.

### Step 11 — Admin operations dashboard

- **Build:** users, balances, price history, purchases, redemptions, manual
  adjustments, audit log.
- **Learn:** RBAC, admin UX, auditability.
- **Done when:** support can resolve a user issue without opening the database.

### Step 12 — Receipts and notifications

- **Build:** purchase receipt, monthly statement, email/SMS notifications,
  price alerts.
- **Learn:** async jobs, templating, delivery reliability.
- **Done when:** every purchase and redemption produces a receipt and
  notification.

### Step 13 — Real payments + KYC

- **Build:** eSewa/Khalti/connectIPS/bank integration, webhooks, refunds, KYC,
  limits.
- **Learn:** external APIs, webhook verification, reconciliation, compliance
  basics.
- **Done when:** real money can enter and exit with an auditable trail.

### Step 14 — Production readiness

- **Build:** tests, CI, Docker/deploy, backups, monitoring, rate limiting,
  migration runbook.
- **Learn:** testing money paths, observability, deployment.
- **Done when:** a failed deploy or server restart does not lose money or data.

## Repeat this loop for every step

1. Model + migration
2. Pydantic schema
3. `query.py` / `mutation.py`
4. `router.py`
5. Frontend types + RTK Query endpoints
6. Components/page
7. Manual test + automated test
8. Commit

That is the same structure already used for `auth` and `vault`.

## Rules that will save you later

- One feature per commit.
- Don't start Step N+1 until Step N is demoable.
- Test the failure cases: insufficient balance, stale price, double-click,
  retry.
- The ledger is the truth; balances are a cache.
- Keep money in integer paisa, grams in `Decimal`.
- Every admin action must be auditable.

## Next step

**Step 8 — savings goals.** Set a goal in rupees or grams, buy toward it, and
show progress automatically.
