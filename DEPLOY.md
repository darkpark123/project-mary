# Deploying Project Mary

## Before you go live - read this

This app currently:
- has draft legal pages (`/legal/terms`, `/legal/privacy`) that **no attorney has reviewed**
- collects medical license numbers, uploaded license/background-check documents (both encrypted at rest), and pastoral/religious affiliation - sensitive data in most jurisdictions
- accepts background-check documents without a defined retention/deletion policy - in the US, using these for placement decisions can trigger FCRA consumer-report obligations; **get legal advice on this specifically** before relying on them
- has email verification but no password reset or CAPTCHA yet
- stores uploaded documents in US-hosted infrastructure (Vercel Blob) by default - a cross-border transfer issue under GDPR for EU/UK clinicians

No amount of engineering closes these on its own. Get real users cautiously - a small named pilot group first, not an open public launch - until the legal pages are reviewed and the gaps above are addressed. See `/legal/privacy` §9 for the running list of what's not yet in place.

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

## 2b. Set up outbound email (Resend)

1. Create a free account at resend.com (no card required).
2. Grab an API key from the dashboard.
3. For real deliverability, verify a domain under Resend → Domains; until then, `onboarding@resend.dev` works for testing but only delivers to your own Resend account's email.

Skip this and the app still works - verification and endorsement emails just log server-side and show the link in the UI instead of sending it.

## 2c. Set up file uploads (Vercel Blob)

1. In your Vercel project → Storage tab → Create Database → Blob.
2. Connect it to your project; Vercel adds `BLOB_READ_WRITE_TOKEN` to your environment variables automatically.

Skip this and uploads fall back to local disk, which does not persist across serverless deploys - fine for local dev, not for production.

## 3. Deploy on Vercel

1. Go to vercel.com, sign in, "Add New Project", import your GitHub repo.
2. Set the **root directory** to `web` (the Next.js app lives in the `web/` subfolder, not the repo root).
3. Vercel auto-detects Next.js - no other build config needed.

## 4. Set environment variables (Vercel project → Settings → Environment Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | The Postgres connection string from step 2 |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` - **back this up somewhere safe**, losing it makes encrypted license numbers and uploaded documents unrecoverable |
| `RESEND_API_KEY` | From step 2b - optional, but real users need working email verification |
| `RESEND_FROM_EMAIL` | e.g. `Project Mary <noreply@yourdomain.com>` once you've verified a domain |
| `BLOB_READ_WRITE_TOKEN` | From step 2c - added automatically if you connect Blob storage in the Vercel dashboard |

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
                        # RESEND_API_KEY and BLOB_READ_WRITE_TOKEN are optional locally - see steps 2b/2c
npm install
npx prisma migrate dev
npm run seed
npm run dev
```

## Custom domain

Add it under Vercel project → Settings → Domains. Vercel issues an HTTPS certificate automatically.
