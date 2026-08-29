import type { CarbonHistoryPoint, CarbonMethodology, CarbonOverview, CarbonScopeSummary, CarbonTotals } from './types';
import type { PublicationStatus, ReportingPeriodMetadata } from '../provider-metadata';
import type { DataQuality } from '../data-quality';
import { ValidationContext, isIsoDateOrderValid, isTimestampTooFarFuture, normalizePublicHttpUrl } from '../validation/runtime.ts';

const qualities = ['measured', 'estimated', 'verified', 'prototype', 'pending'] as const;
const scopes = ['Scope 1', 'Scope 2', 'Scope 3'] as const;
const historyKinds = ['inventory', 'scenario'] as const;
const milestones = ['inventory', 'reduction project', 'verification milestone'] as const;
const publicationStatuses = ['prototype', 'draft', 'reported'] as const;
const carbonUnits = ['tCO2e', 'kgCO2e', 'illustrative index'] as const;
const accountingUnits = ['tCO2e', 'kgCO2e'] as const;

export interface CarbonInventorySource {
  id: string;
  label: string;
  synthetic: boolean;
  updatedAt: string;
  publicationStatus: PublicationStatus;
  methodologyVersion: string;
  reportingPeriod: ReportingPeriodMetadata;
  verificationReference: string | null;
}

export interface CarbonInventoryDocument {
  schemaVersion: 1;
  source: CarbonInventorySource;
  overview: CarbonOverview;
  history: CarbonHistoryPoint[];
  methodology: CarbonMethodology;
}

function parseQuality(ctx: ValidationContext, value: unknown, path: string): DataQuality {
  return ctx.enum(value, qualities, path);
}

function parseScope(ctx: ValidationContext, value: unknown, path: string): CarbonScopeSummary {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, ['scope', 'source', 'value', 'unit', 'quality', 'note'], path);
  return {
    scope: ctx.enum(record.scope, scopes, `${path}.scope`),
    source: ctx.string(record.source, `${path}.source`) ?? '',
    value: ctx.number(record.value, `${path}.value`, { nullable: true, min: 0 }),
    unit: ctx.enum(record.unit, carbonUnits, `${path}.unit`),
    quality: parseQuality(ctx, record.quality, `${path}.quality`),
    note: ctx.string(record.note, `${path}.note`) ?? '',
  };
}

function parseOverview(ctx: ValidationContext, value: unknown): CarbonOverview {
  const record = ctx.record(value, 'overview');
  ctx.onlyKeys(record, ['baselineYear', 'latestReportingYear', 'reductionPercent', 'emissionsTrend', 'reportingStatus', 'quality', 'scopeBreakdown', 'totals'], 'overview');
  const scopeBreakdown = ctx.array(record.scopeBreakdown, 'overview.scopeBreakdown').map((item, index) => parseScope(ctx, item, `overview.scopeBreakdown[${index}]`));
  const seen = new Set<string>();
  for (const scope of scopeBreakdown) {
    if (seen.has(scope.scope)) ctx.issues.push(`overview.scopeBreakdown contains duplicate ${scope.scope}`);
    seen.add(scope.scope);
  }
  const baselineYear = ctx.number(record.baselineYear, 'overview.baselineYear', { nullable: true, integer: true, min: 1900, max: 2200 });
  const latestReportingYear = ctx.number(record.latestReportingYear, 'overview.latestReportingYear', { nullable: true, integer: true, min: 1900, max: 2200 });
  if (baselineYear !== null && latestReportingYear !== null && baselineYear > latestReportingYear) {
    ctx.issues.push('overview.baselineYear must not be after overview.latestReportingYear');
  }
  return {
    baselineYear,
    latestReportingYear,
    reductionPercent: ctx.number(record.reductionPercent, 'overview.reductionPercent', { nullable: true, min: 0, max: 100 }),
    emissionsTrend: ctx.string(record.emissionsTrend, 'overview.emissionsTrend') ?? '',
    reportingStatus: ctx.string(record.reportingStatus, 'overview.reportingStatus') ?? '',
    quality: parseQuality(ctx, record.quality, 'overview.quality'),
    scopeBreakdown,
    totals: parseTotals(ctx, record.totals),
  };
}

