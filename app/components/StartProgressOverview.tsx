import type { CSSProperties } from 'react';

type StartCategoryTone = 'education' | 'culture' | 'place';

export interface StartCategory {
  id: string;
  label: string;
  points: number;
  possiblePoints: number;
  tone: StartCategoryTone;
}

export const startCategories: readonly StartCategory[] = [
  {
    id: 'educational-programs',
    label: 'Educational Programs',
    points: 86,
    possiblePoints: 120,
    tone: 'education',
  },
  {
    id: 'organizational-culture',
    label: 'Organizational Culture',
    points: 193,
    possiblePoints: 326,
    tone: 'culture',
  },
  {
    id: 'physical-place',
    label: 'Physical Place',
    points: 64,
    possiblePoints: 517,
    tone: 'place',
  },
] as const;

export const startSnapshot = {
  points: 343,
  possiblePoints: 963,
  rating: 'Two Stars',
  completedMetrics: 31,
  totalMetrics: 53,
} as const;

function CategoryIcon({ tone }: { tone: StartCategoryTone }) {
  if (tone === 'education') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
        <path d="m4.5 12.2 11.5-5.7 11.5 5.7L16 17.8 4.5 12.2Z" fill="currentColor" opacity=".94" />
        <path d="M9.2 15.1v5.1c2.2 2.3 11.4 2.3 13.6 0v-5.1M27.5 12.2v7.4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (tone === 'culture') {
    return (
      <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
        <circle cx="16" cy="10.2" fill="currentColor" r="4.1" />
        <circle cx="7.8" cy="14.1" fill="currentColor" opacity=".82" r="3.3" />
        <circle cx="24.2" cy="14.1" fill="currentColor" opacity=".82" r="3.3" />
        <path d="M9.1 25.4c0-4.1 3.1-6.6 6.9-6.6s6.9 2.5 6.9 6.6M2.9 24.2c0-3 2-5.1 4.9-5.1 1.4 0 2.6.5 3.5 1.5M29.1 24.2c0-3-2-5.1-4.9-5.1-1.4 0-2.6.5-3.5 1.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 32 32">
      <path d="M25.5 5.2C15.2 5.9 8.8 10.6 8.8 18.2c0 4.2 2.8 7.1 6.6 7.1 7.7 0 10-9.6 10.1-20.1Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M6.4 26.5c4.6-5.1 9.5-9 15.1-12.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function StarRating() {
  return (
    <svg aria-hidden="true" className="start-rating-mark" fill="none" viewBox="0 0 78 78">
      <path d="m39 5 4.7 5.9 7.5-1.2 2.7 7.1 7.1 2.7-1.2 7.5L65 31.7l-3 7.3 3 7.3-5.4 4.7 1.2 7.5-7.1 2.7-2.7 7.1-7.5-1.2L39 73l-4.7-5.9-7.5 1.2-2.7-7.1-7.1-2.7 1.2-7.5-5.4-4.7 3-7.3-3-7.3 5.4-4.7-1.2-7.5 7.1-2.7 2.7-7.1 7.5 1.2L39 5Z" fill="currentColor" opacity=".22" />
      <path d="m39 9.3 4.2 5.3 6.7-1 2.4 6.3 6.3 2.4-1 6.7 5.3 4.2-2.7 6.5 2.7 6.5-5.3 4.2 1 6.7-6.3 2.4-2.4 6.3-6.7-1-4.2 5.3-4.2-5.3-6.7 1-2.4-6.3-6.3-2.4 1-6.7-5.3-4.2 2.7-6.5-2.7-6.5 5.3-4.2-1-6.7 6.3-2.4 2.4-6.3 6.7 1L39 9.3Z" fill="currentColor" opacity=".48" />
      <path d="m31.2 34.2 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7 2.1-4.3ZM49.8 34.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7 2.1-4.3Z" fill="currentColor" />
    </svg>
  );
}

export function StartProgressOverview() {
  return (
    <section aria-labelledby="start-snapshot-title" className="start-scorecard">
      <h2 className="sr-only" id="start-snapshot-title">Current START snapshot</h2>
      <div className="start-score-summary">
        <div className="start-score-cell">
          <p>START points</p>
          <strong>{startSnapshot.points}<small> / {startSnapshot.possiblePoints}</small></strong>
        </div>
        <div className="start-score-cell start-rating-cell">
          <p>START rating</p>
          <StarRating />
          <strong>{startSnapshot.rating}</strong>
        </div>
        <div className="start-score-cell">
          <p>Metrics complete</p>
          <strong>{startSnapshot.completedMetrics}<small> / {startSnapshot.totalMetrics}</small></strong>
        </div>
      </div>

      <div className="start-category-list">
        {startCategories.map((category) => {
          const percent = (category.points / category.possiblePoints) * 100;
          const progressStyle = { '--progress-width': `${percent}%` } as CSSProperties;

          return (
            <article className={`start-category start-category--${category.tone}`} key={category.id}>
              <span className="start-category-icon"><CategoryIcon tone={category.tone} /></span>
              <h3>{category.label}</h3>
              <div
                aria-label={`${category.label}: ${category.points} of ${category.possiblePoints} START points`}
                aria-valuemax={category.possiblePoints}
                aria-valuemin={0}
                aria-valuenow={category.points}
                className="start-progress-track"
                role="progressbar"
                style={progressStyle}
              >
                <span />
              </div>
              <p><strong>{category.points}</strong> / {category.possiblePoints}</p>
            </article>
          );
        })}
      </div>
      <p className="start-score-caption">Aggregate progress from the START snapshot shared for this public report.</p>
    </section>
  );
}
