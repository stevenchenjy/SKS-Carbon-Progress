# Sustainability Field Report revision

## Confirmed audit findings

- The four primary routes and the secondary `/energy` preview are correct and should remain.
- The first viewport foregrounds prototype/readiness scaffolding before student work. CLYNK and composting do not appear there.
- Prototype and provenance language repeats in the header, footer, every route, twice on Carbon, and back-to-back on Energy.
- Decorative eyebrow labels, section numbers, forced line breaks, and paired-fragment headings create a formulaic reading pattern.
- Synthetic percentages and trends are visually stronger than their caveats. They should leave the primary reading path.
- START gives more space to the external platform than to Storm King’s workflow.
- Project pages expose source, method, period, quality, result, next step, and mock-update fields at once. They should read as public case studies with details disclosed on request.
- Energy states selected-device coverage correctly, but four large synthetic metrics and an avoided-energy claim resemble campus performance at a glance.
- Local system typography is resource-conscious, but body copy and metadata are too small. Pending brown also needs stronger contrast.
- The reusable HTML/CSS chart correctly distinguishes missing data from zero and includes a table alternative. No new chart library is justified.
- The repository has no approved campus photo or START Command Center screenshot. The existing social image contains a useful topographic motif but is too large and has conflicting embedded text.
- Existing server-only provider selection, strict runtime validation, domain isolation, safe API errors, accessible focus/reduced-motion behavior, and dual production builds are sound and must remain.

## Verified public-boundary defects

- Public URL validation accepts localhost/private-network and credential-bearing HTTP(S) URLs.
- `StartContent.owner` can carry an arbitrary name or email into the public API and page.
- Real provider documents marked `draft` are labeled but not consistently blocked from public results.
- Energy validation can pair a missing value with `measured` or `estimated` quality, and one optional failure can erase otherwise usable energy data.

These defects should receive targeted tests and fail-closed fixes without changing the overall provider architecture.

## Indicative baseline

- Modern common and route JavaScript: 137,409 bytes gzip from the pre-revision `.next` artifact.
- Conservative JavaScript total including the legacy `nomodule` artifact: 176,899 bytes gzip.
- Compiled global CSS: 56,238 bytes raw / 10,615 bytes gzip.
- `public/og.png`: 2,810,360 bytes at 1729 × 910; metadata-only, not a normal page resource.
- No page imagery, remote fonts, trackers, video, canvas, WebGL, icon fonts, or client chart runtime.

Final measurements will be taken from fresh builds and the rendered site after the refactor.

## Concept decision

| Direction | Readability | Distinctiveness | Resource cost | Factual clarity | Accessibility | Implementation fit | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Campus Field Report | 9 | 9 | 8 | 9 | 9 | 9 | 53/60 |
| Low-resource Data Atlas | 9 | 7 | 10 | 9 | 9 | 8 | 52/60 |

**Selected: Campus Field Report.** It keeps the atlas direction’s local type, open rules, limited palette, and low client cost while adding a recognizable Storm King/Hudson Highlands visual identity. The topographic artwork compresses to 80 KB, so the stronger place signal does not threaten the homepage budget.

Concept references included desktop, Projects, and mobile-first-viewport renders for both directions. Those working images were generated outside the repository and are intentionally not linked from public source. The selected production artwork is committed at `public/images/topographic-field.webp`.

The Low-resource Data Atlas remains a useful secondary reference for ledger alignment and resource notes, but its all-sans, all-rule treatment felt too generic for a school field report.

Research principles actually carried into the implementation:

