# Money to receive

Track money owed to you. Add an entry, tick it off when it's received.

Stack: Next.js 16 (App Router, Server Actions) · Prisma 6 · Supabase Postgres · Tailwind 4. Single-user password login.

## Setup

1. Create a Supabase project and copy the two connection strings into `.env` (see `.env.example`).
   Also set `APP_PASSWORD` (your login password) and `AUTH_SECRET` (32+ random characters, signs the session cookie).
2. Install and create the table:
   ```bash
   npm install
   npm run db:push
   ```
3. Run it:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Deploy (Vercel)

Import the repo, add `DATABASE_URL`, `DIRECT_URL`, `APP_PASSWORD` and `AUTH_SECRET` as env vars, deploy. The build runs `prisma generate` automatically.

Sessions last 30 days. To log out everywhere, change `AUTH_SECRET`.

## Structure

```
prisma/schema.prisma            Receivable model
src/app/page.tsx                Totals, add form, Pending / Received / All tabs
src/app/login/page.tsx          Password form
src/proxy.ts                    Redirects to /login when not signed in
src/actions/receivables.ts      Server Actions: create, setReceived, delete
src/actions/auth.ts             Server Actions: login, logout
src/components/AddReceivableForm.tsx
src/components/ReceivableRow.tsx   Checkbox with optimistic tick-off
src/lib/session.ts              Signed session token (HMAC)
src/lib/auth.ts                 requireAuth() for pages and actions
src/lib/db.ts                   Prisma client
src/lib/money.ts                Paise ↔ ₹ formatting
```
