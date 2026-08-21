import type { EnergyProvider } from '@/lib/energy/provider';
import type { EnergyHistoryRange, EnergyImpact, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export const REVERT_ENVIRONMENT_VARIABLES = ['REVERT_API_KEY', 'REVERT_API_URL'] as const;

export interface RevertConfig {
  apiKey: string;
  apiUrl: string;
}

export class RevertProvider implements EnergyProvider {
  constructor(private readonly config: RevertConfig) {}

  private notConnected(): never {
    // TODO: Validate the future Revert API contract with Revert Tech before adding requests.
    // TODO: Map only documented response fields into the public EnergyProvider models.
    const configured = Boolean(this.config.apiKey && this.config.apiUrl);
    throw new Error(configured ? 'Revert provider is not implemented.' : 'Revert provider is not configured.');
  }

  async getMetadata(): Promise<ProviderMetadata> {
    return {
      synthetic: false,
      status: 'measured',
      provider: 'revert',
      sourceLabel: 'Revert Tech feed',
      disclosure: 'Energy readings supplied through the reviewed Revert Tech connection.',
    };
  }

  async getCurrentUsage(): Promise<EnergySnapshot> {
    return this.notConnected();
  }

  async getHistoricalUsage(range: EnergyHistoryRange): Promise<EnergyPoint[]> {
    void range;
    return this.notConnected();
  }

  async getImpactSummary(): Promise<EnergyImpact> {
    return this.notConnected();
  }
}
