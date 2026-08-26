# Integration readiness

This document describes the boundaries that exist before approved Storm King School data is available. It is not evidence that any real source is connected.

## Activation rules

Providers are selected only on the server. Mock is the safe default for every domain. An explicitly selected real provider either returns validated source data or fails closed; it never falls back to synthetic values.

Run:

```bash
npm run providers:status
```

The command prints selected provider names, readiness, and missing environment-variable names. It never prints values, URLs, keys, payloads, or other secrets.

## Carbon inventory

### Current boundary

Set `CARBON_PROVIDER=inventory` and provide an HTTP(S) `CARBON_DATA_URL` that returns the normalized version-1 document. The provider loads that document once per provider instance, validates it, and returns clones of the normalized public models.

Use the synthetic fixture and local validator before hosting a candidate file:

```bash
npm run validate:carbon -- fixtures/carbon-inventory.example.json
```

The validator prints normalized JSON when valid. When invalid, it reports field paths and reasons and makes no source or deployment change.

### Enforced rules

- Schema version must be exactly 1.
- Source identity, label, update time, methodology version, reporting period, and publication state are required.
- A public HTTP(S) evidence reference is required if any record is marked verified.
- A synthetic source must remain `prototype`; a real source cannot label itself `prototype`.
- Years must be plausible integers.
- Scope values are finite, nonnegative, or `null`.
- Scope identifiers are unique and limited to Scope 1/2/3.
- Units are limited to `tCO2e`, `kgCO2e`, and `illustrative index`.
- A public history series must use one unit.
- Reduction percentage is optional and is never calculated by the application.
- Gross emissions, offsets, and net emissions are optional explicit inputs in `tCO2e` or `kgCO2e`.
- Offsets or net emissions require a supplied gross value and calculation method; the application never derives or reconciles the arithmetic.
- Missing scopes remain missing; they are never interpreted as zero.

### Inputs still required from the school

- Approved reporting boundary and organizational/operational control approach
- Approved baseline and reporting-year convention
- Activity-data lineage and emissions-factor sources/versions
- Treatment of renewable instruments, offsets, removals, and corrections
- Decision about gross/net reporting and any explicit calculation method
- Verification authority and public evidence

The public contract can carry approved gross, offset, and net values but intentionally does not calculate them. Populate those fields only after the school approves the accounting method; never infer them by subtracting two unrelated values.

## Revert Tech

### What exists

- Server-only selector and configuration checks
- A transport interface that can later call an official API/export
- Strict normalization for snapshot, history, impact, units, numbers, enums, timestamps, and coverage
- Explicit coverage types: selected devices, selected zones, building, campus-wide, or unknown
- Nullable device count and nullable readings
- Freshness classification independent of data quality
- A five-minute clock-skew tolerance and strict future-timestamp rejection
- Replaceable `RevertCache` interface with a short process-local memory implementation
- Safe health-check states that never print configuration values
- Safe unavailable/misconfigured/upstream-error behavior

### What deliberately does not exist

- No guessed endpoint
- No guessed authentication header or flow
- No vendor-payload schema
- No portal scraping
- No campus-wide extrapolation
- No avoided-carbon conversion

`ENERGY_PROVIDER=revert` currently remains not ready even when credentials are present because no official transport contract has been reviewed. `RevertProvider.getMetadata()` reports unavailable/pending until a validated transport supplies a snapshot.

### Official information still needed

- API/export documentation and base URL
- Authentication method and credential rotation policy
- Current/history endpoints and pagination
- Units and timezone semantics
- Device/zone identifiers and approved public aggregation
- Update cadence, rate limits, timeouts, and retention
- Whether avoided energy is vendor-supplied and how its baseline is defined
- Confirmed monitored-device/zone/building coverage

The application freshness threshold defaults to 30 minutes after activation, but it must be reviewed against the official update cadence.

`REVERT_CACHE_TTL_SECONDS` defaults to 60. This cache is validated-data-only, process-local, and non-durable; it is an optimization boundary rather than a source of truth. A production transport must define timeout, retry, rate-limit, and last-success logging behavior before activation.

## START public snapshot

Set `PROJECT_PROVIDER=start-snapshot` and provide an HTTP(S) `START_PUBLIC_SNAPSHOT_URL` that returns the version-1 sanitized contract.

The accepted contract contains only:

- versioned public source metadata;
- public project identifier and title;
- approved category and public status;
- public summary;
- public milestone/stage/target;
- nullable reported result and its quality;
- public verification reference when a result or update is verified;
- nullable next public step;
- public update date and quality.

Unknown keys are rejected. The provider then maps each allowed output field individually. This is defense in depth: internal notes, identities, emails, blockers, private links, committee notes, faculty communications, concerns, and approval discussions cannot be serialized by spreading an upstream record.

Before activation, the school must approve the snapshot producer, schema versioning/correction policy, public result review, verification evidence, and ownership of each project update.

Use `fixtures/start-public-snapshot.example.json` as the version-1 reference. It is synthetic and contains a project with no measured impact yet. It is not an export of START.

## Roadmap configuration

Set `ROADMAP_PROVIDER=config` and provide an HTTP(S) `ROADMAP_DATA_URL` that returns the version-1 contract demonstrated by `fixtures/roadmap-config.example.json`.

The contract separates a nullable target, qualitative current stage, public actions, future goals, linked sanitized project IDs, method note, and optional numeric progress. Numeric progress is accepted only with a named metric; targets require methodology. Before activation, approve area ownership, target language, metric definitions, evidence/reference policy, update cadence, and the relationship between roadmap project IDs and the START public snapshot.

## Failure behavior

Public APIs return stable JSON errors without internal details:

| Category | HTTP | Meaning |
| --- | ---: | --- |
| `INVALID_REQUEST` | 400 | Unsupported public input such as an energy range |
| `INVALID_UPSTREAM_DATA` | 502 | External payload failed validation/normalization |
| `PROVIDER_MISCONFIGURED` | 503 | Selected provider lacks valid configuration |
| `PROVIDER_UNAVAILABLE` | 503 | Source/transport could not supply data |
| `INTERNAL_ERROR` | 500 | Unexpected safe fallback |

Every error response is `no-store`. Energy success responses are also `no-store`. Stale validated data may still return 200 with `meta.freshness.state = "stale"`; the client can distinguish it from live, unavailable, or malformed data without receiving invented replacement values.

## Deployment paths

- Sites/Cloudflare: `npm run build`; logical resources remain in `.openai/hosting.json`.
- Vercel/Next: `vercel.json` selects `npm run build:vercel`.
- Full local gate: `npm run verify` (or its `npm run check` alias) exercises both builds after typecheck, lint, and tests.

Secrets must remain server-only and must never use a `NEXT_PUBLIC_` prefix. No database, authentication, public diagnostics endpoint, private START connection, or deployment is required for these boundaries.

## Activation checklist

1. Validate candidate source documents locally; never activate an unreviewed URL directly in production.
2. Configure the selected provider and only its required server-side variables in a non-public preview environment.
3. Run `npm run providers:status` and `npm run verify` without printing values.
4. Exercise valid, empty, null, zero, stale, malformed, unavailable, and corrected-source cases.
5. Review rendered coverage, source, period, quality, publication, freshness, method, and verification language with the source owner.
6. Obtain institutional accessibility, communications, privacy/legal, methodology, and final publication approval.
7. Promote atomically; an invalid real selection must remain unavailable and must never fall back to mock.
