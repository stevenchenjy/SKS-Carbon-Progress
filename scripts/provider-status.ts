import { getProviderDiagnostics } from '../lib/providers/config.ts';
import { ProviderError } from '../lib/providers/errors.ts';

try {
  const diagnostics = getProviderDiagnostics();
  for (const item of diagnostics) {
    const readiness = item.ready ? 'ready' : 'not ready';
    const missing = item.missing.length > 0 ? ` Missing: ${item.missing.join(', ')}.` : '';
    const invalid = item.invalid.length > 0 ? ` Invalid: ${item.invalid.join(', ')}.` : '';
    console.log(`${item.domain}: ${item.selected} — ${readiness}. ${item.note}${missing}${invalid}`);
  }
} catch (error) {
  if (error instanceof ProviderError) {
    console.error(`Provider configuration is invalid: ${error.publicMessage}`);
    process.exitCode = 1;
  } else {
    console.error('Provider configuration could not be inspected.');
    process.exitCode = 1;
  }
}
