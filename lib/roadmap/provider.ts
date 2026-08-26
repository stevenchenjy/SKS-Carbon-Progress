import type { RoadmapArea } from '@/lib/roadmap/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export interface RoadmapProvider {
  getMetadata(): Promise<ProviderMetadata>;
  getAreas(): Promise<RoadmapArea[]>;
}
