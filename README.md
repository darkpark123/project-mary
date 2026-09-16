# Project Mary

**Connecting Christian medical professionals to the mission field.**

There are doctors, nurses, pharmacists, and technicians who want to use their
training to serve on short-term medical mission trips. There are churches and
organizations running those trips every month. Today they find each other by
word of mouth, through a PDF application, or not at all.

Project Mary is the connective tissue: a verified professional profile a
clinician builds once — the **Clinician Passport** — and a matching layer
that puts it in front of the trips that actually need their specialty, on
the dates they're actually free.

## What's built (v0)

- **Clinician Passport** — credentials (license numbers encrypted at rest),
  procedure capabilities, languages, availability windows, and service
  history, built once and reused across every organization.
- **Trip listings** — searchable by specialty, region, country, cost, and
  two explicit ethics fields (host-requested? named local partner?), since
  short-term missions have a real justice critique the platform takes a
  position on.
- **Compliance database** — every trip page shows the destination country's
  clinician registration requirements and estimated lead time, sourced from
  published research most volunteers and organizations never see.
- **Pastoral endorsement** — a one-click request to a clinician's sending
  pastor, confirmed by email — the trust layer secular mission-trip
  platforms don't have.
- **Organization tools** — post a trip, see who expressed interest, review
  the ethics disclosures on your own listing.

See [`DEPLOY.md`](./DEPLOY.md) for environment setup and deployment, and the
`/legal` pages in the running app for the current privacy/terms posture —
they're explicit about what's a draft versus what's been reviewed.

## Stack

Next.js (App Router, Server Actions) · TypeScript · Tailwind CSS ·
PostgreSQL via Prisma · NextAuth (credentials) · AES-256-GCM field
encryption for sensitive Passport data.

## Status

Early v0, not yet handling real user data in production. Known gaps —
email verification, outbound email, file upload for license/background-check
documents, and a legal review of the draft policy pages — are being closed
incrementally; see open issues.

## License

Not yet chosen — treat this repository as "all rights reserved" until a
`LICENSE` file is added.
