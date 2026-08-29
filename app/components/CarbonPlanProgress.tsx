import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import type { CarbonNeutralityPlanContent } from '@/lib/site-content/types';

function formatTonnes(value: number | null): string | null {
  if (value === null) return null;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} tCO₂e`;
}

function formatInventoryDecision(year: number | null, value: number | null): string {
  const amount = formatTonnes(value);

  if (year !== null && amount) return `${year} · ${amount}`;
  if (year !== null) return `${year} selected; inventory value pending`;
  if (amount) return `${amount}; reporting year pending`;
  return 'Awaiting an approved year and gross inventory';
}

function formatTargetDecision(year: number | null, value: number | null): string {
  const amount = formatTonnes(value);

  if (year !== null && amount) return `${year} · ${amount}`;
  if (year !== null) return `${year} selected; target level pending`;
  if (amount) return `${amount}; target year pending`;
  return 'Awaiting an approved year and gross-emissions target';
}

export function CarbonPlanProgress({ plan, available = true }: { plan: CarbonNeutralityPlanContent; available?: boolean }) {
  if (!available) {
    return (
      <div className="carbon-decisions">
        <div className="decision-status">
          <p>Plan status: <strong>Unavailable</strong></p>
          <DataQualityBadge quality="pending" />
        </div>
        <p className="decision-pending" role="status">
          <strong>Source unavailable</strong> No goal, baseline, target, boundary, method, or progress result has been inferred.
        </p>
      </div>
    );
  }

  return (
    <div className="carbon-decisions">
      <div className="decision-status">
        <p>Plan status: <strong>{plan.status}</strong></p>
        <DataQualityBadge quality={plan.quality} />
      </div>

      <dl className="decision-grid" aria-label="Carbon plan decisions required before progress can be calculated">
        <div className="decision-item">
          <dt>Goal</dt>
          <dd>{plan.goal ?? 'Awaiting institutional approval'}</dd>
        </div>
        <div className="decision-item">
          <dt>Baseline</dt>
          <dd>{formatInventoryDecision(plan.baselineYear, plan.baselineGrossEmissionsTco2e)}</dd>
        </div>
        <div className="decision-item">
          <dt>Inventory boundary</dt>
          <dd>{plan.inventoryBoundary ?? 'Awaiting approved operations, activities, and included scopes'}</dd>
        </div>
        <div className="decision-item">
          <dt>Target</dt>
          <dd>{formatTargetDecision(plan.targetYear, plan.targetGrossEmissionsTco2e)}</dd>
        </div>
        <div className="decision-item">
          <dt>Progress method</dt>
          <dd>{plan.progressMethod ?? 'Agree how comparable gross-emissions inventories will be assessed. Credits stay outside the reduction result.'}</dd>
        </div>
      </dl>

      {plan.progressPercent !== null ? (
        <div
          aria-label="Latest approved progress result"
          className="decision-progress-result"
        >
          <p>
            <span>Latest approved result</span>
            <strong>{new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(plan.progressPercent)}%</strong>
          </p>
          <p>{plan.progressMetric ?? 'Approved carbon-plan progress metric'}</p>
        </div>
      ) : (
        <p className="decision-pending" role="status">
          <strong>Not yet calculated</strong> No progress percentage is published. All five decisions must be approved and comparable first.
        </p>
      )}
    </div>
  );
}
