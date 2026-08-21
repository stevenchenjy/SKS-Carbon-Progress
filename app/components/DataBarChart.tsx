import { scaleLinear } from 'd3-scale';

export interface DataBarPoint {
  label: string;
  value: number | null;
}

interface DataBarChartProps {
  points: DataBarPoint[];
  title: string;
  unit: string;
  sparseLabels?: boolean;
  tone?: 'forest' | 'lime';
  isSynthetic?: boolean;
}

export function DataBarChart({ points, title, unit, sparseLabels = false, tone = 'forest', isSynthetic = true }: DataBarChartProps) {
  const presentValues = points.flatMap((point) => point.value === null || !Number.isFinite(point.value) ? [] : [point.value]);

  if (presentValues.length === 0) {
    return (
      <div className="chart-empty" role="status">
        <strong>{isSynthetic ? 'No prototype readings to show' : 'No readings to show'}</strong>
        <p>This chart is ready to display data when its provider returns a series.</p>
      </div>
    );
  }

  const maximum = Math.max(...presentValues, 1);
  const heightScale = scaleLinear().domain([0, maximum]).range([0, 100]).clamp(true);
  const provenanceLabel = isSynthetic ? 'Synthetic prototype data' : 'Provider-supplied data';
  const valueLabel = isSynthetic ? 'simulated' : 'reported';

  return (
    <figure className={`bar-chart chart-${tone}`} aria-label={`${title}. ${provenanceLabel} in ${unit}.`}>
      <div className="chart-plot">
        {points.map((point, index) => {
          const isMissing = point.value === null || !Number.isFinite(point.value);
          const height = isMissing ? 3 : Math.max(heightScale(point.value as number), 5);
          const hideLabel = sparseLabels && index % 4 !== 0 && index !== points.length - 1;
          return (
            <div className="bar-column" key={`${point.label}-${index}`}>
              <span
                className={isMissing ? 'bar missing' : 'bar'}
                style={{ height: `${height}%` }}
                title={isMissing ? `${point.label}: missing` : `${point.label}: ${point.value} ${unit} (${valueLabel})`}
              />
              <small aria-hidden={hideLabel}>{hideLabel ? '' : point.label}</small>
            </div>
          );
        })}
      </div>
      <figcaption>{isSynthetic ? 'Simulated' : 'Reported'} series · {unit}</figcaption>
      <table className="sr-only">
        <caption>{title} {isSynthetic ? 'synthetic' : 'provider-supplied'} values</caption>
        <thead><tr><th>Period</th><th>Value</th></tr></thead>
        <tbody>
          {points.map((point, index) => (
            <tr key={`${point.label}-row-${index}`}><th>{point.label}</th><td>{point.value === null || !Number.isFinite(point.value) ? 'Missing' : `${point.value} ${unit}`}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
