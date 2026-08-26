import { getEnergyProvider } from '@/lib/energy/server';
import type { EnergyHistoryRange } from '@/lib/energy/types';
import { apiErrorResponse, safeApiResponse } from '@/lib/api/responses';
import type { EnergyProvider } from '@/lib/energy/provider';

export async function energyHistoryResponse(request: Request, providerFactory: () => EnergyProvider = getEnergyProvider) {
  const requestedRange = new URL(request.url).searchParams.get('range');
  if (requestedRange !== null && requestedRange !== '24h' && requestedRange !== '7d') {
    return apiErrorResponse('INVALID_REQUEST', 400, 'Range must be 24h or 7d.');
  }
  const range: EnergyHistoryRange = requestedRange === '7d' ? '7d' : '24h';
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [data, metadata] = await Promise.all([provider.getHistoricalUsage(range), provider.getMetadata()]);
    return { data, meta: { ...metadata, range } };
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  return energyHistoryResponse(request);
}
