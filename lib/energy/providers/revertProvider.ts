import type { EnergyProvider } from '@/lib/energy/provider';
import type { EnergyHistoryRange, EnergyImpact, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import { asProviderError, ProviderError } from '@/lib/providers/errors';
import { classifyFreshness, validateEnergyImpact, validateEnergyPoints, validateEnergySnapshot } from '@/lib/energy/validation';
import { MemoryRevertCache, type RevertCache } from '@/lib/energy/revert-cache';
import { PayloadValidationError } from '@/lib/providers/errors';

export const REVERT_ENVIRONMENT_VARIABLES = ['REVERT_API_KEY', 'REVERT_API_URL'] as const;

export interface RevertConfig {
  apiKey: string;
  apiUrl: string;
  staleAfterMinutes: number;
  cacheTtlSeconds?: number;
}

export type RevertHealthState = 'ready' | 'not-configured' | 'transport-missing' | 'not-supported' | 'unavailable';

export interface RevertHealthReport {
  state: RevertHealthState;
  checkedAt: string;
  message: string;
}

export interface RevertTransport {
  checkHealth?(): Promise<void>;
  getCurrentUsage(): Promise<unknown>;
  getHistoricalUsage(range: EnergyHistoryRange): Promise<unknown>;
  getImpactSummary?(): Promise<unknown>;
}

export class RevertProvider implements EnergyProvider {
  private snapshotPromise: Promise<EnergySnapshot> | undefined;
  private readonly historyPromises = new Map<EnergyHistoryRange, Promise<EnergyPoint[]>>();
  private snapshotOrigin: 'transport' | 'cache' = 'transport';

  constructor(
    private readonly config: RevertConfig,
    private readonly transport?: RevertTransport,
    private readonly now: () => Date = () => new Date(),
    private readonly cache: RevertCache = new MemoryRevertCache(),
  ) {}

  private cacheExpiration(): Date {
    return new Date(this.now().getTime() + (this.config.cacheTtlSeconds ?? 60) * 1_000);
  }

  private assertRealQuality(quality: EnergySnapshot['quality'] | EnergyPoint['quality'] | EnergyImpact['quality'], path: string): void {
    if (quality === 'prototype') throw new PayloadValidationError([`${path} cannot be prototype for the real Revert provider`]);
    if (quality === 'verified') throw new PayloadValidationError([`${path} cannot be verified because the normalized Revert contract has no verification-evidence field`]);
  }

  private requireTransport(): RevertTransport {
    if (!this.config.apiKey || !this.config.apiUrl) throw new ProviderError('PROVIDER_MISCONFIGURED');
    if (!this.transport) throw new ProviderError('PROVIDER_UNAVAILABLE', { detail: 'Official Revert transport is not implemented.' });
    return this.transport;
  }

  private loadSnapshot(): Promise<EnergySnapshot> {
    const cached = this.cache.getSnapshot(this.now());
    if (cached) {
      this.snapshotOrigin = 'cache';
      return Promise.resolve(cached);
    }
    if (this.snapshotPromise) return this.snapshotPromise;
    const request = this.requireTransport().getCurrentUsage()
      .then((payload) => validateEnergySnapshot(payload, this.now()))
      .then((snapshot) => {
        this.assertRealQuality(snapshot.quality, 'snapshot.quality');
        this.snapshotOrigin = 'transport';
        this.cache.setSnapshot(snapshot, this.cacheExpiration());
        return snapshot;
      })
      .catch((error) => {
        throw asProviderError(error);
      })
      .finally(() => {
        if (this.snapshotPromise === request) this.snapshotPromise = undefined;
      });
    this.snapshotPromise = request;
    return request;
  }

  async checkHealth(): Promise<RevertHealthReport> {
    const checkedAt = this.now().toISOString();
    if (!this.config.apiKey || !this.config.apiUrl) {
      return { state: 'not-configured', checkedAt, message: 'Required Revert configuration is incomplete.' };
    }
    if (!this.transport) {
      return { state: 'transport-missing', checkedAt, message: 'The official Revert transport adapter is not implemented.' };
    }
    if (!this.transport.checkHealth) {
      return { state: 'not-supported', checkedAt, message: 'The selected transport does not expose a reviewed health check.' };
    }
    try {
      await this.transport.checkHealth();
      return { state: 'ready', checkedAt, message: 'The configured transport completed its health check.' };
    } catch {
      return { state: 'unavailable', checkedAt, message: 'The configured transport health check failed.' };
    }
  }

  async getMetadata(): Promise<ProviderMetadata> {
    if (!this.transport) {
      return {
        synthetic: false,
        status: 'pending',
        provider: 'revert-unavailable',
        sourceLabel: 'Revert Tech connection not active',
        disclosure: 'No official Revert transport contract has been implemented, so no energy reading is presented as live or measured.',
        availability: 'unavailable',
        publicationStatus: 'draft',
        freshness: { state: 'unavailable', observedAt: null, staleAfterMinutes: this.config.staleAfterMinutes },
        coverage: { kind: 'unknown', label: 'Coverage unavailable', note: 'Monitored device or zone coverage has not been supplied.', monitoredDeviceCount: null },
        reportingPeriod: null,
        sourceType: 'vendor-feed',
        verification: { state: 'not-verified', reference: null, note: 'No energy result is available to verify.' },
        methodologyNote: 'Official vendor transport and field mapping are pending.',
      };
    }
    const snapshot = await this.loadSnapshot();
    const classifiedFreshness = classifyFreshness(snapshot.lastUpdatedAt, this.config.staleAfterMinutes, this.now());
    return {
      synthetic: false,
      status: snapshot.quality,
      provider: 'revert',
      sourceLabel: 'Revert Tech monitored energy feed',
      disclosure: `${snapshot.coverage.note} Coverage is never assumed to represent total campus electricity unless explicitly identified as campus-wide.`,
      availability: snapshot.currentPowerKw === null && snapshot.energyTodayKwh === null ? 'partial' : 'available',
      publicationStatus: 'reported',
      freshness: {
        state: classifiedFreshness === 'live' && this.snapshotOrigin === 'cache' ? 'cached' : classifiedFreshness,
        observedAt: snapshot.lastUpdatedAt,
        staleAfterMinutes: this.config.staleAfterMinutes,
      },
      coverage: { ...structuredClone(snapshot.coverage) },
      reportingPeriod: null,
      sourceType: 'vendor-feed',
      verification: { state: 'not-verified', reference: null, note: 'Vendor readings are not independently verified by this application.' },
      methodologyNote: 'Coverage and measurement semantics are supplied by the normalized Revert transport adapter.',
    };
  }

  async getCurrentUsage(): Promise<EnergySnapshot> {
    return structuredClone(await this.loadSnapshot());
  }

  async getHistoricalUsage(range: EnergyHistoryRange): Promise<EnergyPoint[]> {
    const cached = this.cache.getHistory(range, this.now());
    if (cached) return cached;
    let history = this.historyPromises.get(range);
    if (!history) {
      const request = this.requireTransport().getHistoricalUsage(range)
        .then((payload) => validateEnergyPoints(payload, range === '24h' ? 'kW' : 'kWh', this.now()))
        .then((points) => {
          for (const point of points) this.assertRealQuality(point.quality, 'history.quality');
          this.cache.setHistory(range, points, this.cacheExpiration());
          return points;
        })
        .catch((error) => {
          throw asProviderError(error);
        })
        .finally(() => {
          if (this.historyPromises.get(range) === request) this.historyPromises.delete(range);
        });
      history = request;
      this.historyPromises.set(range, request);
    }
    return structuredClone(await history);
  }

  async getImpactSummary(): Promise<EnergyImpact> {
    const transport = this.requireTransport();
    if (!transport.getImpactSummary) {
      return {
        avoidedEnergyKwh: null,
        comparisonMethod: 'No reviewed avoided-energy method is available from the selected provider.',
        quality: 'pending',
      };
    }
    try {
      const impact = validateEnergyImpact(await transport.getImpactSummary());
      this.assertRealQuality(impact.quality, 'impact.quality');
      return impact;
    } catch (error) {
      throw asProviderError(error);
    }
  }
}
