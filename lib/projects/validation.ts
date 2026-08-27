import type { DataQuality } from '../data-quality';
import type { PublicationStatus } from '../provider-metadata';
import { ValidationContext, isIsoDateOrderValid, isTimestampTooFarFuture } from '../validation/runtime';
import type { ProjectMetricEquivalency, PublicProject, PublicProjectMetric, ProjectMilestone } from './types';

const categories = ['Energy & Buildings', 'Waste & Circularity', 'Food Systems', 'Transportation', 'Education & Engagement'] as const;
const statuses = ['Exploring', 'Active', 'Learning'] as const;
const milestoneStages = ['Exploring', 'Planning', 'Active', 'Learning'] as const;
const qualities = ['measured', 'estimated', 'verified', 'prototype', 'pending'] as const;
const publicationStatuses = ['prototype', 'draft', 'reported'] as const;
const metricTypes = ['activity-count', 'mass-diverted', 'estimated-emissions-avoided', 'certified-offset-retired', 'funds-raised', 'other'] as const;

export interface StartSnapshotSource {
  id: string;
  label: string;
  synthetic: boolean;
  generatedAt: string;
  publicationStatus: PublicationStatus;
  quality: DataQuality;
}

export interface StartPublicSnapshot {
  schemaVersion: 1;
  source: StartSnapshotSource;
  publicProjects: PublicProject[];
}

function parseQuality(ctx: ValidationContext, value: unknown, path: string): DataQuality {
  return ctx.enum(value, qualities, path);
}

function optionalString(ctx: ValidationContext, value: unknown, path: string): string | null {
  if (value === null) return null;
  return ctx.string(value, path, { nullable: true });
}

function optionalIsoDate(ctx: ValidationContext, value: unknown, path: string): string | null {
  if (value === null || value === undefined) return null;
  return ctx.isoDate(value, path);
}

function parseHttpUrl(ctx: ValidationContext, value: string | null, path: string): string | null {
  if (value === null) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol');
    return url.toString();
  } catch {
    ctx.issues.push(`${path} must be an HTTP(S) URL or null`);
    return value;
  }
}

function parseEquivalency(ctx: ValidationContext, value: unknown, path: string): ProjectMetricEquivalency {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, ['label', 'value', 'unit', 'methodology', 'sourceReference'], path);
  const sourceReferenceRaw = ctx.string(record.sourceReference, `${path}.sourceReference`) ?? '';
  const sourceReference = parseHttpUrl(ctx, sourceReferenceRaw, `${path}.sourceReference`);
  return {
    label: ctx.string(record.label, `${path}.label`) ?? '',
    value: ctx.number(record.value, `${path}.value`, { min: 0 }) ?? 0,
    unit: ctx.string(record.unit, `${path}.unit`) ?? '',
    methodology: ctx.string(record.methodology, `${path}.methodology`) ?? '',
    sourceReference: sourceReference ?? '',
  };
}

