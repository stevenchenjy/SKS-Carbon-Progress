import { getEnergyProvider } from '@/lib/energy/server';
import { safeApiResponse } from '@/lib/api/responses';
import type { EnergyProvider } from '@/lib/energy/provider';

export async function energyLiveResponse(providerFactory: () => EnergyProvider = getEnergyProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [snapshot, impact, meta] = await Promise.all([
      provider.getCurrentUsage(),
      provider.getImpactSummary(),
      provider.getMetadata(),
    ]);
    return { data: { snapshot, impact }, meta };
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  return energyLiveResponse();
}
