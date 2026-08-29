import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { CarbonNeutralityPlanContent } from '@/lib/site-content/types';

function formatTonnes(value: number | null): string {
  if (value === null) return 'Awaiting data';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} tCO₂e`;
}

export function CarbonPlanProgress({ plan }: { plan: CarbonNeutralityPlanContent }) {
  const hasProgress = plan.progressPercent !== null;
  const visualProgress = hasProgress ? Math.max(0, Math.min(100, plan.progressPercent ?? 0)) : 0;

  return (
    <section className="plan-progress-card" aria-labelledby="plan-progress-heading">
      <div className="plan-progress-copy">
        <div className="plan-progress-topline">
          <span>Emissions-reduction progress</span>
          <DataQualityBadge quality={plan.quality} />
        </div>
        <h2 id="plan-progress-heading">
          {hasProgress ? `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(plan.progressPercent ?? 0)}%` : 'Not yet calculated'}
        </h2>
        <p>
          {hasProgress
            ? plan.progressMetric
            : 'An approved goal, baseline, comparable gross inventory, target value, boundary, and calculation method are required before a percentage can be published.'}
        </p>
        {hasProgress ? (
          <div
            aria-label={`${plan.progressPercent}% of the approved gross-emissions reduction target achieved`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={visualProgress}
            className="plan-progress-track"
            role="progressbar"
          >
            <span style={{ width: `${visualProgress}%` }} />
          </div>
        ) : (
          <div className="plan-progress-track is-pending" role="status" aria-label="Carbon progress not yet available"><span /></div>
        )}
        <small>{plan.progressMethod ?? 'Progress must use comparable gross emissions; credits and project estimates stay outside the numerator.'}</small>
      </div>

      <dl className="plan-progress-values">
        <div><dt>Approved goal</dt><dd>{plan.goal ?? 'Awaiting institutional approval'}</dd></div>
        <div><dt>Baseline</dt><dd>{plan.baselineYear ?? '—'} · {formatTonnes(plan.baselineGrossEmissionsTco2e)}</dd></div>
        <div><dt>Latest inventory</dt><dd>{plan.latestReportingYear ?? '—'} · {formatTonnes(plan.latestGrossEmissionsTco2e)}</dd></div>
        <div><dt>Target</dt><dd>{plan.targetYear ?? '—'} · {formatTonnes(plan.targetGrossEmissionsTco2e)}</dd></div>
        <div><dt>Inventory boundary</dt><dd>{plan.inventoryBoundary ?? 'Awaiting an approved boundary and included scopes'}</dd></div>
        <div>
          <dt>Credits retired · separate ledger</dt>
          <dd>{formatTonnes(plan.retiredOffsetsTco2e)}</dd>
          {plan.offsetsEvidenceReference ? <a href={plan.offsetsEvidenceReference}>View retirement evidence ↗</a> : <small>No registry retirement evidence supplied</small>}
        </div>
      </dl>
    </section>
  );
}
