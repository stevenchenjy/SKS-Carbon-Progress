import { describe, expect, it } from 'vitest';
import { MockCarbonProvider } from '@/lib/carbon/providers/mockCarbonProvider';
import { MockRevertProvider } from '@/lib/energy/providers/mockRevertProvider';
import { MockProjectProvider } from '@/lib/projects/providers/mockProjects';
import { MockRoadmapProvider } from '@/lib/roadmap/providers/mockRoadmapProvider';

describe('mock provider contracts', () => {
  it('returns a claim-safe carbon structure and independent clones', async () => {
    const provider = new MockCarbonProvider();
    const first = await provider.getOverview();
    const second = await provider.getOverview();
    const metadata = await provider.getMetadata();

    expect(metadata).toMatchObject({ synthetic: true, provider: 'mock-carbon', status: 'prototype' });
    expect(first.quality).toBe('prototype');
    expect(first.reductionPercent).toBeNull();
    expect(first.scopeBreakdown.map((scope) => scope.scope)).toEqual(['Scope 1', 'Scope 2', 'Scope 3']);
    expect(first.scopeBreakdown.every((scope) => scope.value === null)).toBe(true);
    first.scopeBreakdown[0].note = 'changed by test';
    expect(second.scopeBreakdown[0].note).not.toBe('changed by test');
  });

  it('returns deterministic prototype energy data for both ranges', async () => {
    const provider = new MockRevertProvider();
    const snapshot = await provider.getCurrentUsage();
    const metadata = await provider.getMetadata();
    const hourly = await provider.getHistoricalUsage('24h');
    const weekly = await provider.getHistoricalUsage('7d');

    expect(snapshot.quality).toBe('prototype');
    expect(metadata.disclosure).toBe('Prototype data from simulated Revert Smart Plug feed.');
    expect(Number.isNaN(Date.parse(snapshot.lastUpdatedAt))).toBe(false);
    expect(hourly).toHaveLength(24);
    expect(weekly).toHaveLength(7);
    expect([...hourly, ...weekly].every((point) => point.quality === 'prototype')).toBe(true);
    expect([...hourly, ...weekly].every((point) => point.value === null || Number.isFinite(point.value))).toBe(true);
  });

  it('returns only public-safe project fields', async () => {
    const projects = await new MockProjectProvider().getPublicProjects();
    const metadata = await new MockProjectProvider().getMetadata();
    const serialized = JSON.stringify(projects).toLowerCase();

    expect(projects.length).toBeGreaterThan(0);
    expect(metadata.synthetic).toBe(true);
    expect(projects.every((project) => ['prototype', 'pending'].includes(project.quality))).toBe(true);
    for (const forbidden of ['internalnotes', 'facultyemail', 'studentidentity', 'privateconcern', 'approvaldiscussion']) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it('returns all five roadmap areas with qualitative progress and no fake percentage', async () => {
    const areas = await new MockRoadmapProvider().getAreas();
    const metadata = await new MockRoadmapProvider().getMetadata();

    expect(areas.map((area) => area.title)).toEqual([
      'Energy & Buildings',
      'Waste & Circularity',
      'Food Systems',
      'Transportation',
      'Education & Engagement',
    ]);
    expect(metadata.provider).toBe('mock-roadmap');
    expect(areas.every((area) => area.progress.quality === 'prototype')).toBe(true);
    expect(areas.every((area) => area.progress.percent === null)).toBe(true);
    expect(areas.every((area) => area.progress.metricLabel === null)).toBe(true);
  });
});
