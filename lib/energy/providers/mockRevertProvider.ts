import type { EnergyProvider } from '@/lib/energy/provider';
import type { EnergyHistoryRange, EnergyImpact, EnergyPoint, EnergySnapshot } from '@/lib/energy/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

const metadata: ProviderMetadata = {
  synthetic: true,
  status: 'prototype',
  provider: 'mock-revert',
  sourceLabel: 'Simulated Revert Smart Plug feed',
  disclosure: 'Prototype data from simulated Revert Smart Plug feed.',
};

const hourlyValues = [18, 16, 15, 14, 14, 17, 24, 32, 39, 44, 47, 49, 46, 43, 45, 48, 52, 50, 42, 36, 31, 27, 23, 20];
const weeklyValues = [312, 346, 329, 371, 355, 268, 241];

const snapshot: EnergySnapshot = {
  currentPowerKw: 42.8,
  energyTodayKwh: 318.4,
  weeklyTrendPercent: -6.2,
  lastUpdatedAt: '2026-08-22T13:40:00-04:00',
  quality: 'prototype',
};

const impact: EnergyImpact = {
  avoidedEnergyKwh: 27.6,
  comparisonMethod: 'Synthetic comparison against an illustrative hourly baseline',
  quality: 'prototype',
};

function hourlyPoints(): EnergyPoint[] {
  return hourlyValues.map((value, hour) => ({
    timestamp: `2026-08-22T${String(hour).padStart(2, '0')}:00:00-04:00`,
    label: hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`,
    value,
    unit: 'kW',
    quality: 'prototype',
  }));
}

function weeklyPoints(): EnergyPoint[] {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => ({
    timestamp: `2026-08-${String(17 + index).padStart(2, '0')}T12:00:00-04:00`,
    label,
    value: weeklyValues[index],
    unit: 'kWh',
    quality: 'prototype',
  }));
}

export class MockRevertProvider implements EnergyProvider {
  async getMetadata(): Promise<ProviderMetadata> {
    return structuredClone(metadata);
  }

  async getCurrentUsage(): Promise<EnergySnapshot> {
    return structuredClone(snapshot);
  }

  async getHistoricalUsage(range: EnergyHistoryRange): Promise<EnergyPoint[]> {
    return range === '24h' ? hourlyPoints() : weeklyPoints();
  }

  async getImpactSummary(): Promise<EnergyImpact> {
    return structuredClone(impact);
  }
}