- [CarbonPlan Research](https://carbonplan.org/research) and its open theme informed the editorial climate-report hierarchy, restrained annotation, and separation of narrative from figures; no source code was copied.
- [Low-tech Magazine Solar](https://solar.lowtechmagazine.com/) informed local typography, small transfer budgets, compressed responsive media, and the decision to avoid new chart or UI runtimes; no AGPL theme code was copied.
- [Open SDG](https://github.com/open-sdg/open-sdg) informed stable source/period/status fields, explicit missing-data language, and the reusable accessible Data notes pattern.

## Extracted design system

- Background: exact warm white `#faf9f5`; no decorative gradient or image tint.
- Text: charcoal `#1e2622`; primary green `#164d3a`; muted green `#557568`; pending clay `#8b4a2f`; river gray-blue `#aabdc0`; neutral rule `#c8cdc8`.
- Display type: Georgia/local serif. Body and controls: system sans. No network font requests.
- Reading copy: 18px desktop and 17px mobile. Metadata: 13–14px. H1 uses a responsive editorial scale without forced line breaks.
- Containers: open page bands and editorial rows. Maximum content width 1280px with consistent responsive gutters.
- Radii: 0–6px. Borders and spacing provide hierarchy; shadows are not part of the system.
- Components: quiet site header, primary text/button action, concise prototype notice, editorial work rows, five-stage workflow, pending evidence state, native Data notes disclosure, project case-study row, HTML/CSS chart with table alternative, concise footer.
- Functional icon inventory: information circle, right arrow, disclosure chevron, and mobile menu lines only; use simple current-color SVG/CSS geometry.
- Hero artwork has a matching warm-white background and no overlay.

Allowed home first-viewport copy is locked to the selected concept: site/school names, four navigation labels, “Student work, measured carefully.”, its one-sentence lead, “See the projects”, the concise prototype notice, and “How to read this report”.

## Implemented information architecture

- **Global shell:** code-native school mark, site and school names, four primary routes, current-page state, compact mobile menu, skip link, one concise prototype notice pattern, and a shortened footer. `/energy` remains a secondary preview linked from the footer.
- **Overview:** one restrained hero, the START/CLYNK/composting work rows, the complete source-supplied publication path (a five-step diagram for the current fixture and a stable list for other valid lengths), a factual public-readiness ledger, place context from approved public sources, and two native data-note disclosures.
- **START:** the public-safe Storm King workflow leads the page. General START capabilities are collapsed into a native disclosure; the public/private boundary is stated once. No screenshot substitute was invented because no approved Command Center image exists.
- **Carbon:** plan decisions and the five-stage reduction framework now lead. Synthetic trend and verification-timeline graphics were removed. Percentages remain hidden until the boundary, baseline, target, comparable inventories, and progress method are approved.
- **Projects:** CLYNK and composting are concise case studies with one primary metric area, explicit pending states, the next evidence milestone, and progressive provenance. A historical composting article is cited only as context, never as a current result.
- **Energy:** selected-device coverage is adjacent to the title; two metrics precede one lightweight HTML/CSS chart. The 24-hour/7-day control and accessible table remain. Avoided-energy claims were removed.

The reusable `DataNotes` component uses server-rendered native `<details>` markup, so complete metadata remains present and operable without client JavaScript. The chart no longer imports `d3-scale`; arithmetic sizing preserves zero/missing semantics without a client visualization dependency.

## Safety and contract fixes

- Public URLs now reject credentials, non-HTTP(S) protocols, localhost, and reserved or non-global IPv4/IPv6 address ranges, including compatible/mapped address forms.
- HTTP JSON sources strip fragments before fetching, reject redirects, and fail closed when a populated response URL differs from the same normalized public endpoint. DNS rebinding still requires the deployment platform's egress controls because application-level hostname validation cannot pin DNS resolution.
- Selected real documents must have a reportable publication state; draft real results fail closed.
- Public START API output is an explicit whitelist and omits `owner`, including names and email-shaped values.
- Synthetic carbon-plan fields remain null, and synthetic Carbon, Project, and Roadmap documents cannot attach verified qualities or project/source verification references. Renderers and provider metadata repeat those gates defensively.
- Project and per-project metric identifiers must be collision-free lowercase kebab-case slugs before they can become public HTML identifiers.
- Energy values cannot be `measured` or `estimated` when their numeric reading is missing; each visible energy card derives quality from its own reading rather than a neighboring value.
- Optional energy snapshot/history failures remain isolated so one usable result is not erased by the other.
- Date-only provenance is formatted in UTC so a date such as `2026-08-14` cannot shift backward in North American time zones; timestamps retain the report's New York timezone treatment.
- Mobile navigation is a server-rendered native disclosure, preserving menu access without JavaScript.
- External provider validation continues to preserve genuine numeric zero, reject malformed payloads, and prevent synthetic substitution after a real provider is selected.

## Concept-to-browser comparison

The final browser render preserves the selected concept’s two-column hero, large local-serif headline, topographic river treatment, warm-white ground, school green, open editorial rows, clay pending language, and rule-based spacing. The mobile render preserves the single focal headline, action, topographic image, and short prototype note before the work list.

| Comparison area | Browser result |
| --- | --- |
| Typography | Georgia/system stacks preserve the editorial contrast; the browser headline is slightly heavier and more compact than the generated lettering, an accepted consequence of using dependable local fonts. |
| Spacing | The concept compressed several sections into 900 px. The browser keeps larger reading type and more vertical air; the hero and the beginning of the student-work section remain visible in the first desktop viewport. |
| Hierarchy | H1, lead, single action, artwork, notice, then student work match the concept order. Supporting provenance stays below the reading path. |
| Palette | Warm white, charcoal, school green, river gray-blue, neutral rules, and clay pending states match the selected system without gradients. |
| Media | The same topographic/river idea is used, with a wider desktop crop and a shallower mobile crop chosen to keep the action and notice visible. |
| Copy | Hero copy and primary action match exactly. Lower-page labels were rewritten from validated provider fields and pending states rather than copied from illustrative concept text. |

Intentional deviations:

- The generated topographic art uses a solid warm-white background rather than transparency because the production image pipeline did not preserve alpha reliably. It remains abstract and does not claim to show the campus.
- No campus photograph or START screenshot was used because the repository contained no asset with confirmed publication rights.
- The final header uses a code-native “SKS” circle and stacked school label instead of an invented crest.
- The mobile navigation overlays the top of the page rather than moving all content, preventing a layout shift while it is open.
- Required source, privacy, and provenance material sits below the main reading path even where the concept omitted those lower-page details.

## Final verification

- In-app Browser inspection covered every route at **1440 × 900**, **1280 × 720**, and **390 × 844**. Every tested viewport had `scrollWidth === innerWidth`; no framework overlay or broken image remained.
- Browser interactions verified the mobile menu, current-route state, all native disclosures, the energy 24-hour/7-day control, the seven-row table alternative, internal links, and source links.
- All five visible external references (two Storm King context pages, the UN goals page, the Green Schools Alliance START page, and Storm King’s historical composting story) resolved successfully during final link validation.
- Raw server HTML contains the complete energy `<details>` disclosure, confirming a practical JavaScript-disabled fallback for provenance.
- The final clean production browser reported **0 console errors and 0 warnings**. The in-app browser’s development session did show a hydration warning caused solely by its Grammarly extension adding `data-gr-*` attributes to `<body>`; the attributes were not in server HTML and the warning was absent in the clean production run.
- `npm run check` passes: TypeScript, ESLint, **117/117 tests across 9 files**, Vinext/Cloudflare build, and Next/Vercel build.
- `npm run validate:carbon -- fixtures/carbon-inventory.example.json` passes and preserves both a genuine zero and a missing value.
- `npm run providers:status` confirms all five domains are intentionally using ready synthetic/mock providers; no `.env.local` or reviewed real provider is connected.
- `git diff --check` passes.

Visual evidence was captured outside the repository for the before/final Overview states and for every final desktop and mobile route. Local filesystem paths are intentionally omitted from public source.

The Browser plugin was the primary rendered-QA tool. Its page sandbox does not expose the browser Performance API, so local Playwright CLI was used only for Web Vitals and encoded-transfer measurements; this fallback reason was recorded before use.

## Final resource and performance measurements

Measurements use the optimized Next production build with cache disabled. The mobile lab profile was **390 × 844, 1.6 Mbps download, 750 Kbps upload, 150 ms RTT, and 4× CPU slowdown**. These are repeatable local lab values, not field/RUM data.

| Measurement | Baseline | Final | Target/result |
| --- | ---: | ---: | --- |
| Homepage initial JavaScript | 137,409 B gzip modern baseline | 141,435 B encoded | Under 170 KB target |
| Compiled global CSS | 10,615 B gzip | 8,301 B encoded | 22% smaller |
| Homepage cold transfer, mobile profile | Not previously recorded | 213,204 B | Under 1 MB target |
| Homepage cold transfer, 1440 × 900 | Not previously recorded | 223,977 B | Under 1 MB target |
| Responsive hero, mobile profile | No page image | 16,492 B | Under 140 KB target |
| Responsive hero, 1440 × 900 | No page image | 24,824 B | Under 250 KB target |
| LCP, mobile profile | Not previously recorded | 1,036 ms | Under 2.5 s target |
| CLS, mobile profile | Not previously recorded | 0 | Under 0.1 target |
| Menu interaction duration, mobile profile | Not previously recorded | 88 ms | Under 200 ms target |
| Energy route JavaScript, 1440 × 900 | Included `d3-scale` | 135,882 B encoded | No chart-runtime dependency |
| Energy cold transfer, 1440 × 900 | Not previously recorded | 193,691 B | No material regression |

The source WebP is 81,626 B at 1584 × 993; Next serves smaller responsive variants. There are no remote fonts, trackers, video, canvas, WebGL, icon fonts, or new third-party UI/chart packages.

## Data still requiring school approval

- START adoption rationale/status, snapshot cadence, and the public fields approved for release.
- A dated CLYNK organization-account report and its public evidence reference.
- The composting collection boundary, weighing method, reporting period, and evidence source.
- Carbon goal, target year, organizational boundary, baseline, comparable inventory, factors, progress method, and any retired-credit evidence.
- Real monitored-energy endpoint coverage, device count, timezone, freshness threshold, reporting period, and public source label.
- Public verification URLs for any claim labeled verified.

No deployment, access-policy change, analytics, CMS, database, or authentication system was added.
