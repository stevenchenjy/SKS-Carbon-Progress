import type { ProjectProvider } from '@/lib/projects/provider';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-public-projects',
  sourceLabel: 'Local public project prototype',
  disclosure: 'The local fixture contains two named prototype project records. Their counts, weights, carbon estimates, dates, and evidence remain unavailable until school review.',
  availability: 'partial',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-14', staleAfterMinutes: null },
  coverage: {
    kind: 'public-subset',
    label: 'Named projects with public-safe placeholder fields',
    note: 'No project result is represented until a reviewed source supplies the value, period, method, and evidence.',
    monitoredDeviceCount: null,
  },
  reportingPeriod: null,
  sourceType: 'synthetic',
  verification: { state: 'not-applicable', reference: null, note: 'Placeholder project metrics are not verified results.' },
  methodologyNote: 'Names and status labels come from the local prototype fixture; public measurements remain pending school review.',
};

const mockProjects: PublicProject[] = [
  {
    id: 'clynk-container-collection',
    title: 'CLYNK Container Collection',
    category: 'Waste & Circularity',
    status: 'Active',
    summary: 'A school-identified active project using CLYNK’s bottle-and-can redemption system. The public count and reporting period still need an approved account report.',
    milestone: { label: 'Establish a reviewed reporting cadence', stage: 'Active', target: 'Awaiting school confirmation' },
    impact: 'Container count and account-reported impact awaiting source data',
    impactQuality: 'pending',
    metrics: [
      {
        id: 'containers-returned',
        label: 'Containers returned',
        metricType: 'activity-count',
        value: null,
        unit: 'containers',
        periodStart: null,
        periodEnd: null,
        quality: 'pending',
        sourceLabel: 'Awaiting a CLYNK account report',
        methodologyNote: 'Use the vendor-reported container count for the named period; do not derive it from proceeds or bag count.',
        evidenceReference: null,
        equivalencies: [],
      },
      {
        id: 'redemption-proceeds',
        label: 'Redemption proceeds',
        metricType: 'funds-raised',
        value: null,
        unit: 'USD',
        periodStart: null,
        periodEnd: null,
        quality: 'pending',
        sourceLabel: 'Awaiting a CLYNK account report',
        methodologyNote: 'Report the account value for the same period as the container count.',
        evidenceReference: null,
        equivalencies: [],
      },
    ],
    verificationReference: null,
    nextPublicStep: 'Obtain and review a dated CLYNK organization-account report',
    updatedAt: '2026-08-27',
    quality: 'pending',
  },
  {
    id: 'campus-composting',
    title: 'Campus Composting',
    category: 'Food Systems',
    status: 'Active',
    summary: 'A school-identified active project diverting food scraps for composting. Current weight, baseline treatment, and any modeled greenhouse-gas benefit await reviewed records.',
    milestone: { label: 'Define weighing and evidence procedures', stage: 'Active', target: 'Awaiting school confirmation' },
    impact: 'Food-waste mass and modeled benefit awaiting source data',
    impactQuality: 'pending',
    metrics: [
      {
        id: 'food-waste-composted',
        label: 'Food waste composted',
        metricType: 'mass-diverted',
        value: null,
        unit: 'lb',
        periodStart: null,
        periodEnd: null,
        quality: 'pending',
        sourceLabel: 'Awaiting scale, hauler, or documented collection records',
        methodologyNote: 'Use measured mass after removing contamination and identify the collection period.',
        evidenceReference: null,
        equivalencies: [],
      },
      {
        id: 'modeled-ghg-benefit',
        label: 'Modeled life-cycle GHG benefit',
        metricType: 'estimated-emissions-avoided',
        value: null,
        unit: 'tCO2e',
        periodStart: null,
        periodEnd: null,
        quality: 'pending',
        sourceLabel: 'Awaiting a reviewed EPA WARM model run',
        methodologyNote: 'This may be estimated only from weighed material and a documented baseline using a named WARM version. It is not a carbon credit or inventory subtraction.',
        evidenceReference: null,
        equivalencies: [],
      },
    ],
    verificationReference: null,
    nextPublicStep: 'Approve the measurement boundary and evidence source before calculating impact',
    updatedAt: '2026-08-27',
    quality: 'pending',
  },
];

export class MockProjectProvider implements ProjectProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getPublicProjects(): Promise<PublicProject[]> {
    return structuredClone(mockProjects);
  }
}
