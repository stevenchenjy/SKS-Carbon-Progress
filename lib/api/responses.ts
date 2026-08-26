import { ProviderError } from '../providers/errors';

export type PublicApiErrorCode =
  | 'INVALID_REQUEST'
  | 'PROVIDER_MISCONFIGURED'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_UPSTREAM_DATA'
  | 'INTERNAL_ERROR';

const fallbackMessages: Record<Exclude<PublicApiErrorCode, 'INVALID_REQUEST'>, string> = {
  PROVIDER_MISCONFIGURED: 'The selected data source is not configured.',
  PROVIDER_UNAVAILABLE: 'The selected data source is temporarily unavailable.',
  INVALID_UPSTREAM_DATA: 'The selected data source returned data that could not be safely used.',
  INTERNAL_ERROR: 'The request could not be completed.',
};

export function apiErrorResponse(code: PublicApiErrorCode, status: number, message?: string): Response {
  const safeMessage = code === 'INVALID_REQUEST'
    ? (message ?? 'The request is invalid.')
    : fallbackMessages[code];
  return Response.json(
    { error: { code, message: safeMessage } },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function safeApiResponse<T>(
  operation: () => Promise<T>,
  options: { headers?: HeadersInit } = {},
): Promise<Response> {
  try {
    return Response.json(await operation(), { headers: options.headers });
  } catch (error) {
    if (error instanceof ProviderError) {
      return apiErrorResponse(error.code, error.status);
    }
    return apiErrorResponse('INTERNAL_ERROR', 500);
  }
}
