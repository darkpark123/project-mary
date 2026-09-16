# Deploying Project Mary

## Before you go live - read this

This app currently:
- has draft legal pages (`/legal/terms`, `/legal/privacy`) that **no attorney has reviewed**
- collects medical license numbers (encrypted at rest), background-check status, and pastoral/religious affiliation - sensitive data in most jurisdictions
- has no email verification, password reset, or CAPTCHA yet

Get real users cautiously - a small named pilot group first, not an open public launch - until the legal pages are reviewed and the gaps above are addressed. See `/legal/privacy` §9 for the running list of what's not yet in place.

## 1. Push to GitHub

```bash
cd web
git add -A
git commit -m "Project Mary v0"
```

Create a new repo on GitHub (via github.com or `gh repo create`), then:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

## 2. Get a production Postgres database

Any of these work (all have a free tier):
- **Neon** (neon.tech) - fastest to set up, serverless Postgres
- **Supabase** (supabase.com) - the stack the original spec suggested
- **Vercel Postgres** - integrates automatically if you deploy on Vercel

Copy the connection string it gives you - you'll need it in step 4.

## 3. Deploy on Vercel

1. Go to vercel.com, sign in, "Add New Project", import your GitHub repo.
2. Set the **root directory** to `web` (the Next.js app lives in the `web/` subfolder, not the repo root).
3. Vercel auto-detects Next.js - no other build config needed.

## 4. Set environment variables (Vercel project → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | The Postgres connection string from step 2 |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` - **back this up somewhere safe**, losing it makes encrypted license numbers unrecoverable |

Deploy. The build runs `prisma migrate deploy` automatically (see `package.json`), which creates all tables on first deploy using the migration in `prisma/migrations/`.

## 5. Seed initial data (optional, one-time)

From your machine, with `DATABASE_URL` pointed at production:

```bash
DATABASE_URL="<production-url>" npm run seed
```

This adds the compliance database entries (Uganda/Ghana/Guatemala) and a demo organization. Safe to skip or run once.

## Local development

```bash
brew install postgresql@16
brew services start postgresql@16
createdb project_mary_dev
cp .env.example .env   # fill in DATABASE_URL=postgresql://localhost:5432/project_mary_dev, plus AUTH_SECRET and ENCRYPTION_KEY
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## Custom domain

Add it under Vercel project → Settings → Domains. Vercel issues an HTTPS certificate automatically.
