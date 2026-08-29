import { safeApiResponse } from '@/lib/api/responses';
import type { SiteContentProvider } from '@/lib/site-content/provider';
import { getSiteContentProvider } from '@/lib/site-content/server';

export async function siteContentResponse(providerFactory: () => SiteContentProvider = getSiteContentProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [overview, start, carbonPlan, meta] = await Promise.all([
      provider.getOverview(),
      provider.getStart(),
      provider.getCarbonPlan(),
      provider.getMetadata(),
    ]);
    const publicStart = {
      introduction: start.introduction,
      adoptionRationale: start.adoptionRationale,
      adoptionStatus: start.adoptionStatus,
      adoptionDate: start.adoptionDate,
      workflow: start.workflow,
      privacyBoundary: start.privacyBoundary,
      snapshotCadence: start.snapshotCadence,
    };
    return { data: { overview, start: publicStart, carbonPlan }, meta };
  });
}

export async function GET() {
  return siteContentResponse();
}
