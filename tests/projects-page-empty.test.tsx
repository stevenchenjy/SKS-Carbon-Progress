import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const emptySyntheticMetadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'empty-synthetic-test',
  sourceLabel: 'Empty synthetic snapshot',
  disclosure: 'The connected prototype contains no records.',
  availability: 'available',
  publicationStatus: 'prototype',
  freshness: { state: 'not-applicable', observedAt: '2026-08-22', staleAfterMinutes: null },
  coverage: { kind: 'public-subset', label: 'Empty public subset', note: 'No records.', monitoredDeviceCount: null },
  reportingPeriod: null,
};

vi.mock('@/lib/projects/server', () => ({
  getProjectProvider: () => ({
    getPublicProjects: async () => [],
    getMetadata: async () => emptySyntheticMetadata,
  }),
}));

import ProjectsPage from '@/app/projects/page';

describe('empty synthetic Projects page', () => {
  it('does not claim project names are visible when the source has no records', async () => {
    render(await ProjectsPage());

    const notice = screen.getByRole('note');
    expect(notice).toHaveTextContent('currently contains no named public project records');
    expect(notice).not.toHaveTextContent('Project names are visible');
    expect(screen.getByText('Public records').closest('div')).toHaveTextContent('0');
    expect(screen.getByText('Result state').closest('div')).toHaveTextContent('No records');
    expect(screen.getByText('Result state').closest('div')).not.toHaveTextContent('Pending review');
    expect(screen.getByRole('status')).toHaveTextContent('No public projects available');
  });
});
