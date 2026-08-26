export type ProviderErrorCode =
  | 'PROVIDER_MISCONFIGURED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_UPSTREAM_DATA';

const publicMessages: Record<ProviderErrorCode, string> = {
  PROVIDER_MISCONFIGURED: 'The selected data source is not configured.',
  PROVIDER_UNAVAILABLE: 'The selected data source is temporarily unavailable.',
  INVALID_UPSTREAM_DATA: 'The selected data source returned data that could not be safely used.',
};

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly publicMessage: string;
  readonly status: number;

  constructor(code: ProviderErrorCode, options?: { cause?: unknown; detail?: string }) {
    super(options?.detail ?? publicMessages[code], { cause: options?.cause });
    this.name = 'ProviderError';
    this.code = code;
    this.publicMessage = publicMessages[code];
    this.status = code === 'INVALID_UPSTREAM_DATA' ? 502 : 503;
  }
}

export class PayloadValidationError extends ProviderError {
  readonly issues: string[];

  constructor(issues: string[]) {
    super('INVALID_UPSTREAM_DATA', { detail: `Invalid upstream payload: ${issues.join('; ')}` });
    this.name = 'PayloadValidationError';
    this.issues = issues;
  }
}

export function asProviderError(error: unknown): ProviderError {
  return error instanceof ProviderError
    ? error
    : new ProviderError('PROVIDER_UNAVAILABLE', { cause: error });
}
