import 'server-only';
import type { RoadmapProvider } from '@/lib/roadmap/provider';
import { MockRoadmapProvider } from '@/lib/roadmap/providers/mockRoadmapProvider';
import { ConfigRoadmapProvider } from '@/lib/roadmap/providers/configRoadmapProvider';
import { getRoadmapProviderSelection, requireHttpUrl } from '@/lib/providers/config';
import { HttpJsonSource } from '@/lib/providers/http-json-source';

export function getRoadmapProvider(): RoadmapProvider {
  if (getRoadmapProviderSelection() === 'config') {
    return new ConfigRoadmapProvider(new HttpJsonSource({ url: requireHttpUrl('ROADMAP_DATA_URL') }));
  }
  return new MockRoadmapProvider();
}
