# SKS Carbon Progress

SKS Carbon Progress is a public-facing climate transparency prototype for the Storm King School community. It is intentionally separate from the private SKS START Command Center. The site demonstrates how a future public platform could explain progress toward a lower-carbon campus through context, methodology, monitored-energy patterns, project stories, and student learning. No formal school target is represented until an approved target, baseline, boundary, and authority are supplied.

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
npm ci
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
npm run build:vercel
npm run verify
```

`npm run verify` runs TypeScript, ESLint, tests, the Vinext/Sites build, and the conventional Next/Vercel build. `npm run check` is an alias for the same gate. The primary Sites build uses Vinext for Cloudflare-compatible output. `vercel.json` explicitly selects `npm run build:vercel` for a future Vercel import, so Vercel does not accidentally run the Vinext build. No database, authentication, CMS, or paid backend is required.

The current Next lint plugin chain declares peer support through ESLint 9, so npm may print ESLint 9's lifecycle notice during a clean install. ESLint 10 cannot be adopted cleanly until those bundled React/import/accessibility plugins declare support; the pinned lint stack itself resolves without peer errors and passes. Recheck this constraint during the next Next.js dependency update.

Two developer tools support future integrations:

```bash
# Shows selected providers, readiness, and missing variable names—never secret values.
npm run providers:status

# Validates and prints a normalized candidate inventory without changing deployment state.
npm run validate:carbon -- fixtures/carbon-inventory.example.json
```

## Architecture in brief

Pages and route handlers request normalized data and provenance through domain-specific provider interfaces:

```text
Public UI ─┐
           ├──> server provider selector ──> local mock adapter (safe default)
