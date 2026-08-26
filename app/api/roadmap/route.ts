import { getRoadmapProvider } from '@/lib/roadmap/server';
import { safeApiResponse } from '@/lib/api/responses';
import type { RoadmapProvider } from '@/lib/roadmap/provider';

export async function roadmapResponse(providerFactory: () => RoadmapProvider = getRoadmapProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [data, meta] = await Promise.all([provider.getAreas(), provider.getMetadata()]);
    return { data, meta };
  });
}

export async function GET() {
  return roadmapResponse();
}
