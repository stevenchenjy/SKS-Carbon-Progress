# Architecture

## Design objective

SKS Sustainability Progress must allow real, reviewed sources to replace local mock providers without changing the four public areas. It also must prevent a future public experience from inheriting private START Command Center or workbook fields.

## Request flow

```text
                         ┌─────────────────────────────┐
Browser ──> App Router ──┤ Public server-rendered UI   │
                         └──────────────┬──────────────┘
                                        │ plain typed data + provenance
                                        ▼
                         ┌─────────────────────────────┐
                         │ Server provider selector    │
                         │ site content / projects     │
                         │ carbon / energy / roadmap   │
                         └──────────────┬──────────────┘
                                        │ interface contract
                      ┌─────────────────┴─────────────────────────┐
                      ▼                                           ▼
          ┌───────────────────────┐          ┌────────────────────────┐
          │ Local mock adapters   │          │ Future reviewed adapters│
          │ safe defaults         │          │ transport → validation   │
          └───────────────────────┘          └────────────────────────┘

External/client consumer ──> /api/* route handler ──> same provider selector
```

The two public delivery surfaces are the server-rendered UI and JSON API routes. Both use the same provider contracts. Server pages do not call their own `/api` routes, avoiding a redundant network hop and duplicated error behavior.

## Layers

### UI

`app/` contains App Router pages, route-level loading/error states, shared public chrome, quality badges, empty states, and CSS/HTML charts. Page modules import server selectors; presentational components receive plain serializable props.

Charts use HTML and CSS with `d3-scale`, a lightweight visualization library, instead of a client chart runtime. A visually hidden data table provides an accessible equivalent. Missing points have a distinct treatment, and an entirely empty series renders an explicit empty state instead of a zero.

### Providers

Each domain has:

- `types.ts` — public model contracts
- `provider.ts` — interface only, including `getMetadata()`
- `server.ts` — server-only provider selection
- `providers/` — mock and future adapter implementations

This boundary prevents a client component from importing provider selection, configuration, or future credentials. UI modules never import the mock adapter directly. Server selectors read explicit provider names from environment configuration and default to mock. Unknown selections and incomplete real-provider configuration fail closed; they never silently substitute mock values.

Every adapter supplies `ProviderMetadata`, which separates record quality from source type, availability, publication state, verification, freshness, coverage, reporting period, and methodology. Pages and APIs derive provenance and time-sensitive copy from that contract instead of hard-coding mock labels. The Overview and START pages use the site-content provider; the Carbon page loads the plan and inventory providers independently; Projects uses the sanitized project provider. One verified record never implies that a whole page or institution is verified.

### Runtime validation boundary

External sources are never trusted because they satisfy a TypeScript type at compile time:

```text
HTTP response or candidate file (`unknown`)
  → strict versioned validator
  → normalized domain document
  → provider interface
  → public page/API
```

Validators reject unknown keys, malformed objects, unsupported enums/units, non-finite numbers, out-of-range values, invalid dates, inconsistent series units, duplicate identifiers/scopes, and unsafe verified-result shapes. Detailed field paths are retained for local validation and tests; public API errors expose only a safe category.

### Future APIs and adapters

- Site content: a validated versioned snapshot for Overview, START, and Carbon Neutrality Plan fields
- Carbon: validated normalized JSON over HTTP today; future CSV/spreadsheet imports should normalize into the same contract
- Energy: future official Revert transport using server-only credentials; normalized energy validation, health-check, and replaceable cache boundaries exist, but no endpoint or vendor schema is invented
- Projects: validated versioned START/public-workbook snapshot with structured metrics and field-by-field output whitelisting
- Roadmap: validated versioned roadmap configuration over HTTP, with qualitative progress as the default and numeric progress allowed only with a named metric

The Google Sheets adapter in `integrations/google-sheets/Code.gs` never returns a raw sheet. It maps only published rows into the site-content or project snapshot contract. Drafts, private file references, internal notes, and unsupported columns cannot cross the adapter/validator boundary.

### Near-real-time energy path

