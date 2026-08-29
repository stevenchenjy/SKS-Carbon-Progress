import type { DataQuality } from '@/lib/data-quality';
import type {
  CarbonFrameworkStage,
  CarbonNeutralityPlanContent,
  SchoolValueAlignment,
  SiteContentSnapshot,
  StartContent,
  SustainabilityOverviewContent,
} from '@/lib/site-content/types';
import { ValidationContext, isIsoDateOrderValid, isTimestampTooFarFuture, normalizePublicHttpUrl } from '@/lib/validation/runtime';

const qualities = ['measured', 'estimated', 'verified', 'prototype', 'pending'] as const;
const publicationStatuses = ['prototype', 'draft', 'reported'] as const;
const valueNames = ['Truth', 'Respect', 'Responsibility', 'Scholarship'] as const;
const adoptionStatuses = ['working-purpose', 'confirmed'] as const;
const planStatuses = ['Framework', 'Baseline in progress', 'Plan active', 'On track', 'At risk', 'Achieved'] as const;

function nullableString(ctx: ValidationContext, value: unknown, path: string): string | null {
  if (value === null) return null;
  return ctx.string(value, path, { nullable: true });
}

function nullableNumber(ctx: ValidationContext, value: unknown, path: string, options: { integer?: boolean; min?: number; max?: number } = {}): number | null {
  if (value === null) return null;
  return ctx.number(value, path, { nullable: true, ...options });
}

function nullableIsoDate(ctx: ValidationContext, value: unknown, path: string): string | null {
  if (value === null) return null;
  return ctx.isoDate(value, path);
}

function parseQuality(ctx: ValidationContext, value: unknown, path: string): DataQuality {
  return ctx.enum(value, qualities, path);
}

function httpUrl(ctx: ValidationContext, value: string, path: string): string {
  try {
    return normalizePublicHttpUrl(value);
  } catch {
    ctx.issues.push(`${path} must be a public HTTP(S) URL without credentials`);
    return value;
  }
}

function parseOverview(ctx: ValidationContext, value: unknown): SustainabilityOverviewContent {
  const record = ctx.record(value, 'overview');
  ctx.onlyKeys(record, ['sustainabilityDefinition', 'placeContext', 'valueAlignment', 'sourceReferences'], 'overview');
  const valueAlignment = ctx.array(record.valueAlignment, 'overview.valueAlignment', { maxLength: 8 }).map((item, index): SchoolValueAlignment => {
    const path = `overview.valueAlignment[${index}]`;
    const valueRecord = ctx.record(item, path);
    ctx.onlyKeys(valueRecord, ['value', 'statement'], path);
    return {
      value: ctx.enum(valueRecord.value, valueNames, `${path}.value`),
      statement: ctx.string(valueRecord.statement, `${path}.statement`) ?? '',
    };
  });
  const uniqueValues = new Set(valueAlignment.map((item) => item.value));
  if (uniqueValues.size !== valueAlignment.length) ctx.issues.push('overview.valueAlignment contains duplicate school values');
  const sourceReferences = ctx.array(record.sourceReferences, 'overview.sourceReferences', { maxLength: 12 }).map((item, index) => {
    const url = ctx.string(item, `overview.sourceReferences[${index}]`) ?? '';
    return httpUrl(ctx, url, `overview.sourceReferences[${index}]`);
  });
  return {
    sustainabilityDefinition: ctx.string(record.sustainabilityDefinition, 'overview.sustainabilityDefinition') ?? '',
    placeContext: ctx.string(record.placeContext, 'overview.placeContext') ?? '',
    valueAlignment,
    sourceReferences,
  };
}

