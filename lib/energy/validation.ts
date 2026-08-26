import type { DataQuality } from '../data-quality';
import { ValidationContext } from '../validation/runtime';
import type { EnergyCoverage, EnergyImpact, EnergyPoint, EnergySnapshot } from './types';

const qualities = ['measured', 'estimated', 'verified', 'prototype', 'pending'] as const;
const coverageKinds = ['campus-wide', 'selected-devices', 'selected-zones', 'building', 'unknown'] as const;

function quality(ctx: ValidationContext, value: unknown, path: string): DataQuality {
  return ctx.enum(value, qualities, path);
}

function coverage(ctx: ValidationContext, value: unknown, path: string): EnergyCoverage {
  const record = ctx.record(value, path);
  ctx.onlyKeys(record, ['kind', 'label', 'monitoredDeviceCount', 'note'], path);
  return {
    kind: ctx.enum(record.kind, coverageKinds, `${path}.kind`),
    label: ctx.string(record.label, `${path}.label`) ?? '',
    monitoredDeviceCount: ctx.number(record.monitoredDeviceCount, `${path}.monitoredDeviceCount`, { nullable: true, integer: true, min: 0 }),
    note: ctx.string(record.note, `${path}.note`) ?? '',
  };
}

function rejectFutureTimestamp(ctx: ValidationContext, value: string, path: string, now: Date, futureSkewMinutes = 5): void {
  if (Date.parse(value) > now.getTime() + futureSkewMinutes * 60_000) {
    ctx.issues.push(`${path} must not be more than ${futureSkewMinutes} minutes in the future`);
  }
}

export function validateEnergySnapshot(value: unknown, now = new Date()): EnergySnapshot {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'snapshot');
  ctx.onlyKeys(record, ['currentPowerKw', 'energyTodayKwh', 'weeklyTrendPercent', 'lastUpdatedAt', 'quality', 'coverage'], 'snapshot');
  const result: EnergySnapshot = {
    currentPowerKw: ctx.number(record.currentPowerKw, 'snapshot.currentPowerKw', { nullable: true, min: 0 }),
    energyTodayKwh: ctx.number(record.energyTodayKwh, 'snapshot.energyTodayKwh', { nullable: true, min: 0 }),
    weeklyTrendPercent: ctx.number(record.weeklyTrendPercent, 'snapshot.weeklyTrendPercent', { nullable: true }),
    lastUpdatedAt: ctx.isoTimestamp(record.lastUpdatedAt, 'snapshot.lastUpdatedAt'),
    quality: quality(ctx, record.quality, 'snapshot.quality'),
    coverage: coverage(ctx, record.coverage, 'snapshot.coverage'),
  };
  rejectFutureTimestamp(ctx, result.lastUpdatedAt, 'snapshot.lastUpdatedAt', now);
  ctx.finish();
  return structuredClone(result);
}

export function validateEnergyPoints(value: unknown, expectedUnit: EnergyPoint['unit'], now = new Date()): EnergyPoint[] {
  const ctx = new ValidationContext();
  const result = ctx.array(value, 'points').map((item, index) => {
    const path = `points[${index}]`;
    const record = ctx.record(item, path);
    ctx.onlyKeys(record, ['timestamp', 'label', 'value', 'unit', 'quality'], path);
    const unit = ctx.enum(record.unit, ['kW', 'kWh'] as const, `${path}.unit`);
    if (unit !== expectedUnit) ctx.issues.push(`${path}.unit must be ${expectedUnit} for this series`);
    const timestamp = ctx.isoTimestamp(record.timestamp, `${path}.timestamp`);
    rejectFutureTimestamp(ctx, timestamp, `${path}.timestamp`, now);
    return {
      timestamp,
      label: ctx.string(record.label, `${path}.label`) ?? '',
      value: ctx.number(record.value, `${path}.value`, { nullable: true, min: 0 }),
      unit,
      quality: quality(ctx, record.quality, `${path}.quality`),
    } satisfies EnergyPoint;
  });
  ctx.finish();
  return structuredClone(result);
}

export function validateEnergyImpact(value: unknown): EnergyImpact {
  const ctx = new ValidationContext();
  const record = ctx.record(value, 'impact');
  ctx.onlyKeys(record, ['avoidedEnergyKwh', 'comparisonMethod', 'quality'], 'impact');
  const result: EnergyImpact = {
    avoidedEnergyKwh: ctx.number(record.avoidedEnergyKwh, 'impact.avoidedEnergyKwh', { nullable: true, min: 0 }),
    comparisonMethod: ctx.string(record.comparisonMethod, 'impact.comparisonMethod') ?? '',
    quality: quality(ctx, record.quality, 'impact.quality'),
  };
  ctx.finish();
  return structuredClone(result);
}

export function classifyFreshness(observedAt: string, staleAfterMinutes: number, now = new Date(), futureSkewMinutes = 5): 'live' | 'stale' {
  const ageMs = now.getTime() - Date.parse(observedAt);
  return ageMs >= -futureSkewMinutes * 60_000 && ageMs <= staleAfterMinutes * 60_000 ? 'live' : 'stale';
}
