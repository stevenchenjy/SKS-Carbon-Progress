import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home, { getCampusCarbonImpact } from '@/app/page';
import EnergyPage from '@/app/energy/page';
import ProjectsPage, { projectsHeroDescription, projectsNoticeMessage } from '@/app/projects/page';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import type { PublicProject } from '@/lib/projects/types';
import type { CarbonNeutralityPlanContent } from '@/lib/site-content/types';

afterEach(() => {
  delete process.env.ENERGY_PROVIDER;
  delete process.env.REVERT_API_URL;
  delete process.env.REVERT_API_KEY;
  delete process.env.PROJECT_PROVIDER;
  delete process.env.START_PUBLIC_SNAPSHOT_URL;
  delete process.env.SITE_CONTENT_PROVIDER;
  delete process.env.SITE_CONTENT_URL;
});

describe('public page provider isolation', () => {
  it('keeps the field-report overview available when the secondary energy provider is misconfigured', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await Home());
    expect(screen.getByRole('heading', { name: /a public record of sustainability progress/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /why this place matters/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /campus impact, in one measure/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /two frameworks, two jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /understand the START framework/i })).toHaveAttribute('href', '/start');
    expect(screen.getByRole('link', { name: /understand the carbon framework/i })).toHaveAttribute('href', '/carbon');
    expect(screen.queryByRole('heading', { name: 'CLYNK Container Collection' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Campus Composting' })).not.toBeInTheDocument();
  });

  it('orders place, campus impact, and frameworks before any report notes', async () => {
    render(await Home());
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(sectionHeadings.slice(0, 3)).toEqual([
      'Why this place matters',
      'Campus impact, in one measure',
      'Two frameworks, two jobs',
    ]);
  });

  it('renders an honest energy unavailable state instead of throwing or substituting mock values', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await EnergyPage());
    expect(screen.getAllByText(/Data source unavailable/).length).toBeGreaterThan(0);
    expect(screen.getByText(/No reading has been inferred or replaced/i)).toBeInTheDocument();
    expect(screen.queryByText('42.8')).not.toBeInTheDocument();
  });

  it('labels an unavailable project source as unavailable instead of numeric zero', async () => {
    process.env.PROJECT_PROVIDER = 'start-snapshot';
    render(await ProjectsPage());
    const publicRecords = screen.getByText('Public records').closest('div');
    const resultState = screen.getByText('Result state').closest('div');
    expect(publicRecords).toHaveTextContent('Unavailable');
    expect(publicRecords).not.toHaveTextContent('0');
    expect(resultState).toHaveTextContent('Unavailable');
    expect(resultState).not.toHaveTextContent('pending');
    expect(screen.getByRole('status')).toHaveTextContent('No public projects available');
    expect(screen.getByRole('link', { name: /how to read this report/i })).toHaveAttribute('href', '#project-data-notes');
  });

  it('links a populated Projects notice to an existing case-study disclosure', async () => {
    render(await ProjectsPage());
    const disclosureLink = screen.getByRole('link', { name: /how to read this report/i });
    const targetId = disclosureLink.getAttribute('href')?.slice(1);
    expect(targetId).toBeTruthy();
    expect(document.getElementById(targetId!)).not.toBeNull();
  });

  it('distinguishes a valid empty project source from an unavailable one', () => {
    const availableMetadata: ProviderMetadata = {
      synthetic: false,
      status: 'pending',
      provider: 'empty-test',
      sourceLabel: 'Empty public snapshot',
      disclosure: 'The connected source currently has no public records.',
      availability: 'available',
      publicationStatus: 'reported',
      freshness: { state: 'not-applicable', observedAt: null, staleAfterMinutes: null },
      coverage: { kind: 'public-subset', label: 'Empty public subset', note: 'No records.', monitoredDeviceCount: null },
      reportingPeriod: null,
    };
    expect(projectsHeroDescription([], availableMetadata)).toMatch(/currently contains no public project records/i);
    const emptySyntheticMetadata = { ...availableMetadata, synthetic: true };
    expect(projectsHeroDescription([], emptySyntheticMetadata)).toMatch(/no named public project records/i);
    expect(projectsNoticeMessage([], emptySyntheticMetadata)).toMatch(/currently contains no named public project records/i);
    expect(projectsNoticeMessage([{ title: 'Named prototype' } as PublicProject], emptySyntheticMetadata)).toMatch(/Project names are visible/i);
  });

  it('does not leak fallback carbon-plan states when site content is unavailable', async () => {
    process.env.SITE_CONTENT_PROVIDER = 'snapshot';
    render(await Home());
    expect(screen.getByRole('status')).toHaveTextContent('Source unavailable');
  });

  it('publishes an absolute campus reduction only with an approved comparable result', () => {
    const plan: CarbonNeutralityPlanContent = {
      definition: 'Test definition.',
      goal: 'Reduce gross emissions.',
      targetYear: 2030,
      baselineYear: 2024,
      latestReportingYear: 2026,
      inventoryBoundary: 'Scope 1 and market-based Scope 2 campus operations.',
      baselineGrossEmissionsTco2e: 100,
      latestGrossEmissionsTco2e: 70,
      targetGrossEmissionsTco2e: 40,
      progressPercent: 50,
      progressMetric: 'Target attainment',
      progressMethod: 'Comparable gross inventories.',
      retiredOffsetsTco2e: null,
      offsetsMethod: null,
      offsetsEvidenceReference: null,
      status: 'Plan active',
      updatedAt: '2026-08-31',
      quality: 'measured',
      framework: [],
    };
    const metadata: ProviderMetadata = {
      synthetic: false,
      status: 'measured',
      provider: 'test-site-content',
      sourceLabel: 'Reviewed test source',
      disclosure: 'Test only.',
      availability: 'available',
      publicationStatus: 'reported',
      freshness: { state: 'not-applicable', observedAt: null, staleAfterMinutes: null },
      coverage: { kind: 'inventory-boundary', label: 'Test boundary', note: 'Test only.', monitoredDeviceCount: null },
      reportingPeriod: null,
    };

    expect(getCampusCarbonImpact(plan, metadata)).toMatchObject({
      status: 'reported',
      label: 'Gross emissions reduced',
      value: '30',
      unit: 'tCO₂e',
      baseline: '100 tCO₂e · 2024',
      latestInventory: '70 tCO₂e · 2026',
    });

    expect(getCampusCarbonImpact({ ...plan, progressPercent: null }, metadata)).toMatchObject({
      status: 'pending',
      value: 'Awaiting approved inventory',
    });
  });
});
