import { getCarbonProvider } from '@/lib/carbon/server';
import { safeApiResponse } from '@/lib/api/responses';
import type { CarbonProvider } from '@/lib/carbon/provider';

export async function carbonHistoryResponse(providerFactory: () => CarbonProvider = getCarbonProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [data, meta] = await Promise.all([provider.getHistory(), provider.getMetadata()]);
    return { data, meta };
  });
}

export async function GET() {
  return carbonHistoryResponse();
}
