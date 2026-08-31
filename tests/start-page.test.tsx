import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StartPage from '@/app/start/page';
import { startCategories, startSnapshot } from '@/app/components/StartProgressOverview';

describe('START public page', () => {
  it('renders the public Green Schools Alliance context and anonymized aggregate snapshot', () => {
    render(<StartPage />);

    expect(screen.getByRole('heading', { name: /START at Storm King/i })).toBeInTheDocument();
    expect(screen.getByText(/worldwide peer-to-peer network/i)).toBeInTheDocument();
    expect(screen.getByText(startSnapshot.rating)).toBeInTheDocument();
    expect(screen.getByText(/point-in-time summary of progress/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About START/i })).toHaveAttribute('href', 'https://www.greenschoolsalliance.org/about-start');
    expect(screen.getByRole('link', { name: /Explore student projects/i })).toHaveAttribute('href', '/projects');
  });

  it('keeps every displayed category tied to its public aggregate values', () => {
    render(<StartPage />);

    for (const category of startCategories) {
      const progress = screen.getByRole('progressbar', { name: new RegExp(category.label, 'i') });
      expect(progress).toHaveAttribute('aria-valuenow', String(category.points));
      expect(progress).toHaveAttribute('aria-valuemax', String(category.possiblePoints));
    }
  });
});
