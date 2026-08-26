import 'server-only';
import type { EnergyProvider } from '@/lib/energy/provider';
import { MockRevertProvider } from '@/lib/energy/providers/mockRevertProvider';
import { RevertProvider } from '@/lib/energy/providers/revertProvider';
import { MemoryRevertCache } from '@/lib/energy/revert-cache';
import { getEnergyProviderSelection, optionalPositiveInteger, requireHttpUrl, requireSecret } from '@/lib/providers/config';

const revertCache = new MemoryRevertCache();

export function getEnergyProvider(): EnergyProvider {
  const selected = getEnergyProviderSelection();
  if (selected === 'revert') {
    return new RevertProvider({
      apiUrl: requireHttpUrl('REVERT_API_URL'),
      apiKey: requireSecret('REVERT_API_KEY'),
      staleAfterMinutes: optionalPositiveInteger('REVERT_STALE_AFTER_MINUTES', 30),
      cacheTtlSeconds: optionalPositiveInteger('REVERT_CACHE_TTL_SECONDS', 60),
    }, undefined, undefined, revertCache);
  }
  return new MockRevertProvider();
}
