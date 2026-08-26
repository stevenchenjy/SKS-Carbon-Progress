import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
  });
}

describe('claim-safety guardrails', () => {
  it('does not contain unsupported real-school claim language', () => {
    const files = [...sourceFiles('app'), ...sourceFiles('lib')];
    const source = files.map((file) => readFileSync(file, 'utf8')).join('\n').toLowerCase();

    for (const unsupportedClaim of ['certified carbon neutral', 'verified school reduction', 'storm king reduced', 'actual campus emissions', 'real-time campus data']) {
      expect(source).not.toContain(unsupportedClaim);
    }
    expect(source).toContain('prototype data from simulated revert smart plug feed.');
    expect(source).toContain('not a storm king school result');
    expect(source).toContain('no real school inventory');
    expect(source).toContain('not total campus electricity');
    expect(source).not.toContain('path toward carbon neutrality');
  });
});
