import Image from 'next/image';
import Link from 'next/link';
import { DataNotes } from '@/app/components/DataNotes';
import { PrototypeNotice } from '@/app/components/PrototypeNotice';
import { unavailableMetadata, type ProviderMetadata } from '@/lib/provider-metadata';
import { getSiteContentProvider } from '@/lib/site-content/server';
import type {
  CarbonNeutralityPlanContent,
  SustainabilityOverviewContent,
} from '@/lib/site-content/types';

export const dynamic = 'force-dynamic';

const unavailableOverview: SustainabilityOverviewContent = {
  sustainabilityDefinition: 'Sustainability content is temporarily unavailable. No replacement claim has been inferred.',
  placeContext: 'The selected public-content source could not be loaded.',
  valueAlignment: [],
  sourceReferences: [],
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

type CampusImpactStatus = 'reported' | 'pending' | 'unavailable';

export interface CampusCarbonImpact {
  status: CampusImpactStatus;
  label: string;
  value: string;
  unit: string | null;
  description: string;
  baseline: string;
  latestInventory: string;
  boundary: string;
}

function sourceName(value: string): string {
  try {
    const url = new URL(value);
    if (url.hostname === 'sks.org' && url.pathname.includes('/at-a-glance')) {
      return 'Storm King School — At a glance';
    }
    if (url.hostname === 'sks.org' && url.pathname.includes('/strategic-plan-2030')) {
      return 'Storm King School — Strategic Plan 2030';
    }
    if (url.hostname === 'sks.org') return 'Storm King School';
    if (url.hostname === 'www.un.org') return 'United Nations — Sustainable Development Goals';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
}

function formatTco2e(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function getCampusCarbonImpact(
  plan: CarbonNeutralityPlanContent,
  metadata: ProviderMetadata,
): CampusCarbonImpact {
  if (metadata.availability === 'unavailable') {
    return {
      status: 'unavailable',
      label: 'Campus carbon result',
      value: 'Source unavailable',
      unit: null,
      description: 'The selected public source could not be loaded, so no campus result has been inferred.',
      baseline: 'Source unavailable',
      latestInventory: 'Source unavailable',
      boundary: 'Source unavailable',
    };
  }

  if (
    plan.progressPercent !== null
    && plan.baselineGrossEmissionsTco2e !== null
    && plan.latestGrossEmissionsTco2e !== null
    && plan.baselineYear !== null
    && plan.latestReportingYear !== null
    && plan.inventoryBoundary !== null
  ) {
    const change = plan.baselineGrossEmissionsTco2e - plan.latestGrossEmissionsTco2e;
    const isReduction = change >= 0;

    return {
      status: 'reported',
      label: isReduction ? 'Gross emissions reduced' : 'Gross emissions change',
      value: `${isReduction ? '' : '+'}${formatTco2e(Math.abs(change))}`,
      unit: 'tCO₂e',
      description: isReduction
        ? `${plan.progressPercent}% of the approved emissions-reduction target has been attained from the ${plan.baselineYear} baseline through the ${plan.latestReportingYear} inventory.`
        : `The ${plan.latestReportingYear} inventory is higher than the ${plan.baselineYear} baseline; this is reported as a change, not a reduction.`,
      baseline: `${formatTco2e(plan.baselineGrossEmissionsTco2e)} tCO₂e · ${plan.baselineYear}`,
      latestInventory: `${formatTco2e(plan.latestGrossEmissionsTco2e)} tCO₂e · ${plan.latestReportingYear}`,
      boundary: plan.inventoryBoundary,
    };
  }

  return {
    status: 'pending',
    label: 'Campus carbon result',
    value: 'Awaiting approved inventory',
    unit: null,
    description: 'Storm King has not published a campus-wide reduction result yet. When the reporting boundary, baseline, latest inventory, and method are approved, this section will show the change in gross emissions—not a sum of project estimates.',
    baseline: plan.baselineYear !== null && plan.baselineGrossEmissionsTco2e !== null
      ? `${formatTco2e(plan.baselineGrossEmissionsTco2e)} tCO₂e · ${plan.baselineYear}`
      : 'Not yet approved',
    latestInventory: plan.latestReportingYear !== null && plan.latestGrossEmissionsTco2e !== null
      ? `${formatTco2e(plan.latestGrossEmissionsTco2e)} tCO₂e · ${plan.latestReportingYear}`
      : 'Not yet published',
    boundary: plan.inventoryBoundary ?? 'Not yet approved',
  };
}

async function loadSiteContent() {
  try {
    const provider = getSiteContentProvider();
    const [overview, carbonPlan, metadata] = await Promise.all([
      provider.getOverview(),
      provider.getCarbonPlan(),
      provider.getMetadata(),
    ]);
    return { overview, carbonPlan, metadata };
  } catch {
    return {
      overview: unavailableOverview,
      carbonPlan: unavailablePlan,
      metadata: unavailableMetadata(
        'Sustainability content',
        'The selected content source could not be loaded. No narrative, status, or result has been substituted.',
      ),
    };
  }
}

export default async function Home() {
  const { overview, carbonPlan, metadata } = await loadSiteContent();
  const impact = getCampusCarbonImpact(carbonPlan, metadata);

  return (
    <main tabIndex={-1} id="main-content">
      <section className="field-hero">
        <div className="field-hero-copy">
          <h1>A public record of sustainability progress.</h1>
          <p className="field-hero-lead">
            This report brings whole-school benchmarks and campus greenhouse-gas
            accounting together so the Storm King community can see what is changing,
            how it is measured, and what evidence is still needed.
          </p>
          <a className="primary-button" href="#campus-impact">See the impact measure <span aria-hidden="true">→</span></a>
        </div>
        <div className="field-hero-art" aria-hidden="true">
          <Image
            alt=""
            height="993"
            fetchPriority="high"
            loading="eager"
            sizes="(max-width: 760px) 100vw, 54vw"
            src="/images/topographic-field.webp"
            width="1584"
          />
        </div>
      </section>

      <PrototypeNotice
        detailsHref="#home-content-notes"
        heading={metadata.synthetic ? 'Public prototype' : undefined}
        message={metadata.synthetic ? 'School results appear after review.' : undefined}
        metadata={metadata}
      />

      <section className="report-section place-section" aria-labelledby="place-heading">
        <div>
          <h2 id="place-heading">Why this place matters</h2>
          <p>{overview.sustainabilityDefinition}</p>
        </div>
        <div>
          <p>{overview.placeContext}</p>
          {overview.sourceReferences.length > 0 ? (
            <div className="source-links" aria-label="Overview sources">
              {overview.sourceReferences.map((reference) => (
                <a href={reference} key={reference} rel="noreferrer" target="_blank">{sourceName(reference)} <span aria-hidden="true">↗</span></a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="impact-section" id="campus-impact" aria-labelledby="impact-heading">
        <div className="impact-section-inner">
          <header className="section-heading">
            <h2 id="impact-heading">Campus impact, in one measure</h2>
            <p>The broad carbon result is the change in gross campus greenhouse-gas emissions against an approved baseline, expressed in tonnes of carbon-dioxide equivalent.</p>
          </header>

          <div className="impact-ledger" data-status={impact.status}>
            <div className="impact-result" role={impact.status === 'reported' ? undefined : 'status'}>
              <p>{impact.label}</p>
              <strong>{impact.value}{impact.unit ? <small>{impact.unit}</small> : null}</strong>
              <span>{impact.description}</span>
            </div>
            <dl className="impact-facts">
              <div><dt>Approved baseline</dt><dd>{impact.baseline}</dd></div>
              <div><dt>Latest inventory</dt><dd>{impact.latestInventory}</dd></div>
              <div><dt>Reporting boundary</dt><dd>{impact.boundary}</dd></div>
            </dl>
          </div>

          <p className="impact-note">This measure reports campus-wide gross emissions before offsets. Individual project estimates remain on the Projects page and never reduce this total automatically.</p>
        </div>
      </section>

      <section className="report-section frameworks-section" id="frameworks" aria-labelledby="frameworks-heading">
        <header className="section-heading">
          <h2 id="frameworks-heading">Two frameworks, two jobs</h2>
          <p>START tracks sustainability across the whole school. The carbon-neutrality framework accounts specifically for greenhouse-gas emissions. Together, they turn intentions into an organized, reviewable record.</p>
        </header>

        <div className="framework-paths">
          <article>
            <p className="framework-type">Whole-school sustainability</p>
            <h3>START</h3>
            <p>START—the Sustainability Tracking, Analytics &amp; Roadmap Tool—organizes benchmarking, planning, and evidence across education, organizational culture, and the physical campus.</p>
            <Link className="text-link" href="/start">Understand the START framework <span aria-hidden="true">→</span></Link>
          </article>
          <article>
            <p className="framework-type">Greenhouse-gas accounting</p>
            <h3>Carbon neutrality</h3>
            <p>The carbon-neutrality framework defines what emissions count, establishes a baseline, prioritizes direct reductions, and reports residual emissions and any retired credits separately.</p>
            <Link className="text-link" href="/carbon">Understand the carbon framework <span aria-hidden="true">→</span></Link>
          </article>
        </div>
      </section>

      <section className="report-section notes-section" aria-label="Report provenance">
        <DataNotes id="home-content-notes" metadata={metadata} title="Report data notes" />
      </section>
    </main>
  );
}
