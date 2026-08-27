# Updating SKS Sustainability Progress from Google Sheets

## Recommendation

Start with the governed Google Sheet. It is the simplest fit for a small group of school editors, provides familiar review history, and can publish a tightly limited JSON snapshot through Google Apps Script. Keep Supabase as the next step when the workflow needs multiple permission roles, row-level approval rules, file attachments, structured audit queries, or more than one consuming application.

The website contract is provider-based, so moving from Sheets to Supabase later does not require redesigning the pages. The replacement service only needs to emit the same validated JSON.

## Workbook

The native Google Sheet is named **SKS Sustainability Data Workbook**. Its main rules are:

1. Yellow cells are staff-editable inputs.
2. Green cells are formulas. Protect them after importing the workbook.
3. Blank means unknown or unavailable. Enter `0` only when a dated source documents a genuine zero.
4. Gross emissions, retired credits, and project outcomes are separate ledgers.
5. A row cannot be public until its `workflow_status` is `published` and its evidence is reviewed.
6. Private file references remain internal. Only approved public URLs may leave the sheet.

The workbook includes:

- `Overview` for sustainability, place, and value-alignment copy.
- `START` for the working definition, adoption status, workflow, owner, and public/private boundary.
- `Carbon Plan` for an approved goal, boundary, comparable gross emissions, the target-attainment formula, and a separate retired-credit ledger.
- `Projects` for public summaries and milestones.
- `Project Metrics` for CLYNK, composting, and future project observations.
- `Evidence` for the reviewed source behind each public claim.
- `Public Snapshot` for a formula-backed readiness preview.

## What each requested number means

### Carbon progress

The bar is **Progress toward the approved gross-emissions reduction target**:

```text
100 × (baseline gross emissions − latest gross emissions)
    ÷ (baseline gross emissions − target gross emissions)
```

It requires an approved goal, baseline year, target year, reporting boundary, comparable baseline/current/target gross values, method, and update date. The text may be below 0% or above 100%; only the visual bar is clamped to 0–100. Credits, CLYNK, composting, and other project estimates never enter the numerator.

### Retired carbon credits

Report only documented retired quantities with the program or registry, methodology, beneficiary, reporting period, and a public retirement record. Show them as a separate ledger. Purchased-but-not-retired instruments are not offsets used by the site.

### CLYNK

Use the container count and proceeds from a dated CLYNK organization-account report for the same period. Do not estimate containers from proceeds or bag counts. CLYNK has no public API contract connected to this project, so account reports are the defensible update source.

### Composting

Track measured accepted mass by reporting period. A greenhouse-gas figure may appear only after a reviewed EPA WARM model run identifies the material, actual treatment, documented baseline treatment, model version, assumptions, and source file. Label it **modeled life-cycle GHG benefit**, not an offset, and do not subtract it from the school inventory.

### Equivalencies

Add an equivalency only after the underlying emissions quantity is approved. Preserve the official factor source and version, label the result approximate, and never count the equivalency as additional impact.

### START

Until Storm King confirms the official expansion, adoption rationale, owner, and date, keep `adoption_status` as `working-purpose`. A score or percentage should appear only if the actual START framework defines and permits that calculation. START progress never enters carbon progress.

## Publishing from Google Sheets

1. Open the workbook and protect the two formula cells on `Carbon Plan` plus the entire `Public Snapshot` tab.
2. Open **Extensions → Apps Script**.
3. Replace the default code with [Code.gs](./integrations/google-sheets/Code.gs).
4. Choose **Deploy → New deployment → Web app**.
5. Execute the app as the workbook owner. Choose the audience approved for the public website endpoint.
6. Test both URLs in a browser:

   - `WEB_APP_URL?dataset=site-content`
   - `WEB_APP_URL?dataset=projects`

7. Do not switch the website providers until both responses contain only reviewed public fields and pass the local validation tests.
8. Add these hosting variables:

```text
SITE_CONTENT_PROVIDER=snapshot
SITE_CONTENT_URL=WEB_APP_URL?dataset=site-content
PROJECT_PROVIDER=start-snapshot
START_PUBLIC_SNAPSHOT_URL=WEB_APP_URL?dataset=projects
```

The Apps Script is a whitelist adapter, not a raw spreadsheet API. It rejects unsupported datasets, duplicate keys, missing required public fields, unreviewed evidence, missing reporting periods, and any attempt to include project outcomes in carbon progress. Errors return only a generic not-ready response.

## Review cadence

- Project activity and metrics: monthly or once per school term.
- START public snapshot: quarterly or once per term.
- Carbon inventory and target progress: annually after inventory review.
- Overview narrative: only when the approved policy, source, or institutional wording changes.

For corrections, do not silently overwrite a published claim. Preserve the prior evidence, add the corrected source and date, document the reason, and then publish the replacement row.

## When to move to Supabase

Move when spreadsheet governance becomes the limiting factor. A Supabase implementation should use normalized tables for evidence, projects, metrics, inventories, targets, and credit retirements; enable Row Level Security on every exposed table; keep service-role credentials server-side; and expose only reviewed public rows through a view or server route. The site can keep the existing `SiteContentProvider` and `ProjectProvider` contracts.

Do not put private START records, student information, staff email addresses, vendor credentials, registry account secrets, or unrestricted storage URLs in a public Supabase table or public Google Sheet response.
