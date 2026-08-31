import type { ProjectProvider } from '@/lib/projects/provider';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { JsonSource } from '@/lib/providers/http-json-source';
import { validateStartPublicSnapshot, type StartPublicSnapshot } from '@/lib/projects/validation';

export class StartSnapshotProvider implements ProjectProvider {
  private snapshotPromise: Promise<StartPublicSnapshot> | undefined;

  constructor(private readonly source: JsonSource) {}

  private load(): Promise<StartPublicSnapshot> {
    this.snapshotPromise ??= this.source.load().then(validateStartPublicSnapshot);
    return this.snapshotPromise;
  }

  async getMetadata(): Promise<ProviderMetadata> {
    const snapshot = await this.load();
    const hasPendingResults = snapshot.publicProjects.some((project) => (
      project.metrics.length === 0
      || project.metrics.some((metric) => metric.value === null)
    ));
    const verifiedProject = snapshot.publicProjects.find((project) => (
      project.impactQuality === 'verified'
      || project.quality === 'verified'
      || project.metrics.some((metric) => metric.quality === 'verified')
    ));
    const verificationReference = verifiedProject?.verificationReference
      ?? verifiedProject?.metrics.find((metric) => metric.quality === 'verified')?.evidenceReference
      ?? null;
    return {
      synthetic: snapshot.source.synthetic,
      status: snapshot.source.quality,
      provider: `start-public-snapshot:${snapshot.source.id}`,
      sourceLabel: snapshot.source.label,
      disclosure: snapshot.source.synthetic
        ? 'Validated synthetic START public snapshot. It contains no private committee workspace data.'
        : 'Public project fields supplied by an approved, sanitized START snapshot.',
      availability: hasPendingResults ? 'partial' : 'available',
      publicationStatus: snapshot.source.publicationStatus,
      freshness: { state: 'not-applicable', observedAt: snapshot.source.generatedAt, staleAfterMinutes: null },
      coverage: {
        kind: 'public-subset',
        label: 'Approved public project subset',
        note: 'Only fields explicitly allowed by the versioned public snapshot contract are accepted.',
        monitoredDeviceCount: null,
      },
      reportingPeriod: null,
      sourceType: 'public-snapshot',
      verification: {
        state: verifiedProject ? 'verified' : 'not-verified',
        reference: verificationReference,
        note: 'Result-level verification references remain attached to the individual public project records.',
      },
      methodologyNote: 'Version 1 sanitized START public snapshot contract.',
    };
  }

  async getPublicProjects(): Promise<PublicProject[]> {
    const snapshot = await this.load();
    // Whitelist fields one by one: never spread an internal START record into a public response.
    return snapshot.publicProjects.map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      status: project.status,
      summary: project.summary,
      milestone: structuredClone(project.milestone),
      impact: project.impact,
      impactQuality: project.impactQuality,
      metrics: project.metrics.map((metric) => structuredClone(metric)),
      verificationReference: project.verificationReference,
      nextPublicStep: project.nextPublicStep,
      updatedAt: project.updatedAt,
      quality: project.quality,
    }));
  }
}
