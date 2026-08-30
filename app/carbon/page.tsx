import type { Metadata } from 'next';
import { CarbonPlanProgress } from '@/app/components/CarbonPlanProgress';
import { CarbonScopeGrid } from '@/app/components/CarbonScopeGrid';
import { DataNotes } from '@/app/components/DataNotes';
import { DataQualityBadge } from '@/app/components/DataQualityBadge';
import { getCarbonProvider } from '@/lib/carbon/server';
import type { CarbonMethodology, CarbonOverview, CarbonTotals } from '@/lib/carbon/types';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';
import { getSiteContentProvider } from '@/lib/site-content/server';
import type { CarbonNeutralityPlanContent } from '@/lib/site-content/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Carbon planning | Storm King Sustainability Field Report',
  description: 'See the decisions, inventory boundary, and reporting method required for a credible Storm King School carbon plan.',
  alternates: { canonical: '/carbon' },
};

const unavailablePlan: CarbonNeutralityPlanContent = {
  definition: 'The selected carbon-plan source could not be loaded.',
  goal: null,
  targetYear: null,
  baselineYear: null,
  latestReportingYear: null,
  inventoryBoundary: null,
  baselineGrossEmissionsTco2e: null,
  latestGrossEmissionsTco2e: null,
  targetGrossEmissionsTco2e: null,
  progressPercent: null,
  progressMetric: null,
  progressMethod: null,
  retiredOffsetsTco2e: null,
  offsetsMethod: null,
  offsetsEvidenceReference: null,
  status: 'Framework',
  updatedAt: null,
  quality: 'pending',
  framework: [],
};

async function loadCarbonInventoryData() {
  try {
    const provider = getCarbonProvider();
    const [overview, methodology, providerMetadata] = await Promise.all([
      provider.getOverview(),
      provider.getMethodology(),
      provider.getMetadata(),
    ]);
    return { overview, methodology, providerMetadata };
  } catch {
    const overview: CarbonOverview = {
      baselineYear: null,
      latestReportingYear: null,
      reductionPercent: null,
      emissionsTrend: 'Source unavailable',
      reportingStatus: 'Unavailable',
      quality: 'pending',
      scopeBreakdown: [],
      totals: null,
    };
    const methodology: CarbonMethodology = {
      reportingBoundary: 'The selected carbon source is unavailable; no reporting boundary is being inferred.',
      baselineDefinition: 'Awaiting an available, reviewed source.',
      emissionsFactors: 'Awaiting an available, reviewed source.',
      reportingYear: 'Awaiting an available, reviewed source.',
      dataQualityStatus: 'pending',
      approach: ['No result is substituted when the configured source fails.'],
    };
    return {
      overview,
      methodology,
      providerMetadata: unavailableMetadata('Carbon inventory', 'The carbon inventory source could not be loaded. No values were inferred or replaced with mock data.'),
    };
  }
}

async function loadCarbonPlanData() {
  try {
    const provider = getSiteContentProvider();
    const [plan, metadata] = await Promise.all([provider.getCarbonPlan(), provider.getMetadata()]);
    return { plan, metadata };
  } catch {
    return {
      plan: unavailablePlan,
      metadata: unavailableMetadata('Carbon plan', 'The selected carbon-plan source could not be loaded. No goal, percentage, or offset quantity has been inferred.'),
    };
  }
}

function caveatFor(planMetadata: ProviderMetadata, inventoryMetadata: ProviderMetadata): string {
  if (planMetadata.availability === 'unavailable' || inventoryMetadata.availability === 'unavailable') {
    return 'One or more configured sources is unavailable. No replacement result has been inferred.';
  }
  if (planMetadata.synthetic && inventoryMetadata.synthetic) {
    return 'Public prototype. No Storm King School carbon inventory or reduction result is shown.';
  }
  return 'Plan decisions and inventory records are governed separately. Check each data-notes disclosure before reading a result.';
}

function planIntroduction(metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') return 'The plan source is unavailable. No decision or result has been inferred.';
  if (metadata.synthetic) return 'No approved public goal, baseline, target, boundary, or progress method is connected yet.';
  return 'Approved plan decisions appear below with their publication and source status.';
}

function inventoryIntroduction(metadata: ProviderMetadata): string {
  if (metadata.availability === 'unavailable') return 'The inventory source is unavailable. Scope values remain empty.';
  if (metadata.synthetic) return 'These scope cards define the reporting structure only. They do not contain school results.';
  return `${metadata.coverage.label}. Values, units, quality, and source notes remain attached to each scope.`;
}

function formatTotal(value: number | null, unit: CarbonTotals['unit']): string {
  if (value === null) return 'Pending';
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}

