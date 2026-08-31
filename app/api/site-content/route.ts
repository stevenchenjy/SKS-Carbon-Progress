import { safeApiResponse } from '@/lib/api/responses';
import type { SiteContentProvider } from '@/lib/site-content/provider';
import { getSiteContentProvider } from '@/lib/site-content/server';

export async function siteContentResponse(providerFactory: () => SiteContentProvider = getSiteContentProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [overview, carbonPlan, meta] = await Promise.all([
      provider.getOverview(),
      provider.getCarbonPlan(),
      provider.getMetadata(),
    ]);
    return { data: { overview, carbonPlan }, meta };
  });
}

export async function GET() {
  return siteContentResponse();
}
