# Data model

All dates and timestamps are ISO strings. Models use plain arrays and objects so they can cross JSON and React Server Component boundaries. Data-bearing records include a quality state from `DataQuality`: `measured`, `estimated`, `verified`, `prototype`, or `pending`.

Only `prototype` and `pending` describe this prototype’s current content.

## Provider metadata

Every domain provider implements `getMetadata()` and returns `ProviderMetadata`: `synthetic`, `status`, `provider`, `sourceLabel`, and `disclosure`. The UI and API envelopes consume this metadata directly, which prevents a future adapter switch from leaving simulated source labels or mock provenance behind.

## Carbon

### `CarbonOverview`

- `baselineYear` — illustrative baseline field
- `latestReportingYear` — illustrative latest-inventory field
- `reductionPercent` — nullable; deliberately null until an approved result exists
- `emissionsTrend` — claim-safe public status text
- `reportingStatus` and `quality` — current provenance
- `scopeBreakdown` — Scope 1, 2, and 3 summary records

Each scope summary identifies the source category, nullable value, unit, data quality, and explanatory note. The mock provider keeps all scope values null.

### `CarbonHistoryPoint`

A timeline point with `year`, nullable numeric `value`, provider-supplied `unit`, `kind`, `milestone`, explanatory `note`, and `quality`. `kind` distinguishes an inventory from a future scenario. The mock index tests the visualization without inventing real tCO₂e values; the contract also accepts future reviewed units such as tCO₂e without a UI change.

### `CarbonMethodology`

Documents the reporting boundary, baseline definition, emissions-factor policy, reporting-year convention, overall data-quality status, and an array of public methodology principles.

## Energy

### `EnergySnapshot`

Contains nullable current power, energy today, weekly trend, a provider-supplied ISO update timestamp, and quality. Source labels and disclosure text belong to the provider metadata envelope rather than the reading itself.

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

Contains only `id`, `title`, public category, public status, summary, milestone, impact text, ISO updated date, and quality. It has no internal notes, contact fields, identities, concerns, or approval discussions.

### `ProjectProvider`

`getPublicProjects()` returns public records only. The future START adapter whitelists the model fields rather than copying an internal record.

## Roadmap

### `RoadmapProgress`

Contains a public stage, bounded percentage used by the progress indicator, and quality. Mock percentages are visibly labeled illustrative.

### `RoadmapArea`

Contains an id, one of the five public pathway titles, explanatory summary, progress object, example actions, and future goals.

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
    "provider": "mock-carbon"
  }
}
```

This repetition is intentional: a consumer can see provenance even when it does not render every record field.
