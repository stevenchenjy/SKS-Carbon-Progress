import type { CarbonHistoryPoint, CarbonMethodology, CarbonOverview } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export interface CarbonProvider {
  getMetadata(): Promise<ProviderMetadata>;
  getOverview(): Promise<CarbonOverview>;
  getHistory(): Promise<CarbonHistoryPoint[]>;
  getMethodology(): Promise<CarbonMethodology>;
}
