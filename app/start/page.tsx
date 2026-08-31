import Link from 'next/link';
import type { Metadata } from 'next';
import { StartProgressOverview } from '@/app/components/StartProgressOverview';

export const metadata: Metadata = {
  title: 'START & Green Schools Alliance | Storm King Sustainability Field Report',
  description: 'How Storm King School participates in the Green Schools Alliance START framework through student-led sustainability work and an anonymized public progress snapshot.',
  alternates: { canonical: '/start' },
};

const externalSources = [
  { href: 'https://www.greenschoolsalliance.org/about-start', label: 'About START' },
  { href: 'https://www.greenschoolsalliance.org/studentdriven-start', label: 'Student-driven START' },
  { href: 'https://www.greenschoolsalliance.org/how-to-use-start-school-level', label: 'START school-level guide' },
] as const;

function Arrow() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 48 20">
      <path d="M1 10h42M35 2l8 8-8 8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

export default function StartPage() {
  return (
    <main className="start-page" id="main-content">
      <section className="start-hero" aria-labelledby="start-page-title">
        <div className="start-hero-copy">
          <p className="page-kicker">Green Schools Alliance</p>
          <h1 id="start-page-title">START at Storm King</h1>
          <p>
            Storm King participates in START—the Green Schools Alliance’s Sustainability
            Tracking, Analytics &amp; Roadmap Tool. It gives students and staff a shared way to
            study campus life, select priorities, and turn evidence into practical action.
          </p>
          <Link className="start-text-link" href="#student-pathway">See how students lead the work <Arrow /></Link>
        </div>
        <StartProgressOverview />
      </section>

      <section className="report-section start-alliance-section" aria-labelledby="alliance-heading">
        <header className="section-heading">
          <h2 id="alliance-heading">A worldwide community, grounded here.</h2>
          <p>
            Green Schools Alliance is a worldwide peer-to-peer network of schools and
            sustainability champions. START brings that shared learning into daily campus work.
          </p>
        </header>
        <div className="start-principles">
          <article>
            <span>01</span>
            <h3>A whole-school lens</h3>
            <p>START looks at educational programs, organizational culture, and the physical place—not buildings alone.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Progress with context</h3>
            <p>The framework helps a school benchmark current practice, identify what needs attention, and plan its next steps.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Learning from peers</h3>
            <p>Participation connects local work to a broader community of schools taking measurable sustainability action.</p>
          </article>
        </div>
      </section>

      <section className="start-pathway-section" id="student-pathway" aria-labelledby="pathway-heading">
        <div className="start-section-inner">
          <header className="start-centered-heading">
            <h2 id="pathway-heading">A student-led pathway to impact.</h2>
            <p>Students help make the assessment useful by turning questions about campus life into well-supported projects.</p>
          </header>
          <ol className="start-step-list">
            <li>
              <span className="start-step-connector"><Arrow /></span>
              <span>01</span>
              <h3>Study campus life</h3>
              <p>Students collect information, hear from stakeholders, and identify strengths alongside opportunities to improve.</p>
            </li>
            <li>
              <span className="start-step-connector"><Arrow /></span>
              <span>02</span>
              <h3>Propose practical projects</h3>
              <p>Teams develop ideas that respond to a priority and can advance a relevant START metric when the work is documented.</p>
            </li>
            <li>
              <span>03</span>
              <h3>Gather evidence and reflect</h3>
              <p>Students share findings, document progress, and use what they learn to improve the next round of work.</p>
            </li>
          </ol>
          <Link className="start-project-link" href="/projects">Explore student projects <Arrow /></Link>
        </div>
      </section>

      <section className="report-section start-context-section" aria-labelledby="context-heading">
        <div>
          <h2 id="context-heading">How to read this snapshot</h2>
          <p>
            The figures above are an anonymized aggregate snapshot supplied by Storm King for this
            public report. They are a point-in-time summary of progress within the START framework,
            not a standalone measure of environmental impact.
          </p>
        </div>
        <div className="start-context-detail">
          <p><strong>Important context:</strong> START is a planning and assessment framework, not a certification program. Points reflect documented achievement within its metrics; a project proposal does not automatically add points.</p>
          <div className="source-links" aria-label="Green Schools Alliance sources">
            {externalSources.map((source) => (
              <a href={source.href} key={source.href} rel="noreferrer" target="_blank">{source.label} <span aria-hidden="true">↗</span></a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
