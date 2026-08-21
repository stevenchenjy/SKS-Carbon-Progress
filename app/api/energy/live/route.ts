import { getEnergyProvider } from '@/lib/energy/server';

export async function GET() {
  const provider = getEnergyProvider();
  const [snapshot, impact, meta] = await Promise.all([
    provider.getCurrentUsage(),
    provider.getImpactSummary(),
    provider.getMetadata(),
  ]);

  return Response.json({
    data: { snapshot, impact },
    meta,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