function parseStart(ctx: ValidationContext, value: unknown): StartContent {
  const record = ctx.record(value, 'start');
  ctx.onlyKeys(record, ['introduction', 'adoptionRationale', 'adoptionStatus', 'owner', 'adoptionDate', 'workflow', 'privacyBoundary', 'snapshotCadence'], 'start');
  const adoptionStatus = ctx.enum(record.adoptionStatus, adoptionStatuses, 'start.adoptionStatus');
  const adoptionRationale = nullableString(ctx, record.adoptionRationale, 'start.adoptionRationale');
  const owner = nullableString(ctx, record.owner, 'start.owner');
  const adoptionDate = nullableIsoDate(ctx, record.adoptionDate, 'start.adoptionDate');
  if (adoptionStatus === 'confirmed' && (adoptionRationale === null || owner === null || adoptionDate === null)) {
    ctx.issues.push('start confirmed adoption requires adoptionRationale, owner, and adoptionDate');
  }
  return {
    introduction: ctx.string(record.introduction, 'start.introduction') ?? '',
    adoptionRationale,
    adoptionStatus,
    owner,
    adoptionDate,
    workflow: ctx.array(record.workflow, 'start.workflow', { maxLength: 10 }).map((item, index) => ctx.string(item, `start.workflow[${index}]`) ?? ''),
    privacyBoundary: ctx.string(record.privacyBoundary, 'start.privacyBoundary') ?? '',
    snapshotCadence: nullableString(ctx, record.snapshotCadence, 'start.snapshotCadence'),
  };
}

function parseFramework(ctx: ValidationContext, value: unknown): CarbonFrameworkStage[] {
  const stages = ctx.array(value, 'carbonPlan.framework', { maxLength: 10 }).map((item, index): CarbonFrameworkStage => {
    const path = `carbonPlan.framework[${index}]`;
    const record = ctx.record(item, path);
    ctx.onlyKeys(record, ['id', 'title', 'description'], path);
    return {
      id: ctx.string(record.id, `${path}.id`) ?? '',
      title: ctx.string(record.title, `${path}.title`) ?? '',
      description: ctx.string(record.description, `${path}.description`) ?? '',
    };
  });
  const ids = new Set<string>();
  for (const stage of stages) {
    if (ids.has(stage.id)) ctx.issues.push(`carbonPlan.framework contains duplicate id ${stage.id}`);
    ids.add(stage.id);
  }
  return stages;
}

