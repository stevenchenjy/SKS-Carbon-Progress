import type { CarbonProvider } from '@/lib/carbon/provider';
import type { CarbonHistoryPoint, CarbonMethodology, CarbonOverview } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export class CarbonInventoryProvider implements CarbonProvider {
  private notConnected(): never {
    // TODO: Choose and document the approved CSV, API, or database input contract.
    // TODO: Preserve source lineage and data-quality status during mapping.
    throw new Error('Carbon inventory provider is not implemented.');
  }

  async getMetadata(): Promise<ProviderMetadata> {
    return this.notConnected();
  }

  async getOverview(): Promise<CarbonOverview> {
    return this.notConnected();
  }

  async getHistory(): Promise<CarbonHistoryPoint[]> {
    return this.notConnected();
  }

  async getMethodology(): Promise<CarbonMethodology> {
    return this.notConnected();
  }
}
