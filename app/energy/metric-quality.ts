import type { DataQuality } from '@/lib/data-quality';

export function energyMetricQuality(value: number | null, quality: DataQuality): DataQuality {
  return value === null ? 'pending' : quality;
}