function parseCarbonPlan(ctx: ValidationContext, value: unknown, syntheticSource: boolean, publicationStatus: string): CarbonNeutralityPlanContent {
  const record = ctx.record(value, 'carbonPlan');
  ctx.onlyKeys(record, [
    'definition', 'goal', 'targetYear', 'baselineYear', 'latestReportingYear', 'inventoryBoundary',
    'baselineGrossEmissionsTco2e', 'latestGrossEmissionsTco2e', 'targetGrossEmissionsTco2e',
    'progressPercent', 'progressMetric', 'progressMethod', 'retiredOffsetsTco2e', 'offsetsMethod',
    'offsetsEvidenceReference', 'status', 'updatedAt', 'quality', 'framework',
  ], 'carbonPlan');
  const goal = nullableString(ctx, record.goal, 'carbonPlan.goal');
  const targetYear = nullableNumber(ctx, record.targetYear, 'carbonPlan.targetYear', { integer: true, min: 1900, max: 2200 });
  const baselineYear = nullableNumber(ctx, record.baselineYear, 'carbonPlan.baselineYear', { integer: true, min: 1900, max: 2200 });
  const latestReportingYear = nullableNumber(ctx, record.latestReportingYear, 'carbonPlan.latestReportingYear', { integer: true, min: 1900, max: 2200 });
  const inventoryBoundary = nullableString(ctx, record.inventoryBoundary, 'carbonPlan.inventoryBoundary');
  const baselineGross = nullableNumber(ctx, record.baselineGrossEmissionsTco2e, 'carbonPlan.baselineGrossEmissionsTco2e', { min: 0 });
  const latestGross = nullableNumber(ctx, record.latestGrossEmissionsTco2e, 'carbonPlan.latestGrossEmissionsTco2e', { min: 0 });
  const targetGross = nullableNumber(ctx, record.targetGrossEmissionsTco2e, 'carbonPlan.targetGrossEmissionsTco2e', { min: 0 });
  const progressPercent = nullableNumber(ctx, record.progressPercent, 'carbonPlan.progressPercent');
  const progressMetric = nullableString(ctx, record.progressMetric, 'carbonPlan.progressMetric');
  const progressMethod = nullableString(ctx, record.progressMethod, 'carbonPlan.progressMethod');
  const retiredOffsets = nullableNumber(ctx, record.retiredOffsetsTco2e, 'carbonPlan.retiredOffsetsTco2e', { min: 0 });
  const offsetsMethod = nullableString(ctx, record.offsetsMethod, 'carbonPlan.offsetsMethod');
  const offsetsEvidenceReferenceRaw = nullableString(ctx, record.offsetsEvidenceReference, 'carbonPlan.offsetsEvidenceReference');
  const offsetsEvidenceReference = offsetsEvidenceReferenceRaw === null ? null : httpUrl(ctx, offsetsEvidenceReferenceRaw, 'carbonPlan.offsetsEvidenceReference');
  const updatedAt = nullableIsoDate(ctx, record.updatedAt, 'carbonPlan.updatedAt');
  const quality = parseQuality(ctx, record.quality, 'carbonPlan.quality');
  const status = ctx.enum(record.status, planStatuses, 'carbonPlan.status');

  if (goal === null && targetYear !== null) ctx.issues.push('carbonPlan.targetYear requires an approved goal');
  if (goal !== null && (targetYear === null || baselineYear === null || inventoryBoundary === null)) {
    ctx.issues.push('carbonPlan.goal requires targetYear, baselineYear, and inventoryBoundary');
  }
  if (baselineYear !== null && latestReportingYear !== null && latestReportingYear < baselineYear) {
    ctx.issues.push('carbonPlan.latestReportingYear must not be before baselineYear');
  }
  if (baselineYear !== null && targetYear !== null && targetYear <= baselineYear) {
    ctx.issues.push('carbonPlan.targetYear must be after baselineYear');
  }
  if (progressPercent !== null) {
    if ([goal, targetYear, baselineYear, latestReportingYear, inventoryBoundary, baselineGross, latestGross, targetGross, progressMetric, progressMethod, updatedAt].some((item) => item === null)) {
      ctx.issues.push('carbonPlan.progressPercent requires an approved goal, years, boundary, gross baseline/latest/target values, metric, method, and update date');
    } else if (baselineGross !== null && latestGross !== null && targetGross !== null) {
      const denominator = baselineGross - targetGross;
      if (denominator <= 0) {
        ctx.issues.push('carbonPlan baseline gross emissions must exceed target gross emissions');
      } else {
        const expected = ((baselineGross - latestGross) / denominator) * 100;
        if (Math.abs(expected - progressPercent) > 0.2) {
          ctx.issues.push('carbonPlan.progressPercent does not match the documented gross-emissions target-attainment formula');
        }
      }
    }
  }
  if (retiredOffsets !== null && (offsetsMethod === null || offsetsEvidenceReference === null || updatedAt === null)) {
    ctx.issues.push('carbonPlan.retiredOffsetsTco2e requires a method, public retirement evidence, and update date');
  }
  if (syntheticSource) {
    const syntheticClaimFields: ReadonlyArray<readonly [string, string | number | null]> = [
      ['goal', goal],
      ['targetYear', targetYear],
      ['baselineYear', baselineYear],
      ['latestReportingYear', latestReportingYear],
      ['inventoryBoundary', inventoryBoundary],
      ['baselineGrossEmissionsTco2e', baselineGross],
      ['latestGrossEmissionsTco2e', latestGross],
      ['targetGrossEmissionsTco2e', targetGross],
      ['progressPercent', progressPercent],
      ['progressMetric', progressMetric],
      ['progressMethod', progressMethod],
      ['retiredOffsetsTco2e', retiredOffsets],
      ['offsetsMethod', offsetsMethod],
      ['offsetsEvidenceReference', offsetsEvidenceReference],
      ['updatedAt', updatedAt],
    ];
    const populatedClaimFields = syntheticClaimFields
      .filter(([, fieldValue]) => fieldValue !== null)
      .map(([fieldName]) => fieldName);

    if (populatedClaimFields.length > 0) {
      ctx.issues.push(`synthetic site content carbonPlan decision and result fields must be null: ${populatedClaimFields.join(', ')}`);
    }
    if (status !== 'Framework') {
      ctx.issues.push('synthetic site content carbonPlan.status must be Framework');
    }
    if (quality !== 'pending' && quality !== 'prototype') {
      ctx.issues.push('synthetic site content carbonPlan.quality must be pending or prototype');
    }
  }
  if (!syntheticSource && quality === 'prototype') ctx.issues.push('carbonPlan.quality cannot be prototype for a non-synthetic source');
  if (quality === 'verified') ctx.issues.push('carbonPlan.quality cannot be verified in the version-1 site-content contract because it has no plan-verification evidence field');
  if ((progressPercent !== null || retiredOffsets !== null) && publicationStatus !== 'reported') {
    ctx.issues.push('carbonPlan reported progress or offsets require source.publicationStatus to be reported');
  }

  return {
    definition: ctx.string(record.definition, 'carbonPlan.definition') ?? '',
    goal,
    targetYear,
    baselineYear,
    latestReportingYear,
    inventoryBoundary,
    baselineGrossEmissionsTco2e: baselineGross,
    latestGrossEmissionsTco2e: latestGross,
    targetGrossEmissionsTco2e: targetGross,
    progressPercent,
    progressMetric,
    progressMethod,
    retiredOffsetsTco2e: retiredOffsets,
    offsetsMethod,
    offsetsEvidenceReference,
    status,
    updatedAt,
    quality,
    framework: parseFramework(ctx, record.framework),
  };
}

