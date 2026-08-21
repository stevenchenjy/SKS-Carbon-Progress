import type { DataQuality } from '@/lib/data-quality';

export interface ProviderMetadata {
  synthetic: boolean;
  status: DataQuality;
  provider: string;
  sourceLabel: string;
  disclosure: string;
}
