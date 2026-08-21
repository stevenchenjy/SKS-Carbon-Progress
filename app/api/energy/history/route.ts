import { getEnergyProvider } from '@/lib/energy/server';
import type { EnergyHistoryRange } from '@/lib/energy/types';

export async function GET(request: Request) {
  const requestedRange = new URL(request.url).searchParams.get('range');
  if (requestedRange !== null && requestedRange !== '24h' && requestedRange !== '7d') {
    return Response.json({ error: 'Range must be 24h or 7d.' }, { status: 400 });
  }
  const range: EnergyHistoryRange = requestedRange === '7d' ? '7d' : '24h';
  const provider = getEnergyProvider();
  const [data, metadata] = await Promise.all([provider.getHistoricalUsage(range), provider.getMetadata()]);

  return Response.json({
    data,
    meta: { ...metadata, range },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
