# Data model

All dates and timestamps are ISO strings. Models use plain arrays and objects so they can cross JSON and React Server Component boundaries. Data-bearing records include a quality state from `DataQuality`: `measured`, `estimated`, `verified`, `prototype`, or `pending`.

Only `prototype` and `pending` describe this prototype’s current content.

## Provider metadata

Every domain provider implements `getMetadata()` and returns `ProviderMetadata`. It intentionally keeps distinct dimensions separate:

- `synthetic` — whether the source is a fixture/prototype
- `status` — record-level confidence vocabulary (`measured`, `estimated`, `verified`, `prototype`, or `pending`)
- `publicationStatus` — `prototype`, `draft`, or `reported`
- `availability` — `available`, `partial`, or `unavailable`
- `freshness` — `live`, `cached`, `stale`, `unavailable`, or `not-applicable`, plus observation time and threshold
- `coverage` — a typed coverage kind, public label/note, and optional monitored-device count
- `reportingPeriod` — explicit start, end, and public label when relevant
- `provider`, `sourceLabel`, and `disclosure` — provenance and public explanation
- `sourceType` — synthetic, inventory, vendor feed, public snapshot, spreadsheet snapshot, configured roadmap, or unknown
- `verification` — an independent state, nullable public evidence reference, and optional note
- `methodologyNote` — short source-level method context when available

Stale and unavailable are not quality grades. “Reported” is a publication state, not proof that a value was measured or verified. The UI and API envelopes consume the structured metadata directly.

## Site content

### `SustainabilityOverviewContent`

Contains the public sustainability definition, Storm King place context, the alignment statements for Truth, Respect, Responsibility, and Scholarship, and approved public source URLs.

### `StartContent`

Contains the working introduction, nullable adoption rationale/owner/date, `working-purpose|confirmed` adoption status, public workflow, privacy boundary, and nullable snapshot cadence. Validation requires rationale, owner, and date before adoption can be labeled confirmed.

### `CarbonNeutralityPlanContent`

Contains the framework definition, nullable approved goal and years, nullable boundary and comparable gross values, nullable target-attainment percentage/method, a separate nullable retired-credit ledger with evidence, plan status, update date, quality, and framework stages. A percentage requires every calculation input and must match:

```text
100 × (baseline gross − latest gross) ÷ (baseline gross − target gross)
```

The raw percentage may be negative or exceed 100. The UI clamps only the visual bar. Synthetic snapshots cannot publish a percentage or retired-credit quantity.

## Carbon

### `CarbonOverview`

- `baselineYear` — illustrative baseline field
- `latestReportingYear` — illustrative latest-inventory field
- `reductionPercent` — nullable; deliberately null until an approved result exists
- `emissionsTrend` — claim-safe public status text
- `reportingStatus` and `quality` — current provenance
- `scopeBreakdown` — Scope 1, 2, and 3 summary records
- `totals` — nullable, explicitly supplied gross emissions, offsets, net emissions, accounting unit, and calculation method

Each scope summary identifies the source category, nullable value, unit, data quality, and explanatory note. The mock provider keeps all scope values null. `totals` is never calculated: supplying offsets or net emissions requires both gross emissions and a method statement, but the validator does not assume `net = gross − offsets`.

### `CarbonHistoryPoint`

A timeline point with `year`, nullable numeric `value`, provider-supplied `unit`, `kind`, `milestone`, explanatory `note`, and `quality`. `kind` distinguishes an inventory from a future scenario. The mock index tests the visualization without inventing real tCO₂e values; the contract also accepts future reviewed units such as tCO₂e without a UI change.

### `CarbonMethodology`

Documents the reporting boundary, baseline definition, emissions-factor policy, reporting-year convention, overall data-quality status, and an array of public methodology principles.

## Energy

### `EnergySnapshot`

Contains nullable current monitored power, monitored energy today, weekly trend, a provider-supplied ISO update timestamp, quality, and `EnergyCoverage`. Coverage can be campus-wide, selected devices, selected zones, one building, or unknown. It includes a public label/note and nullable monitored-device count. The UI uses monitored-load wording unless the validated coverage is explicitly campus-wide.

### `EnergyPoint`

A chart point with ISO timestamp, short display label, nullable value, explicit `kW` or `kWh` unit, and quality. Null is different from zero: null means missing, while zero is a real numeric value within the dataset.

### `EnergyImpact`

Contains nullable avoided-energy value, the comparison method used, and quality. The mock value is explicitly an illustrative comparison.

### `EnergyProvider`

- `getCurrentUsage()`
- `getHistoricalUsage('24h' | '7d')`
- `getImpactSummary()`

The UI depends on this interface, not on Revert-shaped fields.

## Projects

### `ProjectMilestone`

Contains a public label, stage, and target description.

### `PublicProject`

