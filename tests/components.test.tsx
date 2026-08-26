import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataBarChart } from '@/app/components/DataBarChart';
import { CarbonScopeGrid } from '@/app/components/CarbonScopeGrid';
import { CarbonTimeline } from '@/app/components/CarbonTimeline';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { ProjectGrid } from '@/app/components/ProjectGrid';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { RoadmapGrid } from '@/app/components/RoadmapGrid';
import type { ProviderMetadata } from '@/lib/provider-metadata';
import { canClaimVerified, disclosureHeading, publicClaimVocabulary, verificationLabel } from '@/lib/claim-safety';

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

describe('public data components', () => {
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
    expect(screen.getByText('Prototype data only')).toBeInTheDocument();
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
          verificationReference: 'https://example.invalid/project-evidence',
          nextPublicStep: null,
          updatedAt: '2026-08-22',
          quality: 'measured',
        }]}
      />,
    );
    expect(screen.getByRole('link', { name: /view verification evidence/i })).toHaveAttribute('href', 'https://example.invalid/project-evidence');
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
    render(<PrototypeNotice metadata={prototypeMetadata} />);
    expect(screen.getByText('Test coverage')).toBeInTheDocument();
    expect(screen.getByText('Not a live feed')).toBeInTheDocument();
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
