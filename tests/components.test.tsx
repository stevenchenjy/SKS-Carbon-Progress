import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataBarChart } from '@/app/components/DataBarChart';
import { CarbonScopeGrid } from '@/app/components/CarbonScopeGrid';
import { CarbonTimeline } from '@/app/components/CarbonTimeline';
import { CarbonPlanProgress } from '@/app/components/CarbonPlanProgress';
import { DataNotes } from '@/app/components/DataNotes';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { OverviewWorkflowList } from '@/app/components/OverviewWorkflowList';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { RoadmapGrid } from '@/app/components/RoadmapGrid';
import { SiteHeader } from '@/app/components/SiteHeader';
import { StartWorkflowList } from '@/app/components/StartWorkflowList';
import { energyMetricQuality } from '@/app/energy/metric-quality';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { CarbonNeutralityPlanContent } from '@/lib/site-content/types';
import { canClaimVerified, disclosureHeading, publicClaimVocabulary, verificationLabel } from '@/lib/claim-safety';

vi.mock('next/navigation', () => ({ usePathname: () => '/projects' }));

const prototypeMetadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'test-mock',
  sourceLabel: 'Test mock provider',
  disclosure: 'Synthetic test data only.',
  availability: 'available',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-22', staleAfterMinutes: null },
  coverage: { kind: 'unknown', label: 'Test coverage', note: 'Test coverage note.', monitoredDeviceCount: null },
  reportingPeriod: null,
};

const pendingPlan: CarbonNeutralityPlanContent = {
  definition: 'Test framework.',
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
  framework: [],
};

