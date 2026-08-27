# Claims and data quality

This is the practical wording policy for SKS Sustainability Progress. It keeps a target, an observation, a publication decision, source availability, and independent assurance from being collapsed into one badge. The current site uses public-source narrative plus clearly labeled placeholders; none of these definitions turns a fixture into a Storm King School result.

## Public terms

| Term | Meaning | Publication rule |
| --- | --- | --- |
| Target | A formally approved future outcome with a defined metric, boundary, and time period. | Never describe it as a measured result or current achievement. |
| Modeled pathway | One possible future trajectory, not an observed inventory result. | Label scenarios and keep them distinct from inventory years. |
| Prototype | Synthetic content used to design, test, and explain the platform. | State that it is not a Storm King School result, claim, or achievement. |
| Measured | Captured from an identified meter, bill, count, or other primary record. | Name the source, coverage, unit, and observation period. |
| Estimated | Calculated from documented assumptions where direct activity data is incomplete or unavailable. | Publish the estimation method and relevant uncertainty. |
| Reported | Approved by the source owner for public reporting. | Do not treat it as independently verified by default. |
| Verified | Reviewed against an identified standard or assurance process with public evidence. | Require a non-synthetic, available, reported source, verified quality and verification state, and a public evidence reference. |
| Stale | Valid source data older than its configured freshness threshold. | Show the observation time; do not replace it with an invented current value. |
| Unavailable | The selected source cannot supply safely usable data. | Render an unavailable or empty state; do not fall back to mock after a real source was selected. |

`pending` is the record-quality state used when there is not enough reviewed information to classify a public result. `draft` and `reported` are publication states. `live`, `cached`, and `stale` are freshness states. These are independent dimensions.

## Required context for a public number

Before publication, a reviewer should be able to answer:

1. What source supplied the value, and what type of source is it?
2. What physical or organizational boundary does it cover?
3. What unit, observation or reporting period, and update time apply?
4. Is the record measured, estimated, pending, or verified?
5. Is it prototype, draft, or approved for reporting?
6. Is a time-sensitive reading live, cached, stale, or unavailable?
7. What methodology and assumptions produce the result?
8. If the word “verified” is used, where is the public evidence?

The reusable `ProviderMetadata` fields and the source-context notice expose these dimensions without pretending that one aggregate score describes an entire page. A page combining a carbon plan and inventory keeps each source’s metadata separate.

## Restricted claims

Do not present “carbon neutral,” “net zero,” a reduction percentage, “verified,” or avoided-emissions language as a factual school claim unless approved source data directly supports it.

- Carbon-plan progress requires an approved goal, baseline/target/current comparable gross values, reporting boundary, years, update date, metric label, and method. The snapshot validator checks the supplied percentage against the gross-emissions target-attainment formula. It is labeled “Emissions-reduction progress,” never “percent carbon neutral.”
- Gross emissions, offsets, and net emissions must be explicit source fields. Offsets or net emissions require a supplied calculation method; the application does not subtract or infer them.
- Retired credits are a separate ledger with method and public retirement evidence. They are not included in the progress-bar numerator.
- CLYNK containers/proceeds, compost mass, modeled project benefits, START scores, and other project outcomes never reduce the gross inventory automatically.
- Composting is not a carbon offset. A public modeled benefit requires weighed accepted material, a documented disposal baseline, a named EPA WARM version, and model-run evidence.
- CLYNK container counts come from a dated account report; they are never estimated from bag counts or proceeds.
- An equivalency is approximate context derived from one reviewed emissions value and one versioned public factor. It is not additional impact.
- Missing scope or energy values remain `null`; they are never converted to zero.
- A real zero remains numeric zero and must not be displayed as missing.
- Avoided energy is not avoided carbon. A carbon conversion would require an approved factor, boundary, period, and method that this application does not currently contain.
- A vendor reading can be measured without being independently verified.
- The normalized Revert contract has no assurance-evidence field, so its adapter rejects `verified` quality until an approved evidence contract exists.

## Review workflow

1. The data owner validates the source contract and provenance.
2. The methodology owner reviews boundary, units, factors, assumptions, and corrections.
3. The publication owner sets draft or reported status and approves public wording.
4. A verification owner supplies public evidence before verified language is enabled.
5. The site is checked in a non-public environment for null, zero, stale, unavailable, and corrected values.
6. Corrections retain their source date and method context; they are not silently replaced by a synthetic fixture.

Implementation rules live in `lib/claim-safety.ts`, provider validators, and provider metadata. This document is the human review counterpart; it is not a substitute for institutional approval.
