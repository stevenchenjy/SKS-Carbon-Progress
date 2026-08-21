import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('claim-safety guardrails', () => {
  it('does not contain unsupported real-school claim language', () => {
    const files = globSync(['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'], { exclude: ['**/*.test.*'] });
    const source = files.map((file) => readFileSync(file, 'utf8')).join('\n').toLowerCase();

    for (const unsupportedClaim of ['certified carbon neutral', 'verified school reduction', 'storm king reduced', 'actual campus emissions', 'real-time campus data']) {
      expect(source).not.toContain(unsupportedClaim);
    }
    expect(source).toContain('prototype data from simulated revert smart plug feed.');
    expect(source).toContain('no real storm king school');
    expect(source).toContain('no real school inventory');
  });
});
