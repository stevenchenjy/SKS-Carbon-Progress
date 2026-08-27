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
  it('keeps the four-area overview available when the secondary energy provider is misconfigured', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await Home());
    expect(screen.getByRole('heading', { name: /care for today/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'START' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Carbon Neutrality Plan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  });

  it('renders an honest energy unavailable state instead of throwing or substituting mock values', async () => {
    process.env.ENERGY_PROVIDER = 'revert';
    render(await EnergyPage());
    expect(screen.getAllByText('Data source unavailable').length).toBeGreaterThan(0);
    expect(screen.getByText(/No reading has been inferred or replaced/i)).toBeInTheDocument();
    expect(screen.queryByText('42.8')).not.toBeInTheDocument();
  });
});
