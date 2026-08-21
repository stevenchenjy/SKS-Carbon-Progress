import 'server-only';
import type { RoadmapProvider } from '@/lib/roadmap/provider';
import { MockRoadmapProvider } from '@/lib/roadmap/providers/mockRoadmapProvider';

let provider: RoadmapProvider | undefined;

export function getRoadmapProvider(): RoadmapProvider {
  provider ??= new MockRoadmapProvider();
  return provider;
}