function parseTotals(ctx: ValidationContext, value: unknown): CarbonTotals | null {
  if (value === null) return null;
  const record = ctx.record(value, 'overview.totals');
  ctx.onlyKeys(record, ['grossEmissions', 'offsets', 'netEmissions', 'unit', 'calculationMethod'], 'overview.totals');
  const grossEmissions = ctx.number(record.grossEmissions, 'overview.totals.grossEmissions', { nullable: true, min: 0 });
  const offsets = ctx.number(record.offsets, 'overview.totals.offsets', { nullable: true, min: 0 });
  const netEmissions = ctx.number(record.netEmissions, 'overview.totals.netEmissions', { nullable: true, min: 0 });
  const calculationMethod = record.calculationMethod === null
    ? null
    : ctx.string(record.calculationMethod, 'overview.totals.calculationMethod', { nullable: true });
  if ((offsets !== null || netEmissions !== null) && grossEmissions === null) {
    ctx.issues.push('overview.totals.grossEmissions is required when offsets or netEmissions is supplied');
  }
  if ((offsets !== null || netEmissions !== null) && calculationMethod === null) {
    ctx.issues.push('overview.totals.calculationMethod is required when offsets or netEmissions is supplied');
  }
  return {
    grossEmissions,
    offsets,
    netEmissions,
    unit: ctx.enum(record.unit, accountingUnits, 'overview.totals.unit'),
    calculationMethod,
  };
}

function parseHistory(ctx: ValidationContext, value: unknown): CarbonHistoryPoint[] {
  const points = ctx.array(value, 'history').map((item, index) => {
    const path = `history[${index}]`;
    const record = ctx.record(item, path);
    ctx.onlyKeys(record, ['year', 'value', 'unit', 'kind', 'milestone', 'note', 'quality'], path);
    return {
      year: ctx.number(record.year, `${path}.year`, { integer: true, min: 1900, max: 2200 }) ?? 0,
      value: ctx.number(record.value, `${path}.value`, { nullable: true, min: 0 }),
      unit: ctx.enum(record.unit, carbonUnits, `${path}.unit`),
      kind: ctx.enum(record.kind, historyKinds, `${path}.kind`),
      milestone: ctx.enum(record.milestone, milestones, `${path}.milestone`),
      note: ctx.string(record.note, `${path}.note`) ?? '',
      quality: parseQuality(ctx, record.quality, `${path}.quality`),
    } satisfies CarbonHistoryPoint;
  });
  const units = new Set(points.map((point) => point.unit).filter(Boolean));
  if (units.size > 1) ctx.issues.push('history must use one consistent unit for the public series');
  const identities = new Set<string>();
  for (const point of points) {
    const identity = `${point.year}:${point.kind}`;
    if (identities.has(identity)) ctx.issues.push(`history contains duplicate ${point.kind} point for ${point.year}`);
    identities.add(identity);
    if (point.value === null && point.quality !== 'pending' && point.quality !== 'prototype') {
      ctx.issues.push(`history value for ${point.year} cannot be ${point.quality} when it is null`);
    }
  }
  return points;
}

function parseMethodology(ctx: ValidationContext, value: unknown): CarbonMethodology {
  const record = ctx.record(value, 'methodology');
  ctx.onlyKeys(record, ['reportingBoundary', 'baselineDefinition', 'emissionsFactors', 'reportingYear', 'dataQualityStatus', 'approach'], 'methodology');
  return {
    reportingBoundary: ctx.string(record.reportingBoundary, 'methodology.reportingBoundary') ?? '',
    baselineDefinition: ctx.string(record.baselineDefinition, 'methodology.baselineDefinition') ?? '',
    emissionsFactors: ctx.string(record.emissionsFactors, 'methodology.emissionsFactors') ?? '',
    reportingYear: ctx.string(record.reportingYear, 'methodology.reportingYear') ?? '',
    dataQualityStatus: parseQuality(ctx, record.dataQualityStatus, 'methodology.dataQualityStatus'),
    approach: ctx.array(record.approach, 'methodology.approach').map((item, index) => ctx.string(item, `methodology.approach[${index}]`) ?? ''),
  };
}

