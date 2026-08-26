import 'server-only';
import type { CarbonProvider } from '@/lib/carbon/provider';
import { MockCarbonProvider } from '@/lib/carbon/providers/mockCarbonProvider';
import { CarbonInventoryProvider } from '@/lib/carbon/providers/carbonInventoryProvider';
import { getCarbonProviderSelection, requireHttpUrl } from '@/lib/providers/config';
import { HttpJsonSource } from '@/lib/providers/http-json-source';

export function getCarbonProvider(): CarbonProvider {
  const selected = getCarbonProviderSelection();
  if (selected === 'inventory') {
    return new CarbonInventoryProvider(new HttpJsonSource({ url: requireHttpUrl('CARBON_DATA_URL') }));
  }
  return new MockCarbonProvider();
}
