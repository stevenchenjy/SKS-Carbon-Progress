import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { JsonSource } from '@/lib/providers/http-json-source';
import type { RoadmapProvider } from '@/lib/roadmap/provider';
import type { RoadmapArea } from '@/lib/roadmap/types';
import { validateRoadmapConfigDocument, type RoadmapConfigDocument } from '@/lib/roadmap/validation';

export class ConfigRoadmapProvider implements RoadmapProvider {
  private documentPromise: Promise<RoadmapConfigDocument> | undefined;

  constructor(private readonly source: JsonSource) {}

  private load(): Promise<RoadmapConfigDocument> {
    this.documentPromise ??= this.source.load().then(validateRoadmapConfigDocument);
    return this.documentPromise;
  }

  async getMetadata(): Promise<ProviderMetadata> {
    const document = await this.load();
    return {
      synthetic: document.source.synthetic,
      status: document.source.quality,
      provider: `roadmap-config:${document.source.id}`,
      sourceLabel: document.source.label,
      disclosure: document.source.synthetic
        ? 'Validated synthetic roadmap configuration. It reports no school progress or target.'
        : 'Roadmap stages and metrics supplied by a reviewed public configuration.',
      availability: document.areas.length === 0 ? 'partial' : 'available',
      publicationStatus: document.source.publicationStatus,
      freshness: { state: 'not-applicable', observedAt: document.source.generatedAt, staleAfterMinutes: null },
      coverage: {
        kind: 'public-subset',
        label: `${document.areas.length} reviewed public roadmap area${document.areas.length === 1 ? '' : 's'}`,
        note: 'Only versioned public roadmap fields are accepted.',
        monitoredDeviceCount: null,
      },
      reportingPeriod: null,
      sourceType: 'configured-roadmap',
      verification: {
        state: document.source.synthetic ? 'not-applicable' : document.source.verificationReference ? 'verified' : 'not-verified',
        reference: document.source.synthetic ? null : document.source.verificationReference,
        note: document.source.synthetic
          ? 'Verification does not apply to prototype roadmap data.'
          : document.source.verificationReference ? 'A public verification reference was supplied.' : 'No public verification reference was supplied.',
      },
      methodologyNote: `Roadmap methodology version ${document.source.methodologyVersion}.`,
    };
  }

  async getAreas(): Promise<RoadmapArea[]> {
    return structuredClone((await this.load()).areas);
  }
}
