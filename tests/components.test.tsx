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

const prototypeMetadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'test-mock',
  sourceLabel: 'Test mock provider',
  disclosure: 'Synthetic test data only.',
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
});
