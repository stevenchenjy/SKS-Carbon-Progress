import { getRoadmapProvider } from '@/lib/roadmap/server';

export async function GET() {
  const provider = getRoadmapProvider();
  const [data, meta] = await Promise.all([provider.getAreas(), provider.getMetadata()]);
  return Response.json({ data, meta });
}