```text
official Revert transport (future)
  → unknown payload
  → strict snapshot/history/impact validation
  → provider-owned in-memory cache (`RevertCache` interface)
  → freshness classification (live / cached / stale)
  → public UI and APIs
```

The current memory cache is intentionally process-local and short-lived. It avoids duplicate reads within a warm process but is not durable storage and does not promise cross-instance consistency. Transport or validation failures never cause synthetic replacement data. A health-check method reports fixed safe states without exposing credentials or URLs.

## API routes

| Route | Provider method | Current result |
| --- | --- | --- |
| `/api/site-content` | `getOverview()` + `getStart()` + `getCarbonPlan()` | public-source narrative and safe placeholders |
| `/api/carbon/overview` | `getOverview()` | synthetic overview and scope structure |
| `/api/carbon/history` | `getHistory()` | synthetic indexed pathway |
| `/api/energy/live` | `getCurrentUsage()` + `getImpactSummary()` | simulated snapshot and impact |
| `/api/energy/history?range=24h\|7d` | `getHistoricalUsage()` | simulated series |
| `/api/projects` | `getPublicProjects()` | CLYNK/composting names with pending metrics |
| `/api/roadmap` | `getAreas()` | five illustrative pathways |

Energy routes use `Cache-Control: no-store` in preparation for a future time-sensitive feed. Every successful response includes source metadata. All routes use one safe error contract:

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "The selected data source is temporarily unavailable."
  }
}
```

Invalid requests return 400, malformed upstream data returns 502, unavailable or misconfigured providers return 503, and unexpected failures return a generic 500. Error responses are `no-store` and never include thrown messages, URLs, credentials, vendor payloads, or stack traces.

## Privacy and claim-safety boundaries

- No authentication or private operational data exists in this product.
- The START adapter maps fields one at a time. It never spreads or serializes an upstream record wholesale.
- Project metrics require a source label, unit, period for every numeric value, method for estimated emissions, and retirement evidence for any credit quantity.
- Gross-emissions progress, retired credits, and project outcomes are separate ledgers. The progress validator checks the documented target-attainment formula and never includes credits or projects in its numerator.
- The current mock carbon model uses null scope totals and a normalized index, not invented tonnes of carbon. A real inventory may supply explicit gross/offset/net fields, but the application does not infer or reconcile them.
- “Verified” public language is gated by a non-synthetic, reported, available source plus verified metadata and a public evidence reference. No current provider emits a verified school result.
- Fixed ISO timestamps and `freshness: not-applicable` keep mock output deterministic and prevent the simulation from masquerading as a real live feed.
- Environment secrets are read only in a future server selector, never in presentational components.
- Energy coverage defaults to selected-device or unknown wording; it becomes campus-wide only when validated source metadata says so.
- Roadmap percentages are optional and require a named metric. Mock roadmap areas use qualitative stages only.

## Configuration and diagnostics

`lib/providers/config.ts` owns every selector and related configuration check. Supported selections are site content `mock|snapshot`, carbon `mock|inventory`, energy `mock|revert`, projects `mock|start-snapshot`, and roadmap `mock|config`; all default to mock. Unknown values and missing or malformed required variables raise normalized provider errors instead of silently reverting to mock.

`npm run providers:status` reports only domain, selection, readiness, missing variable names, invalid variable names, and fixed operator notes. It is a local/server-side diagnostic, not a public API. Revert remains “not ready” even when variables exist until an official transport contract is implemented.

## Portability

The implementation uses the Next.js App Router, React Server Components, standard `Request`/`Response`, TypeScript, and CSS. Data-bearing pages are explicitly dynamic so provider selection, source availability, and freshness are evaluated at request time rather than frozen into a build. The current Sites production path uses Vinext and Cloudflare Worker-compatible ESM. `vercel.json` directs a future Vercel import to the conventional Next build. Runtime application code avoids filesystem access; the local carbon validator is a developer-only script. Advanced runtime-specific caching, PPR, database bindings, and Node-only server APIs are intentionally absent.
