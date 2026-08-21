import { getCarbonProvider } from '@/lib/carbon/server';

export async function GET() {
  const provider = getCarbonProvider();
  const [data, meta] = await Promise.all([provider.getOverview(), provider.getMetadata()]);
  return Response.json({ data, meta });
}