API routes ┘                              └─> transport → validation → reviewed adapter
```

Server pages call providers directly; they do not fetch their own API routes. Presentation components receive plain typed data and provider metadata, and never import fixture modules. External JSON is accepted as `unknown`, checked at runtime, normalized, and only then exposed through the domain contracts. Provider metadata keeps record quality, source type, publication state, verification, availability, freshness, reporting period, coverage, and methodology separate. See [ARCHITECTURE.md](./ARCHITECTURE.md), [DATA_MODEL.md](./DATA_MODEL.md), [INTEGRATIONS.md](./INTEGRATIONS.md), and [CLAIMS_AND_DATA_QUALITY.md](./CLAIMS_AND_DATA_QUALITY.md).

## Mock data

All current providers are deterministic and local:

- `MockCarbonProvider` returns a synthetic indexed pathway and null scope totals so it cannot be mistaken for a school inventory.
- `MockRevertProvider` returns fixed 24-hour and seven-day sample series, a sample snapshot, an illustrative avoided-energy comparison, and explicit selected-device coverage.
- `MockProjectProvider` returns fictional, public-safe project cards with no internal or personal fields.
- `MockRoadmapProvider` returns five qualitative example pathways without invented completion percentages.

API responses repeat the provenance in `meta.synthetic`, `meta.status`, and provider identifiers. The energy API also returns the exact simulated-feed disclosure. The UI repeats a visible prototype notice near data-bearing sections.

## Future integration points

### Carbon inventory

`CarbonInventoryProvider` consumes the versioned normalized JSON contract demonstrated by `fixtures/carbon-inventory.example.json`. It validates source identity, synthetic/publication consistency, dates, reporting period, years, scopes, finite nonnegative measurements, supported units, quality states, history units, methodology, and evidence references before returning public data. Optional gross emissions, offsets, and net emissions are accepted only as explicit inputs with an accounting unit; offsets or net emissions also require a supplied gross value and calculation method. The application never calculates those relationships. Missing scopes remain `null`, and no reduction or neutrality claim is inferred. A future CSV or spreadsheet importer should normalize into this contract rather than bypass it.

### Revert Tech

`RevertProvider` separates configuration, future transport, normalized payload validation, health checks, and a replaceable cache interface. It expects `REVERT_API_URL`, `REVERT_API_KEY`, a freshness threshold, and a short cache TTL only when `ENERGY_PROVIDER=revert`. No official transport is implemented and no endpoint, authentication header, or vendor payload has been guessed. Until that contract exists, the provider reports itself as unavailable—not measured—and its data methods fail closed. Its normalized model and `fixtures/revert-normalized.example.json` already exercise selected-device/zone/building/campus-wide/unknown coverage, device count when supplied, null versus genuine zero, stale observations, history, and optional avoided-energy data.

### START Command Center

`StartSnapshotProvider` accepts only a versioned, sanitized snapshot from a configured HTTP(S) source. Runtime validation rejects unknown fields at every public contract boundary, including accidental private/internal fields. The mapper then whitelists fields again. Results are nullable and carry their own quality; a verified result requires a public verification reference. The complete synthetic contract is in `fixtures/start-public-snapshot.example.json`.

### Roadmap configuration

`ConfigRoadmapProvider` accepts `fixtures/roadmap-config.example.json`'s version-1 structure from an HTTP(S) source. Each area can carry a target, qualitative stage, public actions, future goals, linked public-project IDs, method note, and—only when defensible—a percentage paired with its named metric. The mock source intentionally uses qualitative stages and no percentage.

### Provider selection

All selectors are server-only and default to `mock`:

| Variable | Supported values | Additional configuration |
| --- | --- | --- |
| `CARBON_PROVIDER` | `mock`, `inventory` | `CARBON_DATA_URL` for `inventory` |
| `ENERGY_PROVIDER` | `mock`, `revert` | Revert variables; official transport still required |
| `PROJECT_PROVIDER` | `mock`, `start-snapshot` | `START_PUBLIC_SNAPSHOT_URL` |
| `ROADMAP_PROVIDER` | `mock`, `config` | `ROADMAP_DATA_URL` for `config` |

An explicit invalid or incomplete real-provider selection never silently falls back to mock data. APIs return a safe 502/503 envelope; the homepage renders only that domain as unavailable and leaves unrelated sections intact.

### Hosting and configuration

- `NEXT_PUBLIC_SITE_URL` supplies the trusted public origin for absolute social-preview metadata.
- Secrets remain server-only; never prefix `REVERT_API_KEY` with `NEXT_PUBLIC_`.
- No durable storage is declared in `.openai/hosting.json`.
- `.openai/hosting.json` is source configuration for the existing Sites project; `vercel.json` provides the separate future Vercel build override.
- Build output (`dist`, `.next`, `.vinext`), local environments, and installed dependencies are ignored and are not source inputs.

## Before real school data can be connected

1. Approve the public reporting boundary and baseline year.
2. Document activity-data sources, emissions factors, units, estimation rules, and correction policy.
3. Review Revert Tech’s official API/export contract and credential handling.
4. Define and approve the START public-snapshot schema and privacy review.
5. Establish who may label a result measured, estimated, or verified.
6. Validate real datasets in a non-public environment and obtain school approval before publication.
7. Review the default freshness threshold against the official Revert update cadence.
8. Run the validated real sources in a non-public environment and review coverage, stale/unavailable states, accessibility, and public wording.

## Public information architecture

The four-route structure was retained after reviewing institutional climate sites because it already gives a small-school audience a fast path through goal/context, carbon method, monitored energy, public projects, roadmap, and participation without creating thin duplicate pages. The homepage carries a no-form participation foundation for students, faculty, families, and partners, and directs visitors to existing school or methodology channels.

The design rationale draws on recurring patterns in the [Harvard Sustainability Action Plan](https://sustainable.harvard.edu/our-plan/), [Yale Sustainability Data Hub](https://sustainability.yale.edu/sustainability-data-hub), [Stanford Sustainability Data Hub](https://sustainable.stanford.edu/progress/data-hub/), [MIT greenhouse-gas inventory](https://sustainability.mit.edu/climate-action/decarbonize-our-campus/greenhouse-gas-inventory), and [Middlebury Middway Report](https://www.middlebury.edu/energy-2028/about-energy2028/middway-report): public goals should sit beside annual evidence, boundaries and accounting choices should be explicit, and participation should connect data to learning. No branding or wording was copied.

## Future deployment path

The project is ready for a later `local → GitHub → Vercel → custom domain` workflow, but this run intentionally does not initialize Git, create a repository, change access policy, or deploy. Before that handoff, decide which local folder becomes the repository root, add only source files (generated outputs are ignored), configure server-only variables in the host, run `npm ci && npm run verify`, preview every dynamic route, and complete institutional accessibility, communications, privacy, legal, methodology, and claims approval.
