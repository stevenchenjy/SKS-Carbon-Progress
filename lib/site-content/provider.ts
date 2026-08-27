import type { ProviderMetadata } from '@/lib/provider-metadata';
import type {
  CarbonNeutralityPlanContent,
  StartContent,
  SustainabilityOverviewContent,
} from '@/lib/site-content/types';

export interface SiteContentProvider {
  getMetadata(): Promise<ProviderMetadata>;
  getOverview(): Promise<SustainabilityOverviewContent>;
  getStart(): Promise<StartContent>;
  getCarbonPlan(): Promise<CarbonNeutralityPlanContent>;
}