describe('public data components', () => {
  it('renders the mobile navigation as a native disclosure with active links', () => {
    const { container } = render(<SiteHeader />);
    const mobileMenu = container.querySelector('details.mobile-menu');

    expect(mobileMenu).not.toBeNull();
    expect(mobileMenu?.querySelector('summary')).toHaveTextContent('Menu');
    expect(mobileMenu?.querySelector('button')).toBeNull();
    expect(container.querySelectorAll('a[aria-current="page"]')).toHaveLength(2);
  });

  it('marks a missing energy metric pending without treating numeric zero as missing', () => {
    expect(energyMetricQuality(null, 'measured')).toBe('pending');
    expect(energyMetricQuality(0, 'measured')).toBe('measured');
  });

  it('uses the five-stage diagram only for five steps and a stable list for longer workflows', () => {
    const steps = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
    const { container, rerender } = render(<StartWorkflowList steps={steps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(container.querySelector('.workflow-variable-list')).not.toBeNull();
    expect(container.querySelector('.workflow-step')).toBeNull();

    rerender(<StartWorkflowList steps={steps.slice(0, 5)} />);
    expect(container.querySelector('.workflow-list')).not.toBeNull();
    expect(container.querySelectorAll('.workflow-step')).toHaveLength(5);
  });

  it('shows every overview workflow stage and switches longer flows to the stable layout', () => {
    const steps = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
    const { container, rerender } = render(<OverviewWorkflowList steps={steps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByText('Six')).toBeInTheDocument();
    expect(container.querySelector('.process-list-variable')).not.toBeNull();

    rerender(<OverviewWorkflowList steps={steps.slice(0, 5)} />);
    expect(container.querySelector('.process-list-variable')).toBeNull();
    expect(container.querySelectorAll('.process-list > li')).toHaveLength(5);
  });

  it('renders a clear empty chart state', () => {
    render(<DataBarChart points={[]} title="Empty usage" unit="kW" />);
    expect(screen.getByRole('status')).toHaveTextContent('No prototype readings to show');
  });

  it('handles missing chart points without invalid geometry', () => {
    const { container } = render(<DataBarChart points={[{ label: 'A', value: null }, { label: 'B', value: 0 }]} title="Partial usage" unit="kW" />);
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(screen.getByTitle('A: missing')).toBeInTheDocument();
    expect(screen.getByTitle('B: 0 kW (simulated)')).toBeInTheDocument();
    expect(screen.getByTitle('B: 0 kW (simulated)')).toHaveStyle({ height: '0%' });
    expect(screen.getByText(/Scale 0–1 kW/i)).toBeInTheDocument();
  });

  it('renders non-color data-quality text and the prototype disclosure', () => {
    render(<><DataQualityBadge quality="verified" /><PrototypeNotice /></>);
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText(/Prototype data only/)).toBeInTheDocument();
    expect(screen.getByText(/not Storm King School results/i)).toBeInTheDocument();
  });

  it('renders a public-project empty state', () => {
    render(<ProjectGrid projects={[]} metadata={prototypeMetadata} />);
    expect(screen.getByRole('status')).toHaveTextContent('No public projects available');
  });

  it('links the public evidence required by a verified project result', () => {
    render(
      <ProjectGrid
        metadata={{ ...prototypeMetadata, synthetic: false, publicationStatus: 'reported' }}
        projects={[{
          id: 'reviewed-project',
          title: 'Reviewed public project',
          category: 'Energy & Buildings',
          status: 'Active',
          summary: 'Test-only public summary.',
          milestone: { label: 'Reviewed milestone', stage: 'Active', target: 'Test period' },
          impact: 'Test result',
          impactQuality: 'verified',
          metrics: [],
          verificationReference: 'https://example.invalid/project-evidence',
          nextPublicStep: null,
          updatedAt: '2026-08-22',
          quality: 'measured',
        }]}
      />,
    );
    expect(screen.getByRole('link', { name: /view verification evidence/i })).toHaveAttribute('href', 'https://example.invalid/project-evidence');
  });

  it('never labels a synthetic project URL as verification evidence', () => {
    render(
      <ProjectGrid
        metadata={prototypeMetadata}
        projects={[{
          id: 'synthetic-project',
          title: 'Synthetic project',
          category: 'Energy & Buildings',
          status: 'Active',
          summary: 'Test-only synthetic summary.',
          milestone: { label: 'Pending milestone', stage: 'Active', target: 'Pending' },
          impact: 'Expected benefit pending review',
          impactQuality: 'pending',
          metrics: [],
          verificationReference: 'https://example.invalid/not-public-verification',
          nextPublicStep: 'Review evidence',
          updatedAt: '2026-08-22',
          quality: 'prototype',
        }]}
      />,
    );
    expect(screen.queryByRole('link', { name: /view verification evidence/i })).not.toBeInTheDocument();
  });

  it('keeps a missing carbon-plan percentage numeric-free and renders reviewed progress when supplied', () => {
    const { rerender } = render(<CarbonPlanProgress plan={pendingPlan} />);
    expect(screen.getByText('Not yet calculated')).toBeInTheDocument();
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-valuenow');

    rerender(<CarbonPlanProgress plan={{
      ...pendingPlan,
      goal: 'Test goal',
      baselineYear: 2024,
      latestReportingYear: 2026,
      targetYear: 2030,
      baselineGrossEmissionsTco2e: 100,
      latestGrossEmissionsTco2e: 70,
      targetGrossEmissionsTco2e: 40,
      inventoryBoundary: 'Test boundary',
      progressPercent: 50,
      progressMetric: 'Target attainment',
      progressMethod: 'Documented gross-emissions method.',
      quality: 'measured',
    }} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByLabelText('Latest approved progress result')).toHaveTextContent('50%');
    expect(screen.getByLabelText('Latest approved progress result')).toHaveTextContent('Target attainment');
    expect(screen.getByText('Documented gross-emissions method.')).toBeInTheDocument();
  });

  it('does not leak fallback carbon-plan enum values when the source is unavailable', () => {
    render(<CarbonPlanProgress available={false} plan={pendingPlan} />);
    expect(screen.getByText('Plan status:')).toHaveTextContent('Unavailable');
    expect(screen.queryByText('Framework')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No goal, baseline, target, boundary, method, or progress result has been inferred');
  });

  it('distinguishes project metric zero from missing and shows equivalency method evidence', () => {
    render(<ProjectGrid
      metadata={{ ...prototypeMetadata, synthetic: false, publicationStatus: 'reported', status: 'measured' }}
      projects={[{
        id: 'metric-test',
        title: 'Metric test project',
        category: 'Waste & Circularity',
        status: 'Active',
        summary: 'Test summary.',
        milestone: { label: 'Test milestone', stage: 'Active', target: '2026' },
        impact: null,
        impactQuality: 'pending',
        metrics: [
          {
            id: 'zero-count', label: 'Containers returned', metricType: 'activity-count', value: 0, unit: 'containers',
            periodStart: '2026-08-01', periodEnd: '2026-08-20', quality: 'measured', sourceLabel: 'Vendor report',
            methodologyNote: 'Vendor-reported count.', evidenceReference: 'https://example.invalid/report', equivalencies: [],
          },
          {
            id: 'missing-impact', label: 'Modeled benefit', metricType: 'estimated-emissions-avoided', value: null, unit: 'tCO2e',
            periodStart: null, periodEnd: null, quality: 'pending', sourceLabel: 'Awaiting model', methodologyNote: null,
            evidenceReference: null,
            equivalencies: [],
          },
          {
            id: 'modeled-impact', label: 'Reviewed modeled benefit', metricType: 'estimated-emissions-avoided', value: 1, unit: 'tCO2e',
            periodStart: '2026-08-01', periodEnd: '2026-08-20', quality: 'estimated', sourceLabel: 'EPA WARM model run',
            methodologyNote: 'Documented baseline comparison.', evidenceReference: 'https://example.invalid/model',
            equivalencies: [{ label: 'passenger vehicle miles', value: 2544, unit: 'miles', methodology: 'EPA factor version used in test.', sourceReference: 'https://example.invalid/factor' }],
          },
        ],
        verificationReference: null,
        nextPublicStep: null,
        updatedAt: '2026-08-20',
        quality: 'measured',
      }]}
    />);
    expect(screen.getAllByText('0 containers').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Awaiting reviewed data').length).toBeGreaterThan(0);
    expect(screen.getByText(/EPA factor version used in test/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /factor source/i })).toHaveAttribute('href', 'https://example.invalid/factor');
  });

  it('renders empty states for roadmap, carbon inventory, and carbon timeline sections', () => {
    const { rerender } = render(<RoadmapGrid areas={[]} metadata={prototypeMetadata} />);
    expect(screen.getByRole('status')).toHaveTextContent('No roadmap areas yet');

    rerender(<CarbonScopeGrid scopes={[]} metadata={prototypeMetadata} />);
    expect(screen.getByRole('status')).toHaveTextContent('No carbon inventory available');

    rerender(<CarbonTimeline history={[]} />);
    expect(screen.getByRole('status')).toHaveTextContent('No carbon timeline available');
  });

  it('renders connected provider values without prototype labels', () => {
    const connectedMetadata: ProviderMetadata = {
      synthetic: false,
      status: 'measured',
      provider: 'connected-test',
      sourceLabel: 'Reviewed inventory',
      disclosure: 'Reviewed provider test data.',
      availability: 'available',
      publicationStatus: 'reported',
      freshness: { state: 'not-applicable', observedAt: '2026-08-22', staleAfterMinutes: null },
      coverage: { kind: 'inventory-boundary', label: 'Reviewed boundary', note: 'Reviewed boundary note.', monitoredDeviceCount: null },
      reportingPeriod: { start: '2025-07-01', end: '2026-06-30', label: '2025–2026' },
    };
    const { container } = render(
      <CarbonScopeGrid
        metadata={connectedMetadata}
        scopes={[{ scope: 'Scope 1', source: 'Direct sources', value: 12.4, unit: 'tCO2e', quality: 'measured', note: 'Reviewed input' }]}
      />,
    );
    expect(screen.getByText('12.4')).toBeInTheDocument();
    expect(screen.getByText(/tCO2e/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent('Mock');
  });

  it('shows source-level coverage and a non-live freshness label', () => {
    render(<DataNotes metadata={prototypeMetadata} />);
    expect(screen.getByText('Test coverage')).toBeInTheDocument();
    expect(screen.getByText('Not a live feed')).toBeInTheDocument();
    expect(screen.getByText('Synthetic prototype')).toBeInTheDocument();
    expect(screen.getByText('Synthetic fixture')).toBeInTheDocument();
    expect(screen.getAllByText('Not supplied').length).toBeGreaterThan(0);
    expect(screen.getByText('Aug 22, 2026')).toBeInTheDocument();
  });

  it('uses the reusable claim vocabulary and requires evidence before verified page language', () => {
    expect(publicClaimVocabulary.reported.description).toMatch(/not automatically independently verified/i);
    expect(disclosureHeading(prototypeMetadata)).toBe('Prototype data only');
    expect(canClaimVerified(prototypeMetadata)).toBe(false);

    const verifiedMetadata: ProviderMetadata = {
      ...prototypeMetadata,
      synthetic: false,
      status: 'verified',
      publicationStatus: 'reported',
      verification: { state: 'verified', reference: 'https://example.invalid/evidence', note: 'Synthetic test object only.' },
    };
    expect(canClaimVerified(verifiedMetadata)).toBe(true);
    expect(verificationLabel(verifiedMetadata)).toBe('Verified · evidence supplied');
    expect(canClaimVerified({ ...verifiedMetadata, verification: { ...verifiedMetadata.verification!, reference: null } })).toBe(false);
    expect(verificationLabel({ ...verifiedMetadata, status: 'measured' })).toBe('Verification evidence supplied');
  });
});