Contains only public identifiers, title, category/status, summary, milestone, structured `metrics`, nullable legacy result, result quality, nullable public verification reference, nullable next public step, ISO updated date, and update quality. `null` result means nothing has been measured or reported; it is not zero. A verified result or update requires a public reference at validation time. The model has no internal notes, contact fields, identities, concerns, private links, or approval discussions.

### `PublicProjectMetric`

Carries metric ID/label/type, nullable numeric value, unit, nullable reporting-period dates, quality, source label, nullable method/evidence, and optional sourced equivalencies. Every non-null value requires both period dates. Estimated emissions require a method. A retired-credit quantity requires public retirement evidence. Equivalencies require a non-null underlying value, method, and HTTP(S) factor source. Synthetic project snapshots keep all metric values null.

### `ProjectProvider`

`getPublicProjects()` returns public records only. The future START adapter whitelists the model fields rather than copying an internal record.

## Roadmap

### `RoadmapProgress`

Contains a public qualitative stage, optional percentage, optional metric label, and quality. A percentage is rendered only when both the number and its defensible metric label exist. Mock roadmap areas use categorical stages and `null` percentages to avoid fake precision.

### `RoadmapArea`

Contains an id, one of the five public pathway titles, explanatory summary, nullable target, progress object, public example actions, future goals, linked public-project IDs, and a nullable methodology note. A target requires a methodology note. Links are identifiers into the sanitized public-project collection, never START internal records.

### `RoadmapProvider`

`getAreas()` returns the public roadmap collection.

## Provenance in API responses

Domain models describe record-level quality. API envelopes add transport-level metadata:

```json
{
  "data": {},
  "meta": {
    "synthetic": true,
    "status": "prototype",
    "provider": "mock-carbon",
    "availability": "available",
    "publicationStatus": "prototype",
    "freshness": {
      "state": "not-applicable",
      "observedAt": "2026-08-22T00:00:00-04:00",
      "staleAfterMinutes": null
    },
    "coverage": {
      "kind": "inventory-boundary",
      "label": "Illustrative scope structure",
      "note": "No approved school boundary is represented.",
      "monitoredDeviceCount": null
    },
    "sourceType": "synthetic",
    "verification": {
      "state": "not-applicable",
      "reference": null,
      "note": "Synthetic prototype records are not eligible for verification claims."
    },
    "methodologyNote": "Illustrative structure only."
  }
}
```

This repetition is intentional: a consumer can see provenance even when it does not render every record field.

## Versioned external documents

### Site-content snapshot

The version-1 site-content document contains source metadata, `overview`, `start`, and `carbonPlan`. Validation rejects unknown keys, unsafe URLs, unsupported adoption/plan states, inconsistent synthetic/publication metadata, incomplete confirmed START adoption, unsupported carbon percentages, and credits without method/evidence. The developer fixture is `fixtures/site-content.example.json`.

### Carbon inventory document

The normalized carbon document uses `schemaVersion: 1` and contains source metadata, overview, history, and methodology. Runtime validation preserves null scopes and genuine zero, accepts only supported carbon units, requires consistent history units, rejects duplicate year/kind pairs and implausible future timestamps, and never derives reduction, offset arithmetic, or neutrality. A verified record requires an HTTP(S) evidence reference. The source supplies its reporting period and methodology version. The developer fixture is `fixtures/carbon-inventory.example.json`.

### START public snapshot

The snapshot uses `schemaVersion: 1`, explicit source metadata, and `publicProjects`. Validation is strict at the top level, source, project, milestone, metric, and equivalency objects. Unknown keys are rejected before the provider performs a second field-by-field whitelist. Project/metric periods cannot extend beyond snapshot generation, every numeric metric has a period, and verified impact requires public evidence. This makes accidental private-field transport a failed import rather than a silently ignored operational mistake. The developer fixture is `fixtures/start-public-snapshot.example.json`.

### Roadmap configuration document

The roadmap document uses `schemaVersion: 1`, source metadata, and `areas`. It enforces unique area IDs, valid qualitative stages, source/publication consistency, evidence for verified quality, and a five-minute future-clock tolerance. Percentage and metric label are an all-or-nothing pair, so a bare number cannot imply a defensible progress measure. The developer fixture is `fixtures/roadmap-config.example.json`.

### Normalized Revert fixture

`fixtures/revert-normalized.example.json` documents the adapter-facing snapshot, 24-hour and seven-day histories, and optional impact shape. This is not a vendor schema. It intentionally includes selected-device coverage, a genuine zero, a null value, and a stale observation so future transport mapping can be tested without a network call.

## Null, zero, and empty collections

- `null` means a value is unavailable or not yet reported. It never means zero.
- `0` is retained and rendered as a genuine numeric observation, including a zero-height chart bar on the baseline.
- `[]` means a validated source supplied no public records for that collection; pages and charts render explicit empty states.
- Unavailable providers do not return invented models. Pages use clearly labeled domain-specific fallbacks, while APIs return the safe error contract.
