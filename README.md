# Storm King Sustainability Field Report

**Live public prototype:** [sks-carbon-progress.stevenchenjy.chatgpt.site](https://sks-carbon-progress.stevenchenjy.chatgpt.site)

Storm King Sustainability Field Report is a public-facing prototype for Storm King School. It demonstrates how student sustainability work can be documented with explicit status, source, method, and evidence boundaries. It is not an official school data publication, and school results appear only after review.

Its primary information architecture is:

- `/` — **Overview**: a public definition of sustainability, Storm King’s Hudson Valley setting, and alignment with Truth, Respect, Responsibility, and Scholarship.
- `/start` — **START**: the working coordination purpose, proposed review workflow, public snapshot, and private/public boundary.
- `/carbon` — **Carbon Neutrality Plan**: the proposed framework, an evidence-gated target-attainment result, carbon inventory structure, and methodology.
- `/projects` — **Projects**: CLYNK and composting project structures with nullable, source-aware public metrics.

`/energy` remains available as a secondary monitored-energy prototype, but it is not part of the four-item primary navigation.

No public Storm King carbon goal, baseline, inventory, reduction result, offset quantity, START adoption history, CLYNK count, compost weight, or project carbon benefit is represented as fact. Unknown values remain `null` and render as pending rather than zero.

## Local setup

Requirements: Node.js 22.13 or later and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Quality gates:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:vercel
npm run verify
```

`npm run verify` runs TypeScript, ESLint, Vitest, the Vinext/Sites production build, and the conventional Next/Vercel build.

## Architecture in brief

Server pages and route handlers request normalized public models through provider interfaces:

```text
Public page or API route
  → server-only provider selector
  → mock provider (safe default)
     or HTTP JSON source → strict runtime validation → normalized public model
```

Each provider supplies provenance metadata for source, quality, publication state, availability, freshness, coverage, verification, and method. Selecting a real source never silently falls back to mock data: a missing, unavailable, or malformed source fails closed.

Seven JSON endpoints currently exist:

| Route | Public model |
| --- | --- |
| `/api/site-content` | Overview, START, and Carbon Neutrality Plan content |
| `/api/projects` | Public projects and structured metrics |
| `/api/carbon/overview` | Inventory overview and scopes |
| `/api/carbon/history` | Inventory/scenario history |
| `/api/energy/live` | Monitored-energy snapshot and impact summary |
| `/api/energy/history?range=24h\|7d` | Monitored-energy history |
| `/api/roadmap` | Secondary qualitative roadmap data |

See [ARCHITECTURE.md](./ARCHITECTURE.md), [DATA_MODEL.md](./DATA_MODEL.md), [INTEGRATIONS.md](./INTEGRATIONS.md), and [CLAIMS_AND_DATA_QUALITY.md](./CLAIMS_AND_DATA_QUALITY.md).

## Data update path

The recommended first production workflow is a governed Google Sheet plus a bound Apps Script whitelist adapter:

```text
Staff updates governed workbook
  → evidence and publication review
  → Apps Script emits strict versioned JSON
  → site-content/project validators
  → public pages
```

The workbook separates three ledgers:

1. **Gross emissions** — the only ledger used by the carbon target-attainment result.
2. **Retired credits/removals** — documented separately with retirement evidence.
3. **Project outcomes** — CLYNK containers/proceeds, compost mass, modeled project benefits, and other activity metrics.

Project outcomes never reduce the gross inventory automatically. Composting is not a carbon offset. CLYNK counts must come from a dated account report, not from bags or proceeds. A compost greenhouse-gas figure requires weighed material, a documented disposal baseline, and a named EPA WARM model version.

Implementation resources:

- [SPREADSHEET_UPDATE_GUIDE.md](./SPREADSHEET_UPDATE_GUIDE.md)
- [integrations/google-sheets/Code.gs](./integrations/google-sheets/Code.gs)
- [fixtures/site-content.example.json](./fixtures/site-content.example.json)
- [fixtures/start-public-snapshot.example.json](./fixtures/start-public-snapshot.example.json)

Supabase is the next-step option when the school needs multiple permission roles, structured audit queries, attachments, or more applications. It should expose the same provider contracts through reviewed public views or server routes with Row Level Security enabled.

## Provider selection

All selectors are server-only and default to `mock`:

| Variable | Supported values | Required configuration |
| --- | --- | --- |
| `SITE_CONTENT_PROVIDER` | `mock`, `snapshot` | `SITE_CONTENT_URL` for `snapshot` |
| `PROJECT_PROVIDER` | `mock`, `start-snapshot` | `START_PUBLIC_SNAPSHOT_URL` |
| `CARBON_PROVIDER` | `mock`, `inventory` | `CARBON_DATA_URL` for `inventory` |
| `ENERGY_PROVIDER` | `mock`, `revert` | Revert variables; official transport still required |
| `ROADMAP_PROVIDER` | `mock`, `config` | `ROADMAP_DATA_URL` for `config` |

Use `npm run providers:status` to print readiness and missing variable names without printing values or credentials.

## Carbon progress semantics

The published percentage is labeled as a **target-attainment result**, not “percent carbon neutral.” It uses:

```text
100 × (baseline gross − latest gross) ÷ (baseline gross − target gross)
```

The source must provide the approved goal, baseline and target years, comparable gross values, boundary, method, metric label, and update date. The validator checks the supplied percentage against the formula. The interface displays the supplied result and metric without converting it into a bounded progress-bar state. Credits and project outcomes stay outside the numerator.

## Mock and placeholder content

- `MockSiteContentProvider` uses official public Storm King sources for place and values, while keeping START adoption and carbon-plan result fields null.
- `MockProjectProvider` includes local prototype records named CLYNK Container Collection and Campus Composting; every count, weight, carbon estimate, period, and evidence link remains pending school review.
- `MockCarbonProvider` uses null scope totals and an illustrative index rather than invented tonnes.
- `MockRevertProvider` and `MockRoadmapProvider` remain secondary prototype providers.

Every synthetic section carries an explicit prototype disclosure. A blank means unavailable, not zero.

## Before real school data is activated

1. Approve START’s official expansion, adoption rationale, owner, date, public schema, and review cadence.
2. Approve the carbon goal, organizational/inventory boundary, baseline, target year, reporting-year policy, factors, and correction policy.
3. Build and review a comparable gross emissions inventory.
4. Define the retired-credit/removal policy and evidence requirements.
5. Obtain CLYNK reports and approve compost weighing/modeling procedures.
6. Assign data, methodology, publication, privacy, and verification owners.
7. Validate candidate snapshots in a non-public environment, including missing, zero, corrected, malformed, and unavailable cases.
8. Complete accessibility, institutional communications, privacy/legal, methodology, and final publication review.
