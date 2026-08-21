import 'server-only';
import type { EnergyProvider } from '@/lib/energy/provider';
import { MockRevertProvider } from '@/lib/energy/providers/mockRevertProvider';

let provider: EnergyProvider | undefined;

export function getEnergyProvider(): EnergyProvider {
  provider ??= new MockRevertProvider();
  return provider;
}
