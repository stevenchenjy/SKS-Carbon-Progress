import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { SiteContentProvider } from '@/lib/site-content/provider';
import type {
  CarbonNeutralityPlanContent,
  StartContent,
  SustainabilityOverviewContent,
} from '@/lib/site-content/types';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-site-content',
  sourceLabel: 'Reviewed public-source research and local placeholders',
  disclosure: 'Storm King place and values language is grounded in official school sources. START history, carbon goals, progress, offsets, and project results remain placeholders until approved.',
  availability: 'partial',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-27', staleAfterMinutes: null },
  coverage: {
    kind: 'public-subset',
    label: 'Four-section public content prototype',
    note: 'Only public narrative and explicitly labeled placeholder fields are represented.',
    monitoredDeviceCount: null,
  },
  reportingPeriod: null,
  sourceType: 'synthetic',
  verification: { state: 'not-applicable', reference: null, note: 'Prototype fields are not verified school results.' },
  methodologyNote: 'Official public sources inform general context; school-specific operational claims stay pending.',
};

const overview: SustainabilityOverviewContent = {
  sustainabilityDefinition: 'Sustainability means caring for the people, resources, and landscapes that support learning today while protecting the choices available to future generations.',
  placeContext: 'Storm King’s 55-acre campus sits above the Hudson River on Storm King Mountain, with the Hudson Highlands, Black Rock Forest, and Storm King State Park shaping the place where students live and learn. That setting makes stewardship tangible rather than abstract.',
  valueAlignment: [
    { value: 'Truth', statement: 'Report what is known, name uncertainty, and correct the record when better evidence arrives.' },
    { value: 'Respect', statement: 'Care for the community and the mountain, river, forests, and shared resources around it.' },
    { value: 'Responsibility', statement: 'Assign owners, measure outcomes, and follow projects beyond the initial idea.' },
    { value: 'Scholarship', statement: 'Use campus questions as opportunities to investigate, test, learn, and improve.' },
  ],
  sourceReferences: [
    'https://sks.org/about-sks/at-a-glance/',
    'https://sks.org/about-sks/strategic-plan-2030/',
    'https://www.un.org/sustainabledevelopment/development-goals/',
  ],
};

const start: StartContent = {
  introduction: 'START—the Sustainability Tracking, Analytics & Roadmap Tool—is a whole-school sustainability platform created by the Green Schools Alliance. It helps schools organize a step-by-step roadmap, measure performance, track operational impacts, coordinate projects, and turn sustainability work into measurable progress.',
  adoptionRationale: null,
  adoptionStatus: 'working-purpose',
  owner: null,
  adoptionDate: null,
  workflow: ['Propose a project', 'Assign ownership and a milestone', 'Record evidence and results', 'Review approved fields', 'Publish a public snapshot'],
  privacyBoundary: 'The public site may receive reviewed summaries, statuses, metrics, dates, and evidence links. Names, emails, internal notes, concerns, blockers, and approval discussions remain inside the private Command Center.',
  snapshotCadence: null,
};

const carbonPlan: CarbonNeutralityPlanContent = {
  definition: 'A credible carbon-neutrality plan defines the emissions boundary, measures a baseline, prioritizes direct reductions, reports residual emissions separately, and documents any retired credits or removals with evidence.',
  goal: null,
  targetYear: null,
  baselineYear: null,
  latestReportingYear: null,
  inventoryBoundary: null,
  baselineGrossEmissionsTco2e: null,
  latestGrossEmissionsTco2e: null,
  targetGrossEmissionsTco2e: null,
  progressPercent: null,
  progressMetric: null,
  progressMethod: null,
  retiredOffsetsTco2e: null,
  offsetsMethod: null,
  offsetsEvidenceReference: null,
  status: 'Framework',
  updatedAt: null,
  quality: 'pending',
  framework: [
    { id: 'define', title: 'Define', description: 'Approve the organizational boundary, included scopes, reporting year, and terminology.' },
    { id: 'measure', title: 'Measure', description: 'Build a gross emissions inventory from activity data and documented factors.' },
    { id: 'reduce', title: 'Reduce', description: 'Prioritize efficiency, clean energy, transportation, food, and waste actions that lower gross emissions.' },
    { id: 'address-residuals', title: 'Address residuals', description: 'Report remaining emissions separately and document any retired credits or removals without calling project estimates offsets.' },
    { id: 'review', title: 'Review and publish', description: 'Check methods, evidence, corrections, and progress before public release.' },
  ],
};

export class MockSiteContentProvider implements SiteContentProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getOverview(): Promise<SustainabilityOverviewContent> {
    return structuredClone(overview);
  }

  async getStart(): Promise<StartContent> {
    return structuredClone(start);
  }

  async getCarbonPlan(): Promise<CarbonNeutralityPlanContent> {
    return structuredClone(carbonPlan);
  }
}