function parseMetric(ctx: ValidationContext, value: unknown, path: string, syntheticSource: boolean): PublicProjectMetric {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, [
    'id', 'label', 'metricType', 'value', 'unit', 'periodStart', 'periodEnd', 'quality',
    'sourceLabel', 'methodologyNote', 'evidenceReference', 'equivalencies',
  ], path);
  const metricType = ctx.enum(record.metricType, metricTypes, `${path}.metricType`);
  const metricValue = record.value === null ? null : ctx.number(record.value, `${path}.value`, { nullable: true, min: 0 });
  const quality = parseQuality(ctx, record.quality, `${path}.quality`);
  const periodStart = optionalIsoDate(ctx, record.periodStart, `${path}.periodStart`);
  const periodEnd = optionalIsoDate(ctx, record.periodEnd, `${path}.periodEnd`);
  const methodologyNote = optionalString(ctx, record.methodologyNote, `${path}.methodologyNote`);
  const evidenceReference = parseHttpUrl(ctx, optionalString(ctx, record.evidenceReference, `${path}.evidenceReference`), `${path}.evidenceReference`);
  const equivalencies = ctx.array(record.equivalencies ?? [], `${path}.equivalencies`, { maxLength: 5 })
    .map((item, index) => parseEquivalency(ctx, item, `${path}.equivalencies[${index}]`));
  if ((periodStart === null) !== (periodEnd === null)) ctx.issues.push(`${path}.periodStart and periodEnd must both be supplied or both be null`);
  if (periodStart !== null && periodEnd !== null && !isIsoDateOrderValid(periodStart, periodEnd)) ctx.issues.push(`${path}.periodStart must not be after periodEnd`);
  if (metricValue !== null && (periodStart === null || periodEnd === null)) ctx.issues.push(`${path}.periodStart and periodEnd are required for a reported metric value`);
  if (metricValue === null && !['pending', 'prototype'].includes(quality)) ctx.issues.push(`${path}.quality must be pending or prototype when value is null`);
  if (metricValue !== null && ['estimated-emissions-avoided', 'certified-offset-retired'].includes(metricType) && methodologyNote === null) {
    ctx.issues.push(`${path}.methodologyNote is required for emissions estimates and retired credits`);
  }
  if (metricType === 'estimated-emissions-avoided' && metricValue !== null && evidenceReference === null) {
    ctx.issues.push(`${path}.evidenceReference is required for a published modeled emissions quantity`);
  }
  if (metricType === 'certified-offset-retired' && metricValue !== null && evidenceReference === null) {
    ctx.issues.push(`${path}.evidenceReference is required for a retired carbon credit quantity`);
  }
  if (quality === 'verified' && evidenceReference === null) ctx.issues.push(`${path}.evidenceReference is required for verified quality`);
  if (metricValue === null && equivalencies.length > 0) ctx.issues.push(`${path}.equivalencies require a reported metric value`);
  if (equivalencies.length > 0 && !['estimated-emissions-avoided', 'certified-offset-retired'].includes(metricType)) {
    ctx.issues.push(`${path}.equivalencies are allowed only for an emissions estimate or retired-credit quantity`);
  }
  if (syntheticSource && metricValue !== null) ctx.issues.push(`${path}.value must be null for a synthetic project snapshot`);
  if (syntheticSource && !['prototype', 'pending'].includes(quality)) ctx.issues.push(`${path}.quality must be prototype or pending for a synthetic snapshot`);
  if (!syntheticSource && quality === 'prototype') ctx.issues.push(`${path}.quality cannot be prototype for a non-synthetic snapshot`);
  return {
    id: ctx.string(record.id, `${path}.id`) ?? '',
    label: ctx.string(record.label, `${path}.label`) ?? '',
    metricType,
    value: metricValue,
    unit: ctx.string(record.unit, `${path}.unit`) ?? '',
    periodStart,
    periodEnd,
    quality,
    sourceLabel: ctx.string(record.sourceLabel, `${path}.sourceLabel`) ?? '',
    methodologyNote,
    evidenceReference,
    equivalencies,
  };
}

function parseMilestone(ctx: ValidationContext, value: unknown, path: string): ProjectMilestone {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, ['label', 'stage', 'target'], path);
  return {
    label: ctx.string(record.label, `${path}.label`) ?? '',
    stage: ctx.enum(record.stage, milestoneStages, `${path}.stage`),
    target: ctx.string(record.target, `${path}.target`) ?? '',
  };
}

function parseProject(ctx: ValidationContext, value: unknown, path: string, syntheticSource: boolean): PublicProject {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, [
    'id', 'title', 'category', 'status', 'summary', 'milestone', 'impact', 'impactQuality',
    'metrics', 'verificationReference', 'nextPublicStep', 'updatedAt', 'quality',
  ], path);
  const impact = optionalString(ctx, record.impact, `${path}.impact`);
  const impactQuality = parseQuality(ctx, record.impactQuality, `${path}.impactQuality`);
  const projectQuality = parseQuality(ctx, record.quality, `${path}.quality`);
  const verificationReference = optionalString(ctx, record.verificationReference, `${path}.verificationReference`);
  if (impact === null && impactQuality !== 'pending' && impactQuality !== 'prototype') {
    ctx.issues.push(`${path}.impactQuality must be pending when impact is null`);
  }
  if ((impactQuality === 'verified' || projectQuality === 'verified') && verificationReference === null) {
    ctx.issues.push(`${path}.verificationReference is required for a verified impact or update`);
  }
  if (verificationReference !== null) {
    try {
      const url = new URL(verificationReference);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol');
    } catch {
      ctx.issues.push(`${path}.verificationReference must be an HTTP(S) URL or null`);
    }
  }
  if (!syntheticSource && impactQuality === 'prototype') {
    ctx.issues.push(`${path}.impactQuality cannot be prototype for a non-synthetic snapshot`);
  }
  if (!syntheticSource && projectQuality === 'prototype') {
    ctx.issues.push(`${path}.quality cannot be prototype for a non-synthetic snapshot`);
  }
  if (syntheticSource && !['prototype', 'pending'].includes(impactQuality)) {
    ctx.issues.push(`${path}.impactQuality must be prototype or pending for a synthetic snapshot`);
  }
  if (syntheticSource && !['prototype', 'pending'].includes(projectQuality)) {
    ctx.issues.push(`${path}.quality must be prototype or pending for a synthetic snapshot`);
  }
  const metrics = ctx.array(record.metrics ?? [], `${path}.metrics`, { maxLength: 25 })
    .map((item, index) => parseMetric(ctx, item, `${path}.metrics[${index}]`, syntheticSource));
  const metricIds = new Set<string>();
  for (const metric of metrics) {
    if (metricIds.has(metric.id)) ctx.issues.push(`${path}.metrics contains duplicate id ${metric.id}`);
    metricIds.add(metric.id);
  }
  return {
    id: ctx.string(record.id, `${path}.id`) ?? '',
    title: ctx.string(record.title, `${path}.title`) ?? '',
    category: ctx.enum(record.category, categories, `${path}.category`),
    status: ctx.enum(record.status, statuses, `${path}.status`),
    summary: ctx.string(record.summary, `${path}.summary`) ?? '',
    milestone: parseMilestone(ctx, record.milestone, `${path}.milestone`),
    impact,
    impactQuality,
    metrics,
    verificationReference,
    nextPublicStep: optionalString(ctx, record.nextPublicStep, `${path}.nextPublicStep`),
    updatedAt: ctx.isoDate(record.updatedAt, `${path}.updatedAt`),
    quality: projectQuality,
  };
}

