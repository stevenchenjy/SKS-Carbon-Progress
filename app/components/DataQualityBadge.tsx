import { dataQualityLabels, type DataQuality } from '@/lib/data-quality';

export function DataQualityBadge({ quality }: { quality: DataQuality }) {
  return <span className={`quality-badge quality-${quality}`}>{dataQualityLabels[quality]}</span>;
}
