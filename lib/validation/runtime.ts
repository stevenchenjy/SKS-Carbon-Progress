import { PayloadValidationError } from '../providers/errors.ts';

export type UnknownRecord = Record<string, unknown>;

const isoDatePattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/;
const isoTimestampPattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

function hasValidCalendarDate(value: string): boolean {
  const datePart = value.slice(0, 10);
  if (!isoDatePattern.test(datePart)) return false;
  const [year, month, day] = datePart.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export class ValidationContext {
  readonly issues: string[] = [];

  record(value: unknown, path: string): UnknownRecord {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      this.issues.push(`${path} must be an object`);
      return {};
    }
    return value as UnknownRecord;
  }

  array(value: unknown, path: string, options: { maxLength?: number } = {}): unknown[] {
    if (!Array.isArray(value)) {
      this.issues.push(`${path} must be an array`);
      return [];
    }
    const maxLength = options.maxLength ?? 1_000;
    if (value.length > maxLength) this.issues.push(`${path} must contain no more than ${maxLength} items`);
    return value.slice(0, maxLength);
  }

  string(value: unknown, path: string, options: { nullable?: boolean; maxLength?: number } = {}): string | null {
    if (value === null && options.nullable) return null;
    if (typeof value !== 'string' || value.trim() === '') {
      this.issues.push(`${path} must be a non-empty string${options.nullable ? ' or null' : ''}`);
      return null;
    }
    const result = value.trim();
    const maxLength = options.maxLength ?? 5_000;
    if (result.length > maxLength) this.issues.push(`${path} must be no longer than ${maxLength} characters`);
    return result;
  }

  number(value: unknown, path: string, options: { nullable?: boolean; min?: number; max?: number; integer?: boolean } = {}): number | null {
    if (value === null && options.nullable) return null;
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      this.issues.push(`${path} must be a finite number${options.nullable ? ' or null' : ''}`);
      return null;
    }
    if (options.integer && !Number.isInteger(value)) this.issues.push(`${path} must be an integer`);
    if (options.min !== undefined && value < options.min) this.issues.push(`${path} must be at least ${options.min}`);
    if (options.max !== undefined && value > options.max) this.issues.push(`${path} must be at most ${options.max}`);
    return value;
  }

  boolean(value: unknown, path: string): boolean {
    if (typeof value !== 'boolean') {
      this.issues.push(`${path} must be a boolean`);
      return false;
    }
    return value;
  }

  enum<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
    if (typeof value !== 'string' || !allowed.includes(value as T)) {
      this.issues.push(`${path} must be one of: ${allowed.join(', ')}`);
      return allowed[0];
    }
    return value as T;
  }

  isoDate(value: unknown, path: string): string {
    const result = this.string(value, path);
    if (result !== null && (!isoDatePattern.test(result) || !hasValidCalendarDate(result))) {
      this.issues.push(`${path} must be a valid ISO date in YYYY-MM-DD format`);
    }
    return result ?? '';
  }

  isoTimestamp(value: unknown, path: string): string {
    const result = this.string(value, path);
    if (result !== null && (!isoTimestampPattern.test(result) || !hasValidCalendarDate(result) || Number.isNaN(Date.parse(result)))) {
      this.issues.push(`${path} must be a valid ISO timestamp with a timezone`);
    }
    return result ?? '';
  }

  onlyKeys(record: UnknownRecord, allowed: readonly string[], path: string): void {
    for (const key of Object.keys(record)) {
      if (!allowed.includes(key)) this.issues.push(`${path}.${key} is not allowed by the public contract`);
    }
  }

  finish(): void {
    if (this.issues.length > 0) throw new PayloadValidationError(this.issues);
  }
}

export function isIsoDateOrderValid(start: string, end: string): boolean {
  return !Number.isNaN(Date.parse(start)) && !Number.isNaN(Date.parse(end)) && Date.parse(start) <= Date.parse(end);
}

export function isTimestampTooFarFuture(value: string, now = new Date(), futureSkewMinutes = 5): boolean {
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && timestamp > now.getTime() + futureSkewMinutes * 60_000;
}
