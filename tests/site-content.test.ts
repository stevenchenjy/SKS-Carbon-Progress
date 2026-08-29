import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PayloadValidationError } from '@/lib/providers/errors';
import { SnapshotSiteContentProvider } from '@/lib/site-content/providers/snapshotSiteContentProvider';
import { validateSiteContentSnapshot } from '@/lib/site-content/validation';

const fixture = JSON.parse(readFileSync('fixtures/site-content.example.json', 'utf8')) as unknown;

const syntheticCarbonClaimCases: Array<[string, unknown]> = [
  ['goal', 'Reach an emissions target.'],
  ['targetYear', 2035],
  ['baselineYear', 2025],
  ['latestReportingYear', 2026],
  ['inventoryBoundary', 'Campus operations'],
  ['baselineGrossEmissionsTco2e', 100],
  ['latestGrossEmissionsTco2e', 90],
  ['targetGrossEmissionsTco2e', 40],
  ['progressPercent', 10],
  ['progressMetric', 'Target attainment'],
  ['progressMethod', 'Comparable gross-emissions inventories'],
  ['retiredOffsetsTco2e', 1],
  ['offsetsMethod', 'Registry retirement'],
  ['offsetsEvidenceReference', 'https://example.org/retirement-evidence'],
  ['updatedAt', '2026-08-20'],
];

function reportedFixture() {
  const value = structuredClone(fixture) as {
    source: Record<string, unknown>;
    start: Record<string, unknown>;
    carbonPlan: Record<string, unknown>;
  };
  value.source.synthetic = false;
  value.source.publicationStatus = 'reported';
  value.source.quality = 'measured';
  value.start.adoptionStatus = 'confirmed';
  value.start.adoptionRationale = 'Approved test-only rationale.';
  value.start.owner = 'Sustainability Office';
  value.start.adoptionDate = '2026-01-15';
  Object.assign(value.carbonPlan, {
    goal: 'Reduce comparable gross emissions to 40 tCO2e by 2030.',
    targetYear: 2030,
    baselineYear: 2024,
    latestReportingYear: 2026,
    inventoryBoundary: 'Test campus operational-control boundary; Scopes 1 and 2.',
    baselineGrossEmissionsTco2e: 100,
    latestGrossEmissionsTco2e: 70,
    targetGrossEmissionsTco2e: 40,
    progressPercent: 50,
    progressMetric: 'Progress toward the approved gross-emissions reduction target.',
    progressMethod: '100 × (100 − 70) ÷ (100 − 40). Credits and project outcomes excluded.',
    status: 'Plan active',
    updatedAt: '2026-08-20',
    quality: 'measured',
  });
  return value;
}

describe('site-content snapshot boundary', () => {
  it('normalizes a public prototype snapshot and returns independent provider clones', async () => {
    const normalized = validateSiteContentSnapshot(fixture);
    expect(normalized.start.adoptionRationale).toBeNull();
    expect(normalized.carbonPlan.progressPercent).toBeNull();

    const provider = new SnapshotSiteContentProvider({ load: async () => structuredClone(fixture) });
    const first = await provider.getOverview();
    first.placeContext = 'Changed only in the test clone.';
    expect((await provider.getOverview()).placeContext).not.toBe(first.placeContext);
    expect(await provider.getMetadata()).toMatchObject({ sourceType: 'spreadsheet-snapshot', synthetic: true });
  });

  it.each(syntheticCarbonClaimCases)('rejects synthetic carbon-plan claim field %s', (field, value) => {
    const snapshot = structuredClone(fixture) as { carbonPlan: Record<string, unknown> };
    snapshot.carbonPlan[field] = value;
    expect(() => validateSiteContentSnapshot(snapshot)).toThrow(/synthetic site content carbonPlan decision and result fields must be null/i);
  });

  it('allows only structural framework content and pending or prototype plan quality for a synthetic source', () => {
    const structural = structuredClone(fixture) as { carbonPlan: Record<string, unknown> };
    structural.carbonPlan.quality = 'prototype';
    expect(validateSiteContentSnapshot(structural).carbonPlan).toMatchObject({ status: 'Framework', quality: 'prototype' });

    const activeStatus = structuredClone(fixture) as { carbonPlan: Record<string, unknown> };
    activeStatus.carbonPlan.status = 'Plan active';
    expect(() => validateSiteContentSnapshot(activeStatus)).toThrow(/carbonPlan\.status must be Framework/i);

    const measuredQuality = structuredClone(fixture) as { carbonPlan: Record<string, unknown> };
    measuredQuality.carbonPlan.quality = 'measured';
    expect(() => validateSiteContentSnapshot(measuredQuality)).toThrow(/carbonPlan\.quality must be pending or prototype/i);
  });

  it('rejects private fields and unsupported source URLs', () => {
    const privatePayload = structuredClone(fixture) as { start: Record<string, unknown> };
    privatePayload.start.internalNotes = 'Never public';
    expect(() => validateSiteContentSnapshot(privatePayload)).toThrow(PayloadValidationError);

    const unsafeUrl = structuredClone(fixture) as { overview: { sourceReferences: string[] } };
    unsafeUrl.overview.sourceReferences = ['file:///private/report.pdf'];
    expect(() => validateSiteContentSnapshot(unsafeUrl)).toThrow(/HTTP\(S\)/i);
  });

  it('requires adoption evidence before START can be labeled confirmed', () => {
    const value = structuredClone(fixture) as { start: Record<string, unknown> };
    value.start.adoptionStatus = 'confirmed';
    expect(() => validateSiteContentSnapshot(value)).toThrow(/requires adoptionRationale, owner, and adoptionDate/i);
  });

  it('accepts the documented gross-emissions target-attainment formula', () => {
    const normalized = validateSiteContentSnapshot(reportedFixture());
    expect(normalized.carbonPlan.progressPercent).toBe(50);
    expect(normalized.carbonPlan.retiredOffsetsTco2e).toBeNull();
  });

  it('rejects wrong percentages, missing methodology, and synthetic result quantities', () => {
    const wrong = reportedFixture();
    wrong.carbonPlan.progressPercent = 60;
    expect(() => validateSiteContentSnapshot(wrong)).toThrow(/does not match/i);

    const missingMethod = reportedFixture();
    missingMethod.carbonPlan.progressMethod = null;
    expect(() => validateSiteContentSnapshot(missingMethod)).toThrow(/requires an approved goal/i);

    const syntheticResult = structuredClone(fixture) as { carbonPlan: Record<string, unknown> };
    syntheticResult.carbonPlan.progressPercent = 1;
    syntheticResult.carbonPlan.retiredOffsetsTco2e = 1;
    expect(() => validateSiteContentSnapshot(syntheticResult)).toThrow(/synthetic site content/i);
  });

  it('rejects future-dated plan updates and unsupported verified source language', () => {
    const future = reportedFixture();
    future.carbonPlan.updatedAt = '2026-09-01';
    expect(() => validateSiteContentSnapshot(future)).toThrow(/updatedAt must not be after/i);

    const unsupportedVerification = reportedFixture();
    unsupportedVerification.source.quality = 'verified';
    expect(() => validateSiteContentSnapshot(unsupportedVerification)).toThrow(/no source-verification evidence field/i);
  });
});
