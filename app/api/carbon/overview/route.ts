import { getCarbonProvider } from '@/lib/carbon/server';
import { safeApiResponse } from '@/lib/api/responses';
import type { CarbonProvider } from '@/lib/carbon/provider';

export async function carbonOverviewResponse(providerFactory: () => CarbonProvider = getCarbonProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [data, meta] = await Promise.all([provider.getOverview(), provider.getMetadata()]);
    return { data, meta };
  });
}

export async function GET() {
  return carbonOverviewResponse();
}
