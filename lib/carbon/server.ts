import 'server-only';
import type { CarbonProvider } from '@/lib/carbon/provider';
import { MockCarbonProvider } from '@/lib/carbon/providers/mockCarbonProvider';

let provider: CarbonProvider | undefined;

export function getCarbonProvider(): CarbonProvider {
  provider ??= new MockCarbonProvider();
  return provider;
}
