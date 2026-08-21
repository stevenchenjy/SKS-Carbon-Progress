# SKS Carbon Progress

SKS Carbon Progress is a public-facing climate transparency prototype for the Storm King School community. It is intentionally separate from the private SKS START Command Center. The site demonstrates how a future public platform can explain the school’s carbon-neutrality pathway through context, methodology, energy patterns, project stories, and student learning.

This repository contains **synthetic data only**. No carbon figure, electricity reading, reduction, certification, project result, or verification status is a real Storm King School claim.

## What is included

- `/` — a storytelling-led homepage with an illustrative carbon overview, five-part roadmap, and simulated live-energy preview
- `/carbon` — scope structure, reporting boundary, example pathway, timeline, methodology, and reusable data-quality language
- `/energy` — current-energy cards plus accessible 24-hour and seven-day mock charts
- `/projects` — public-safe example project snapshots and a clear privacy boundary
- `/api/*` — server route foundations for carbon, energy, roadmap, and public-project data
- typed domain models and provider interfaces that keep the UI independent from mock fixtures
- accessible HTML/CSS charts scaled with the lightweight `d3-scale` visualization library
- unit, component, provider, API-route, and claim-safety tests

## Local setup

Requirements: Node.js 22.13 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check
```

The primary production build uses Vinext for OpenAI Sites/Cloudflare-compatible output. The application stays within portable Next.js App Router, Web API, TypeScript, and CSS patterns; `npm run build:vercel` is provided as the future Vercel compatibility gate. No database, authentication, CMS, or paid backend is required.

## Architecture in brief

Pages and route handlers request data and provenance through domain-specific provider interfaces:

```text
Public UI ─┐
           ├──> server provider selector ──> local mock adapter (today)
API routes ┘                              └─> reviewed external adapter (future)
```

Server pages call providers directly; they do not fetch their own API routes. Presentation components receive plain typed data and provider metadata, and never import fixture modules. That metadata drives source labels, disclosures, chart language, and update status, so selecting a reviewed adapter does not leave mock wording behind. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full boundary and [DATA_MODEL.md](./DATA_MODEL.md) for model definitions.

## Mock data

All current providers are deterministic and local:

- `MockCarbonProvider` returns a synthetic indexed pathway and null scope totals so it cannot be mistaken for a school inventory.
- `MockRevertProvider` returns fixed 24-hour and seven-day sample series, a sample snapshot, and an illustrative avoided-energy comparison.
- `MockProjectProvider` returns fictional, public-safe project cards with no internal or personal fields.
- `MockRoadmapProvider` returns the five required pathways with visibly illustrative stages and progress indicators.

API responses repeat the provenance in `meta.synthetic`, `meta.status`, and provider identifiers. The energy API also returns the exact simulated-feed disclosure. The UI repeats a visible prototype notice near data-bearing sections.

## Future integration points

### Carbon inventory

`CarbonInventoryProvider` is a deliberately unimplemented adapter boundary. Before connecting CSV, API, or database input, the school must approve the inventory schema, reporting boundary, emissions-factor sources, baseline, correction policy, and source-lineage rules.

### Revert Tech

`RevertProvider` defines the adapter surface and expects `REVERT_API_URL` and `REVERT_API_KEY`. It makes no requests today. No endpoint, authentication flow, or payload has been guessed. Implement it only after the official contract is reviewed, then select it in the server-only energy provider module.

### START Command Center

`StartSnapshotProvider` accepts only a future approved public snapshot. Its mapper whitelists public project fields individually instead of copying internal records. A future snapshot may contain public projects, milestones, and verified results; it must never include internal notes, faculty emails, private concerns, student identities, or approval discussions.

### Hosting and configuration

- `NEXT_PUBLIC_SITE_URL` supplies the trusted public origin for absolute social-preview metadata.
- Secrets remain server-only; never prefix `REVERT_API_KEY` with `NEXT_PUBLIC_`.
- No durable storage is declared in `.openai/hosting.json`.

## Before real school data can be connected

1. Approve the public reporting boundary and baseline year.
2. Document activity-data sources, emissions factors, units, estimation rules, and correction policy.
3. Review Revert Tech’s official API/export contract and credential handling.
4. Define and approve the START public-snapshot schema and privacy review.
5. Establish who may label a result measured, estimated, or verified.
6. Validate real datasets in a non-public environment and obtain school approval before publication.
7. Add monitoring, provider-failure handling, freshness rules, and an accessibility/content review for the connected experience.
