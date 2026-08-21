import { describe, expect, it } from 'vitest';
import { GET as getCarbonOverview } from '@/app/api/carbon/overview/route';
import { GET as getCarbonHistory } from '@/app/api/carbon/history/route';
import { GET as getEnergyLive } from '@/app/api/energy/live/route';
import { GET as getEnergyHistory } from '@/app/api/energy/history/route';
import { GET as getProjects } from '@/app/api/projects/route';
import { GET as getRoadmap } from '@/app/api/roadmap/route';

describe('prototype API routes', () => {
  it('labels every successful response as synthetic prototype data', async () => {
    const responses = await Promise.all([
      getCarbonOverview(),
      getCarbonHistory(),
      getEnergyLive(),
      getEnergyHistory(new Request('https://example.test/api/energy/history?range=24h')),
      getProjects(),
      getRoadmap(),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(200);
      const body = await response.json() as { meta: { synthetic: boolean; status: string } };
      expect(body.meta.synthetic).toBe(true);
      expect(body.meta.status).toBe('prototype');
    }
  });

  it('returns seven days when requested and rejects unsupported ranges', async () => {
    const valid = await getEnergyHistory(new Request('https://example.test/api/energy/history?range=7d'));
    const validBody = await valid.json() as { data: unknown[]; meta: { range: string; disclosure: string } };
    expect(validBody.data).toHaveLength(7);
    expect(validBody.meta.range).toBe('7d');
    expect(validBody.meta.disclosure).toBe('Prototype data from simulated Revert Smart Plug feed.');
    expect(valid.headers.get('Cache-Control')).toBe('no-store');

    const invalid = await getEnergyHistory(new Request('https://example.test/api/energy/history?range=year'));
    expect(invalid.status).toBe(400);
  });
});
