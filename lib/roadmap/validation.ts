import type { DataQuality } from '@/lib/data-quality';
import type { PublicationStatus } from '@/lib/provider-metadata';
import { ValidationContext, isTimestampTooFarFuture, normalizePublicHttpUrl } from '@/lib/validation/runtime';
import type { RoadmapArea, RoadmapProgress } from '@/lib/roadmap/types';

const qualities = ['measured', 'estimated', 'verified', 'prototype', 'pending'] as const;
const publicationStatuses = ['prototype', 'draft', 'reported'] as const;
const stages = ['Planning', 'Baseline established', 'Pilot', 'Implementation', 'Scaling', 'Institutionalized'] as const;

export interface RoadmapConfigSource {
  id: string;
  label: string;
  synthetic: boolean;
  generatedAt: string;
  publicationStatus: PublicationStatus;
  quality: DataQuality;
  methodologyVersion: string;
  verificationReference: string | null;
}

export interface RoadmapConfigDocument {
  schemaVersion: 1;
  source: RoadmapConfigSource;
  areas: RoadmapArea[];
}

function nullableString(ctx: ValidationContext, value: unknown, path: string): string | null {
  if (value === null) return null;
  return ctx.string(value, path, { nullable: true });
}

function stringArray(ctx: ValidationContext, value: unknown, path: string): string[] {
  return ctx.array(value, path, { maxLength: 100 }).map((item, index) => ctx.string(item, `${path}[${index}]`) ?? '');
}

function progress(ctx: ValidationContext, value: unknown, path: string): RoadmapProgress {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, ['stage', 'percent', 'metricLabel', 'quality'], path);
  const percent = ctx.number(record.percent, `${path}.percent`, { nullable: true, min: 0, max: 100 });
  const metricLabel = nullableString(ctx, record.metricLabel, `${path}.metricLabel`);
  if ((percent === null) !== (metricLabel === null)) {
    ctx.issues.push(`${path}.percent and ${path}.metricLabel must either both be supplied or both be null`);
  }
  return {
    stage: ctx.enum(record.stage, stages, `${path}.stage`),
    percent,
    metricLabel,
    quality: ctx.enum(record.quality, qualities, `${path}.quality`),
  };
}

function area(ctx: ValidationContext, value: unknown, path: string): RoadmapArea {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, [
    'id', 'title', 'summary', 'target', 'progress', 'exampleActions', 'futureGoals',
    'linkedPublicProjectIds', 'methodologyNote',
  ], path);
  const target = nullableString(ctx, record.target, `${path}.target`);
  const methodologyNote = nullableString(ctx, record.methodologyNote, `${path}.methodologyNote`);
  if (target !== null && methodologyNote === null) {
    ctx.issues.push(`${path}.methodologyNote is required when a target is supplied`);
  }
  const linkedPublicProjectIds = stringArray(ctx, record.linkedPublicProjectIds, `${path}.linkedPublicProjectIds`);
  if (new Set(linkedPublicProjectIds).size !== linkedPublicProjectIds.length) {
    ctx.issues.push(`${path}.linkedPublicProjectIds must not contain duplicates`);
  }
  return {
    id: ctx.string(record.id, `${path}.id`) ?? '',
    title: ctx.string(record.title, `${path}.title`) ?? '',
    summary: ctx.string(record.summary, `${path}.summary`) ?? '',
    target,
    progress: progress(ctx, record.progress, `${path}.progress`),
    exampleActions: stringArray(ctx, record.exampleActions, `${path}.exampleActions`),
    futureGoals: stringArray(ctx, record.futureGoals, `${path}.futureGoals`),
    linkedPublicProjectIds,
    methodologyNote,
  };
}

function reference(ctx: ValidationContext, value: unknown): string | null {
  const result = nullableString(ctx, value, 'source.verificationReference');
  if (result !== null) {
    try {
      normalizePublicHttpUrl(result);
    } catch {
      ctx.issues.push('source.verificationReference must be a public HTTP(S) URL without credentials or null');
    }
  }
  return result;
}

export function validateRoadmapConfigDocument(value: unknown, now = new Date()): RoadmapConfigDocument {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'document');
  ctx.onlyKeys(record, ['schemaVersion', 'source', 'areas'], 'document');
  if (ctx.number(record.schemaVersion, 'schemaVersion', { integer: true }) !== 1) ctx.issues.push('schemaVersion must equal 1');

  const sourceRecord = ctx.record(record.source, 'source');
  ctx.onlyKeys(sourceRecord, [
    'id', 'label', 'synthetic', 'generatedAt', 'publicationStatus', 'quality',
    'methodologyVersion', 'verificationReference',
  ], 'source');
  const synthetic = ctx.boolean(sourceRecord.synthetic, 'source.synthetic');
  const publicationStatus = ctx.enum(sourceRecord.publicationStatus, publicationStatuses, 'source.publicationStatus');
  const quality = ctx.enum(sourceRecord.quality, qualities, 'source.quality');
  const verificationReference = reference(ctx, sourceRecord.verificationReference);
  if (synthetic && publicationStatus !== 'prototype') ctx.issues.push('source.publicationStatus must be prototype when source.synthetic is true');
  if (!synthetic && publicationStatus === 'prototype') ctx.issues.push('source.publicationStatus cannot be prototype when source.synthetic is false');
  if (!synthetic && publicationStatus !== 'reported') ctx.issues.push('non-synthetic roadmap documents must be reported before they cross the public provider boundary');
  if (synthetic && quality !== 'prototype') ctx.issues.push('source.quality must be prototype for a synthetic document');
  if (!synthetic && quality === 'prototype') ctx.issues.push('source.quality cannot be prototype for a non-synthetic document');
  if (synthetic && verificationReference !== null) ctx.issues.push('source.verificationReference must be null for a synthetic roadmap document');
  if (quality === 'verified' && verificationReference === null) ctx.issues.push('source.verificationReference is required when source.quality is verified');

  const areas = ctx.array(record.areas, 'areas', { maxLength: 100 }).map((item, index) => area(ctx, item, `areas[${index}]`));
  const areaIds = new Set<string>();
  for (const item of areas) {
    if (areaIds.has(item.id)) ctx.issues.push(`areas contains duplicate id ${item.id}`);
    areaIds.add(item.id);
    if (!synthetic && item.progress.quality === 'prototype') ctx.issues.push(`${item.id} cannot use prototype progress quality in a non-synthetic document`);
    if (synthetic && item.progress.quality !== 'prototype' && item.progress.quality !== 'pending') ctx.issues.push(`${item.id} must use prototype or pending progress quality in a synthetic document`);
    if (item.progress.quality === 'verified' && verificationReference === null) ctx.issues.push(`source.verificationReference is required when ${item.id} progress is verified`);
  }

  const generatedAt = ctx.isoTimestamp(sourceRecord.generatedAt, 'source.generatedAt');
  if (isTimestampTooFarFuture(generatedAt, now)) ctx.issues.push('source.generatedAt must not be more than 5 minutes in the future');
  const source: RoadmapConfigSource = {
    id: ctx.string(sourceRecord.id, 'source.id') ?? '',
    label: ctx.string(sourceRecord.label, 'source.label') ?? '',
    synthetic,
    generatedAt,
    publicationStatus,
    quality,
    methodologyVersion: ctx.string(sourceRecord.methodologyVersion, 'source.methodologyVersion') ?? '',
    verificationReference,
  };
  ctx.finish();
  return structuredClone({ schemaVersion: 1, source, areas });
}
