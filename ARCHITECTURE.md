# Architecture

## Design objective

SKS Carbon Progress must allow real, reviewed sources to replace local mock providers without changing public page composition. It also must prevent a future public experience from inheriting private START Command Center fields.

## Request flow

```text
                         ┌─────────────────────────────┐
Browser ──> App Router ──┤ Public server-rendered UI   │
                         └──────────────┬──────────────┘
                                        │ plain typed data + provenance
                                        ▼
                         ┌─────────────────────────────┐
                         │ Server provider selector    │
                         │ carbon / energy / projects  │
                         │ roadmap                     │
                         └──────────────┬──────────────┘
                                        │ interface contract
                      ┌─────────────────┴─────────────────┐
                      ▼                                   ▼
          ┌───────────────────────┐          ┌────────────────────────┐
          │ Local mock adapters   │          │ Future reviewed adapters│
          │ selected today        │          │ not selected/connected  │
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

This boundary prevents a client component from importing provider selection, configuration, or future credentials. UI modules never import the mock adapter directly. Every adapter also supplies `ProviderMetadata` (`synthetic`, quality status, provider id, source label, and disclosure). Pages and APIs derive provenance and time-sensitive copy from that contract instead of hard-coding mock labels.

### Future APIs and adapters

- Carbon: future CSV, API, or database inventory adapter; contract intentionally unimplemented
- Energy: future Revert Tech API/export adapter using server-only `REVERT_API_URL` and `REVERT_API_KEY`; no endpoint invented
- Projects: future START public snapshot JSON adapter that whitelists only approved fields
- Roadmap: future reviewed reporting source can implement `RoadmapProvider`

## API routes

| Route | Provider method | Current result |
| --- | --- | --- |
| `/api/carbon/overview` | `getOverview()` | synthetic overview and scope structure |
| `/api/carbon/history` | `getHistory()` | synthetic indexed pathway |
| `/api/energy/live` | `getCurrentUsage()` + `getImpactSummary()` | simulated snapshot and impact |
| `/api/energy/history?range=24h\|7d` | `getHistoricalUsage()` | simulated series |
| `/api/projects` | `getPublicProjects()` | fictional public-safe projects |
| `/api/roadmap` | `getAreas()` | five illustrative pathways |

Energy routes use `Cache-Control: no-store` in preparation for a future time-sensitive feed. Every successful response includes synthetic/prototype provenance.

## Privacy and claim-safety boundaries

- No authentication or private operational data exists in this product.
- The START adapter maps fields one at a time. It never spreads or serializes an upstream record wholesale.
- The current carbon model uses null scope totals and a normalized index, not invented tonnes of carbon.
- “Verified” appears only as methodology language or as a future adapter state; no current provider emits a verified school result.
- Fixed ISO timestamps keep mock output deterministic and prevent the simulation from masquerading as a real live feed.
- Environment secrets are read only in a future server selector, never in presentational components.

## Portability

The implementation uses the Next.js App Router, React Server Components, standard `Request`/`Response`, TypeScript, and CSS. The current Sites production path uses Vinext and Cloudflare Worker-compatible ESM. The separate `build:vercel` script exercises the conventional Next build for future Vercel deployment. Advanced runtime-specific caching, PPR, database bindings, and Node-only APIs are intentionally absent.
