import type { CarbonProvider } from '@/lib/carbon/provider';
import type { CarbonHistoryPoint, CarbonMethodology, CarbonOverview } from '@/lib/carbon/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { JsonSource } from '@/lib/providers/http-json-source';
import { validateCarbonInventoryDocument, type CarbonInventoryDocument } from '@/lib/carbon/validation';

export class CarbonInventoryProvider implements CarbonProvider {
  private documentPromise: Promise<CarbonInventoryDocument> | undefined;

  constructor(private readonly source: JsonSource) {}

  private load(): Promise<CarbonInventoryDocument> {
    this.documentPromise ??= this.source.load().then(validateCarbonInventoryDocument);
    return this.documentPromise;
  }

  async getMetadata(): Promise<ProviderMetadata> {
    const document = await this.load();
    const expectedScopes = new Set(['Scope 1', 'Scope 2', 'Scope 3']);
    const hasMissingScope = document.overview.scopeBreakdown.some((scope) => scope.value === null)
      || document.overview.scopeBreakdown.length < expectedScopes.size;
    return {
      synthetic: document.source.synthetic,
      status: document.overview.quality,
      provider: `carbon-inventory:${document.source.id}`,
      sourceLabel: document.source.label,
      disclosure: document.source.synthetic
        ? 'Validated synthetic inventory fixture. It is not a Storm King School result.'
        : `Reviewed inventory source using methodology ${document.source.methodologyVersion}.`,
      availability: hasMissingScope ? 'partial' : 'available',
      publicationStatus: document.source.publicationStatus,
      freshness: { state: 'not-applicable', observedAt: document.source.updatedAt, staleAfterMinutes: null },
      coverage: {
        kind: 'inventory-boundary',
        label: hasMissingScope ? 'Incomplete reviewed inventory boundary' : 'Reviewed inventory boundary',
        note: document.methodology.reportingBoundary,
        monitoredDeviceCount: null,
      },
      reportingPeriod: structuredClone(document.source.reportingPeriod),
      sourceType: 'inventory',
      verification: {
        state: document.source.verificationReference ? 'verified' : 'not-verified',
        reference: document.source.verificationReference,
        note: document.source.verificationReference
          ? 'The inventory source supplied a public verification reference.'
          : 'No public verification reference was supplied.',
      },
      methodologyNote: `Methodology version ${document.source.methodologyVersion}.`,
    };
  }

  async getOverview(): Promise<CarbonOverview> {
    return structuredClone((await this.load()).overview);
  }

  async getHistory(): Promise<CarbonHistoryPoint[]> {
    return structuredClone((await this.load()).history);
  }

  async getMethodology(): Promise<CarbonMethodology> {
    return structuredClone((await this.load()).methodology);
  }
}
