import type { EnergyHistoryRange, EnergyImpact, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export interface EnergyProvider {
  getMetadata(): Promise<ProviderMetadata>;
  getCurrentUsage(): Promise<EnergySnapshot>;
  getHistoricalUsage(range: EnergyHistoryRange): Promise<EnergyPoint[]>;
  getImpactSummary(): Promise<EnergyImpact>;
}