function parseSource(ctx: ValidationContext, value: unknown, now: Date): CarbonInventorySource {
  const record = ctx.record(value, 'source');
  ctx.onlyKeys(record, ['id', 'label', 'synthetic', 'updatedAt', 'publicationStatus', 'methodologyVersion', 'reportingPeriod', 'verificationReference'], 'source');
  const period = ctx.record(record.reportingPeriod, 'source.reportingPeriod');
  ctx.onlyKeys(period, ['start', 'end', 'label'], 'source.reportingPeriod');
  const reportingPeriod = {
    start: ctx.isoDate(period.start, 'source.reportingPeriod.start'),
    end: ctx.isoDate(period.end, 'source.reportingPeriod.end'),
    label: ctx.string(period.label, 'source.reportingPeriod.label') ?? '',
  };
  if (reportingPeriod.start && reportingPeriod.end && !isIsoDateOrderValid(reportingPeriod.start, reportingPeriod.end)) {
    ctx.issues.push('source.reportingPeriod.start must not be after source.reportingPeriod.end');
  }
  const synthetic = ctx.boolean(record.synthetic, 'source.synthetic');
  const publicationStatus = ctx.enum(record.publicationStatus, publicationStatuses, 'source.publicationStatus');
  if (synthetic && publicationStatus !== 'prototype') ctx.issues.push('source.publicationStatus must be prototype when source.synthetic is true');
  if (!synthetic && publicationStatus === 'prototype') ctx.issues.push('source.publicationStatus cannot be prototype when source.synthetic is false');
  const verificationReference = record.verificationReference === null
    ? null
    : ctx.string(record.verificationReference, 'source.verificationReference', { nullable: true });
  if (verificationReference !== null) {
    try {
      normalizePublicHttpUrl(verificationReference);
    } catch {
      ctx.issues.push('source.verificationReference must be a public HTTP(S) URL without credentials or null');
    }
  }
  const updatedAt = ctx.isoTimestamp(record.updatedAt, 'source.updatedAt');
  if (isTimestampTooFarFuture(updatedAt, now)) ctx.issues.push('source.updatedAt must not be more than 5 minutes in the future');
  return {
    id: ctx.string(record.id, 'source.id') ?? '',
    label: ctx.string(record.label, 'source.label') ?? '',
    synthetic,
    updatedAt,
    publicationStatus,
    methodologyVersion: ctx.string(record.methodologyVersion, 'source.methodologyVersion') ?? '',
    reportingPeriod,
    verificationReference,
  };
}

export function validateCarbonInventoryDocument(value: unknown, now = new Date()): CarbonInventoryDocument {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'document');
  ctx.onlyKeys(record, ['schemaVersion', 'source', 'overview', 'history', 'methodology'], 'document');
  const schemaVersion = ctx.number(record.schemaVersion, 'schemaVersion', { integer: true });
  if (schemaVersion !== 1) ctx.issues.push('schemaVersion must equal 1');
  const result: CarbonInventoryDocument = {
    schemaVersion: 1,
    source: parseSource(ctx, record.source, now),
    overview: parseOverview(ctx, record.overview),
    history: parseHistory(ctx, record.history),
    methodology: parseMethodology(ctx, record.methodology),
  };
  const qualities = [
    result.overview.quality,
    result.methodology.dataQualityStatus,
    ...result.overview.scopeBreakdown.map((scope) => scope.quality),
    ...result.history.map((point) => point.quality),
  ];
  if (result.source.synthetic && result.overview.quality !== 'prototype') {
    ctx.issues.push('overview.quality must be prototype for a synthetic carbon document');
  }
  if (result.source.synthetic && result.methodology.dataQualityStatus !== 'prototype') {
    ctx.issues.push('methodology.dataQualityStatus must be prototype for a synthetic carbon document');
  }
  if (result.source.synthetic && result.source.verificationReference !== null) {
    ctx.issues.push('source.verificationReference must be null for a synthetic carbon document');
  }
  if (result.source.synthetic) {
    for (const scope of result.overview.scopeBreakdown) {
      if (scope.quality !== 'prototype' && scope.quality !== 'pending') {
        ctx.issues.push(`${scope.scope} quality must be prototype or pending for a synthetic carbon document`);
      }
    }
    for (const point of result.history) {
      if (point.quality !== 'prototype' && point.quality !== 'pending') {
        ctx.issues.push(`history quality for ${point.year} must be prototype or pending for a synthetic carbon document`);
      }
    }
  }
  if (!result.source.synthetic && result.source.publicationStatus !== 'reported') {
    ctx.issues.push('non-synthetic carbon documents must be reported before they cross the public provider boundary');
  }
  if (!result.source.synthetic && qualities.includes('prototype')) {
    ctx.issues.push('non-synthetic carbon documents cannot contain prototype quality records');
  }
  if (qualities.includes('verified') && result.source.verificationReference === null) {
    ctx.issues.push('source.verificationReference is required when any carbon record is verified');
  }
  for (const scope of result.overview.scopeBreakdown) {
    if (scope.value === null && scope.quality !== 'pending' && scope.quality !== 'prototype') {
      ctx.issues.push(`${scope.scope} cannot be ${scope.quality} when its value is null`);
    }
  }
  ctx.finish();
  return structuredClone(result);
}
