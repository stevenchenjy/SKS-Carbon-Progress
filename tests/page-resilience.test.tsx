import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home, { projectRecordSummary, workSectionSummary } from '@/app/page';
import EnergyPage from '@/app/energy/page';
import ProjectsPage, { projectsHeroDescription, projectsNoticeMessage } from '@/app/projects/page';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';
import type { PublicProject } from '@/lib/projects/types';

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
    expect(screen.getByRole('heading', { name: /student work, measured carefully/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'START Command Center' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CLYNK Container Collection' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Campus Composting' })).toBeInTheDocument();
    expect(screen.getByText('Propose a project')).toBeInTheDocument();
    expect(screen.queryByText('Idea')).not.toBeInTheDocument();
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
    expect(projectRecordSummary([], availableMetadata)).toBe('No public records');
    expect(projectRecordSummary([], unavailableMetadata('Projects', 'Unavailable.'))).toBe('Source unavailable');
    expect(workSectionSummary([], availableMetadata)).toMatch(/currently contains no public-safe project records/i);
    expect(workSectionSummary([], unavailableMetadata('Projects', 'Unavailable.'))).toMatch(/source is unavailable/i);
    expect(projectsHeroDescription([], availableMetadata)).toMatch(/currently contains no public project records/i);
    const emptySyntheticMetadata = { ...availableMetadata, synthetic: true };
    expect(projectsHeroDescription([], emptySyntheticMetadata)).toMatch(/no named public project records/i);
    expect(projectsNoticeMessage([], emptySyntheticMetadata)).toMatch(/currently contains no named public project records/i);
    expect(projectsNoticeMessage([{ title: 'Named prototype' } as PublicProject], emptySyntheticMetadata)).toMatch(/Project names are visible/i);
  });

  it('does not leak fallback START or carbon-plan states when site content is unavailable', async () => {
    process.env.SITE_CONTENT_PROVIDER = 'snapshot';
    render(await Home());
    const startState = screen.getByText('START snapshot').closest('div');
    const carbonState = screen.getByText('Carbon progress').closest('div');
    expect(startState).toHaveTextContent('Source unavailable');
    expect(startState).not.toHaveTextContent('Working purpose');
    expect(carbonState).toHaveTextContent('Source unavailable');
  });
});