export function validateStartPublicSnapshot(value: unknown, now = new Date()): StartPublicSnapshot {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'snapshot');
  ctx.onlyKeys(record, ['schemaVersion', 'source', 'publicProjects'], 'snapshot');
  const schemaVersion = ctx.number(record.schemaVersion, 'schemaVersion', { integer: true });
  if (schemaVersion !== 1) ctx.issues.push('schemaVersion must equal 1');

  const sourceRecord = ctx.record(record.source, 'source');
  ctx.onlyKeys(sourceRecord, ['id', 'label', 'synthetic', 'generatedAt', 'publicationStatus', 'quality'], 'source');
  const synthetic = ctx.boolean(sourceRecord.synthetic, 'source.synthetic');
  const publicationStatus = ctx.enum(sourceRecord.publicationStatus, publicationStatuses, 'source.publicationStatus');
  if (synthetic && publicationStatus !== 'prototype') ctx.issues.push('source.publicationStatus must be prototype when source.synthetic is true');
  if (!synthetic && publicationStatus === 'prototype') ctx.issues.push('source.publicationStatus cannot be prototype when source.synthetic is false');
  const generatedAt = ctx.isoTimestamp(sourceRecord.generatedAt, 'source.generatedAt');
  if (isTimestampTooFarFuture(generatedAt, now)) ctx.issues.push('source.generatedAt must not be more than 5 minutes in the future');
  const source: StartSnapshotSource = {
    id: ctx.string(sourceRecord.id, 'source.id') ?? '',
    label: ctx.string(sourceRecord.label, 'source.label') ?? '',
    synthetic,
    generatedAt,
    publicationStatus,
    quality: parseQuality(ctx, sourceRecord.quality, 'source.quality'),
  };
  if (synthetic && source.quality !== 'prototype') ctx.issues.push('source.quality must be prototype for a synthetic snapshot');
  if (!synthetic && source.quality === 'prototype') ctx.issues.push('source.quality cannot be prototype for a non-synthetic snapshot');

  const publicProjects = ctx.array(record.publicProjects, 'publicProjects')
    .map((item, index) => parseProject(ctx, item, `publicProjects[${index}]`, synthetic));
  const ids = new Set<string>();
  for (const project of publicProjects) {
    if (ids.has(project.id)) ctx.issues.push(`publicProjects contains duplicate id ${project.id}`);
    ids.add(project.id);
    if (!isIsoDateOrderValid(project.updatedAt, generatedAt)) {
      ctx.issues.push(`publicProjects.${project.id}.updatedAt must not be after source.generatedAt`);
    }
    for (const metric of project.metrics) {
      if (metric.periodEnd !== null && !isIsoDateOrderValid(metric.periodEnd, generatedAt)) {
        ctx.issues.push(`publicProjects.${project.id}.metrics.${metric.id}.periodEnd must not be after source.generatedAt`);
      }
    }
  }
  if (source.quality === 'verified' && !publicProjects.some((project) => project.impactQuality === 'verified' || project.quality === 'verified')) {
    ctx.issues.push('source.quality cannot be verified without at least one public project verification reference');
  }
  ctx.finish();
  return structuredClone({ schemaVersion: 1, source, publicProjects });
}
