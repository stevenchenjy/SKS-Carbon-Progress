# Google Sheets public snapshot adapter

This adapter turns the governed SKS Sustainability Data Workbook into two strict JSON endpoints without exposing a raw spreadsheet:

- `?dataset=site-content` — Overview, START, and Carbon Neutrality Framework content.
- `?dataset=projects` — reviewed public projects and project metrics.

See [SPREADSHEET_UPDATE_GUIDE.md](../../SPREADSHEET_UPDATE_GUIDE.md) for the publication workflow, deployment steps, validation rules, and hosting environment variables.

The script fails closed. Draft rows, unreviewed evidence, private file references, notes, and unsupported fields are never returned.