export function validateSiteContentSnapshot(value: unknown, now = new Date()): SiteContentSnapshot {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'snapshot');
  ctx.onlyKeys(record, ['schemaVersion', 'source', 'overview', 'start', 'carbonPlan'], 'snapshot');
  const schemaVersion = ctx.number(record.schemaVersion, 'schemaVersion', { integer: true });
  if (schemaVersion !== 1) ctx.issues.push('schemaVersion must equal 1');

  const sourceRecord = ctx.record(record.source, 'source');
  ctx.onlyKeys(sourceRecord, ['id', 'label', 'synthetic', 'generatedAt', 'publicationStatus', 'quality', 'methodologyNote'], 'source');
  const synthetic = ctx.boolean(sourceRecord.synthetic, 'source.synthetic');
  const publicationStatus = ctx.enum(sourceRecord.publicationStatus, publicationStatuses, 'source.publicationStatus');
  const quality = parseQuality(ctx, sourceRecord.quality, 'source.quality');
  const generatedAt = ctx.isoTimestamp(sourceRecord.generatedAt, 'source.generatedAt');
  if (isTimestampTooFarFuture(generatedAt, now)) ctx.issues.push('source.generatedAt must not be more than 5 minutes in the future');
  if (synthetic && (publicationStatus !== 'prototype' || quality !== 'prototype')) {
    ctx.issues.push('synthetic site content must use prototype publication and quality states');
  }
  if (!synthetic && (publicationStatus === 'prototype' || quality === 'prototype')) {
    ctx.issues.push('non-synthetic site content cannot use prototype publication or quality states');
  }
  if (!synthetic && publicationStatus !== 'reported') {
    ctx.issues.push('non-synthetic site content must be reported before it crosses the public provider boundary');
  }
  if (quality === 'verified') ctx.issues.push('source.quality cannot be verified in the version-1 site-content contract because it has no source-verification evidence field');

  const start = parseStart(ctx, record.start);
  const carbonPlan = parseCarbonPlan(ctx, record.carbonPlan, synthetic, publicationStatus);
  if (start.adoptionDate !== null && !isIsoDateOrderValid(start.adoptionDate, generatedAt)) {
    ctx.issues.push('start.adoptionDate must not be after source.generatedAt');
  }
  if (carbonPlan.updatedAt !== null && !isIsoDateOrderValid(carbonPlan.updatedAt, generatedAt)) {
    ctx.issues.push('carbonPlan.updatedAt must not be after source.generatedAt');
  }

  const snapshot: SiteContentSnapshot = {
    schemaVersion: 1,
    source: {
      id: ctx.string(sourceRecord.id, 'source.id') ?? '',
      label: ctx.string(sourceRecord.label, 'source.label') ?? '',
      synthetic,
      generatedAt,
      publicationStatus,
      quality,
      methodologyNote: ctx.string(sourceRecord.methodologyNote, 'source.methodologyNote') ?? '',
    },
    overview: parseOverview(ctx, record.overview),
    start,
    carbonPlan,
  };
  ctx.finish();
  return structuredClone(snapshot);
}
