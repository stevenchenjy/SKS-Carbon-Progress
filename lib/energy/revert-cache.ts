import type { EnergyHistoryRange, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export interface RevertCache {
  getSnapshot(now: Date): EnergySnapshot | undefined;
  setSnapshot(value: EnergySnapshot, expiresAt: Date): void;
  getHistory(range: EnergyHistoryRange, now: Date): EnergyPoint[] | undefined;
  setHistory(range: EnergyHistoryRange, value: EnergyPoint[], expiresAt: Date): void;
  clear(): void;
}

export class MemoryRevertCache implements RevertCache {
  private snapshot: CacheEntry<EnergySnapshot> | undefined;
  private readonly history = new Map<EnergyHistoryRange, CacheEntry<EnergyPoint[]>>();

  getSnapshot(now: Date): EnergySnapshot | undefined {
    if (!this.snapshot) return undefined;
    if (this.snapshot.expiresAt <= now.getTime()) {
      this.snapshot = undefined;
      return undefined;
    }
    return structuredClone(this.snapshot.value);
  }

  setSnapshot(value: EnergySnapshot, expiresAt: Date): void {
    this.snapshot = { value: structuredClone(value), expiresAt: expiresAt.getTime() };
  }

  getHistory(range: EnergyHistoryRange, now: Date): EnergyPoint[] | undefined {
    const entry = this.history.get(range);
    if (!entry) return undefined;
    if (entry.expiresAt <= now.getTime()) {
      this.history.delete(range);
      return undefined;
    }
    return structuredClone(entry.value);
  }

  setHistory(range: EnergyHistoryRange, value: EnergyPoint[], expiresAt: Date): void {
    this.history.set(range, { value: structuredClone(value), expiresAt: expiresAt.getTime() });
  }

  clear(): void {
    this.snapshot = undefined;
    this.history.clear();
  }
}
