import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { JsonSource } from '@/lib/providers/http-json-source';
import type { SiteContentProvider } from '@/lib/site-content/provider';
import type { SiteContentSnapshot } from '@/lib/site-content/types';
import { validateSiteContentSnapshot } from '@/lib/site-content/validation';

export class SnapshotSiteContentProvider implements SiteContentProvider {
  private snapshotPromise: Promise<SiteContentSnapshot> | undefined;

  constructor(private readonly source: JsonSource) {}

  private load(): Promise<SiteContentSnapshot> {
    this.snapshotPromise ??= this.source.load().then(validateSiteContentSnapshot);
    return this.snapshotPromise;
  }

  async getMetadata(): Promise<ProviderMetadata> {
    const snapshot = await this.load();
    const verificationReference = snapshot.carbonPlan.offsetsEvidenceReference;
    return {
      synthetic: snapshot.source.synthetic,
      status: snapshot.source.quality,
      provider: `site-content-snapshot:${snapshot.source.id}`,
      sourceLabel: snapshot.source.label,
      disclosure: snapshot.source.synthetic
        ? 'Validated synthetic site-content snapshot. No school result is represented.'
        : 'Reviewed public narrative and plan fields supplied by the configured spreadsheet snapshot.',
      availability: 'available',
      publicationStatus: snapshot.source.publicationStatus,
      freshness: { state: 'not-applicable', observedAt: snapshot.source.generatedAt, staleAfterMinutes: null },
      coverage: {
        kind: 'public-subset',
        label: 'Reviewed public site-content subset',
        note: 'Only fields allowed by the versioned site-content contract are accepted.',
        monitoredDeviceCount: null,
      },
      reportingPeriod: null,
      sourceType: 'spreadsheet-snapshot',
      verification: {
        state: snapshot.source.quality === 'verified' && verificationReference !== null ? 'verified' : 'not-verified',
        reference: verificationReference,
        note: 'Verification applies only where an individual public field supplies evidence.',
      },
      methodologyNote: snapshot.source.methodologyNote,
    };
  }

  async getOverview() {
    return structuredClone((await this.load()).overview);
  }

  async getStart() {
    return structuredClone((await this.load()).start);
  }

  async getCarbonPlan() {
    return structuredClone((await this.load()).carbonPlan);
  }
}