export default async function CarbonPage() {
  const [inventoryData, planData] = await Promise.all([loadCarbonInventoryData(), loadCarbonPlanData()]);
  const { overview, methodology, providerMetadata } = inventoryData;
  const { plan, metadata: planMetadata } = planData;
  const canPublishTotals = overview.totals !== null
    && !providerMetadata.synthetic
    && providerMetadata.publicationStatus === 'reported';

  return (
    <main id="main-content" className="carbon-page">
      <section className="page-hero carbon-page-hero" aria-labelledby="carbon-page-title">
        <div className="page-hero-copy">
          <h1 id="carbon-page-title">Decisions before percentages.</h1>
          <p>A credible carbon plan starts with an approved goal, reporting boundary, baseline, target, and method.</p>
        </div>
        <p className="page-caveat" role="status">{caveatFor(planMetadata, providerMetadata)}</p>
      </section>

      <section className="report-section carbon-plan-section" aria-labelledby="carbon-plan-heading">
        <header className="section-heading">
          <div>
            <h2 id="carbon-plan-heading">Plan decisions</h2>
            <p>{planIntroduction(planMetadata)}</p>
          </div>
        </header>

        <CarbonPlanProgress plan={plan} available={planMetadata.availability !== 'unavailable'} />

        <div className="carbon-framework" aria-labelledby="carbon-framework-heading">
          <header className="section-heading carbon-framework-heading">
            <div>
              <h3 id="carbon-framework-heading">{plan.framework.length === 5 ? 'Five-stage reduction framework' : 'Reduction framework'}</h3>
              <p>Define the rules, measure the inventory, reduce gross emissions, separate residuals, then review the public record.</p>
            </div>
          </header>
          {plan.framework.length > 0 ? (
            <ol className="carbon-framework-list">
              {plan.framework.map((stage, index) => (
                <li className="carbon-framework-step" key={stage.id}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div>
                    <h4>{stage.title}</h4>
                    <p>{stage.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="carbon-framework-empty" role="status">
              <strong>Framework unavailable</strong>
              <p>No substitute stages are shown while the configured plan source is unavailable.</p>
            </div>
          )}
        </div>

        {plan.retiredOffsetsTco2e !== null ? (
          <div className="carbon-plan-evidence">
            <h3>Credits remain a separate ledger</h3>
            <p>{formatTotal(plan.retiredOffsetsTco2e, 'tCO2e')} retired. {plan.offsetsMethod ?? 'No method supplied.'}</p>
            {plan.offsetsEvidenceReference ? <a href={plan.offsetsEvidenceReference}>View retirement evidence <span aria-hidden="true">↗</span></a> : <p>No public retirement evidence was supplied.</p>}
          </div>
        ) : null}

        <DataNotes id="carbon-plan-data-notes" metadata={planMetadata} title="Plan data notes" />
      </section>

      <section className="report-section carbon-inventory-section" aria-labelledby="carbon-inventory-heading">
        <header className="section-heading">
          <div>
            <h2 id="carbon-inventory-heading">Inventory by scope</h2>
            <p>{inventoryIntroduction(providerMetadata)}</p>
          </div>
        </header>

        <CarbonScopeGrid scopes={overview.scopeBreakdown} metadata={providerMetadata} />

        {canPublishTotals && overview.totals ? (
          <div className="carbon-totals" aria-labelledby="carbon-totals-heading">
            <div>
              <h3 id="carbon-totals-heading">Inventory totals</h3>
              <p>{overview.totals.calculationMethod ?? 'No offsets or net-emissions calculation method was supplied.'}</p>
            </div>
            <dl className="carbon-totals-list">
              <div><dt>Gross emissions</dt><dd>{formatTotal(overview.totals.grossEmissions, overview.totals.unit)}</dd></div>
              <div><dt>Retired offsets</dt><dd>{formatTotal(overview.totals.offsets, overview.totals.unit)}</dd></div>
              <div><dt>Net emissions</dt><dd>{formatTotal(overview.totals.netEmissions, overview.totals.unit)}</dd></div>
            </dl>
          </div>
        ) : null}

        <details className="carbon-methodology">
          <summary>Methodology and review rules</summary>
          <div className="carbon-methodology-body">
            <div className="carbon-methodology-status">
              <span>Data quality</span>
              <DataQualityBadge quality={methodology.dataQualityStatus} />
            </div>
            <dl className="carbon-methodology-list">
              <div><dt>Reporting boundary</dt><dd>{methodology.reportingBoundary}</dd></div>
              <div><dt>Baseline definition</dt><dd>{methodology.baselineDefinition}</dd></div>
              <div><dt>Emissions factors</dt><dd>{methodology.emissionsFactors}</dd></div>
              <div><dt>Reporting period</dt><dd>{methodology.reportingYear}</dd></div>
            </dl>
            <div className="carbon-methodology-approach">
              <h3>Review approach</h3>
              {methodology.approach.length > 0 ? (
                <ul>{methodology.approach.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : <p>No review steps were supplied.</p>}
            </div>
          </div>
        </details>

        <DataNotes id="carbon-inventory-data-notes" metadata={providerMetadata} title="Inventory data notes" />
      </section>
    </main>
  );
}
