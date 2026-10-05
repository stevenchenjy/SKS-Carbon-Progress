# Storm King Sustainability Field Report

A public sustainability report for the Storm King community, connecting whole-school assessment, campus carbon planning, and student projects. The site helps readers see what a measure means, where its evidence comes from, and what still needs to be documented.

**[Explore the public prototype](https://sks-carbon-progress.stevenchenjy.chatgpt.site)**

## Explore the report

| Area | What you can explore |
| --- | --- |
| [Overview](https://sks-carbon-progress.stevenchenjy.chatgpt.site) | The Hudson Valley setting, the campus emissions measure, and the roles of START and carbon planning. |
| [START](https://sks-carbon-progress.stevenchenjy.chatgpt.site/start) | The Green Schools Alliance assessment framework, an aggregate public progress snapshot, and how students connect assessment to practical work. |
| [Carbon planning](https://sks-carbon-progress.stevenchenjy.chatgpt.site/carbon) | The goal, baseline, inventory boundary, target, and method needed to calculate emissions-reduction progress. |
| [Projects](https://sks-carbon-progress.stevenchenjy.chatgpt.site/projects) | CLYNK container collection and campus composting, with public metrics and supporting evidence when available. |

The secondary [Energy page](https://sks-carbon-progress.stevenchenjy.chatgpt.site/energy) demonstrates selected-device monitoring and accessible history charts.

## What is available today?

This is a public reporting prototype. The START page includes a static, aggregate assessment snapshot supplied for the public report. Its points, rating, and completed metrics describe progress within the START framework; they do not establish a campus emissions reduction or certification.

The carbon goal, approved baseline, comparable inventories, reduction result, and retired-credit quantities remain pending. CLYNK counts, compost weights, and modeled project benefits also await reviewed sources. Missing values stay unavailable instead of becoming zero.

The prototype is built around a few practical reporting choices:

- **Keep the evidence with the number.** Source, period, boundary, method, and quality are available alongside public metrics.
- **Separate different kinds of progress.** Gross campus emissions, documented retired credits, and individual project outcomes have distinct records. Project estimates do not automatically reduce the campus inventory.
- **Publish a public subset.** Provider contracts and the spreadsheet adapter are designed to expose reviewed summaries without private committee notes or personal details.
- **Make the report readable.** Server-rendered pages, native disclosures, keyboard navigation, and chart data tables keep the information accessible.

## Run locally

Requirements: Node.js 22.13 or later and npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The provider-backed sections default to local prototype data, so a first run does not require external service credentials. The START scorecard is currently defined in [StartProgressOverview.tsx](app/components/StartProgressOverview.tsx).

Available checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run build:vercel
```

`npm run verify` runs all five checks. The application uses React and Next.js conventions, with Vinext for the Sites build and a conventional Next.js build for Vercel.

## How data reaches the pages

Carbon, projects, site content, and the secondary energy and roadmap features use server-only provider interfaces. External JSON passes strict runtime validation before it becomes a public model. If a selected real source is missing, unavailable, malformed, or not approved for public reporting, the application shows an unavailable state instead of substituting mock values.

The current static START assessment scorecard is separate from those provider contracts.

A Google Sheets integration supplies versioned public content and project snapshots through a whitelist Apps Script adapter. It is an implementation path for reviewed data, not evidence that a workbook or live feed is connected to the public deployment.

| Provider setting | Supported sources |
| --- | --- |
| `SITE_CONTENT_PROVIDER` | `mock` or validated `snapshot` |
| `PROJECT_PROVIDER` | `mock` or sanitized `start-snapshot` |
| `CARBON_PROVIDER` | `mock` or validated `inventory` |
| `ENERGY_PROVIDER` | `mock` or `revert`; the official vendor transport is still required |
| `ROADMAP_PROVIDER` | `mock` or validated `config` |

Configuration and source requirements are documented in [INTEGRATIONS.md](INTEGRATIONS.md). `npm run providers:status` reports selected providers and missing variable names without printing credential values.

## Carbon progress and project outcomes

When approved data is available, the carbon progress result measures attainment of a gross-emissions reduction target:

```text
100 × (baseline gross − latest gross) ÷ (baseline gross − target gross)
```

The source must supply comparable gross inventories, approved years and boundary, the target, method, metric label, and update date. The validator checks the supplied percentage against the formula. Credits remain outside the reduction calculation.

CLYNK container counts require a dated account report. A compost greenhouse-gas estimate requires weighed material, a documented disposal baseline, and a named EPA WARM model version. Composting activity is not itself a retired carbon credit.

## Documentation

- [Architecture](ARCHITECTURE.md) and [data model](DATA_MODEL.md)
- [Integrations](INTEGRATIONS.md) and [Google Sheets adapter](integrations/google-sheets/README.md)
- [Spreadsheet update guide](SPREADSHEET_UPDATE_GUIDE.md)
- [Claims and data quality](CLAIMS_AND_DATA_QUALITY.md)
- [Security policy](SECURITY.md)

Before publishing real carbon or project results, the data owner and school reviewers need to approve the source records, reporting boundary, methods, and public wording. The prototype provides the reporting structure; those approvals and measurements remain substantive work.

Created by [Steven Chen](https://stevenchenjy.github.io/).
