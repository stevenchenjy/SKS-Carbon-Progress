import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import Home from '@/app/page';
import EnergyPage from '@/app/energy/page';

afterEach(() => {
  delete process.env.ENERGY_PROVIDER;
  delete process.env.REVERT_API_URL;
  delete process.env.REVERT_API_KEY;
});

describe('public page provider isolation', () => {
  it('keeps carbon and roadmap content available when the selected energy provider is misconfigured', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await Home());
    expect(screen.getByText('Energy data unavailable')).toBeInTheDocument();
    expect(screen.getByText('Illustrative baseline')).toBeInTheDocument();
    expect(screen.getByText('Energy & Buildings')).toBeInTheDocument();
  });

  it('renders an honest energy unavailable state instead of throwing or substituting mock values', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await EnergyPage());
    expect(screen.getAllByText('Data source unavailable').length).toBeGreaterThan(0);
    expect(screen.getByText(/No reading has been inferred or replaced/i)).toBeInTheDocument();
    expect(screen.queryByText('42.8')).not.toBeInTheDocument();
  });
});
