import type { DataQuality } from '@/lib/data-quality';

export type EnergyHistoryRange = '24h' | '7d';

export interface EnergySnapshot {
  currentPowerKw: number | null;
  energyTodayKwh: number | null;
  weeklyTrendPercent: number | null;
  lastUpdatedAt: string;
  quality: DataQuality;
}

export interface EnergyPoint {
  timestamp: string;
  label: string;
  value: number | null;
  unit: 'kW' | 'kWh';
  quality: DataQuality;
}

export interface EnergyImpact {
  avoidedEnergyKwh: number | null;
  comparisonMethod: string;
  quality: DataQuality;
}
