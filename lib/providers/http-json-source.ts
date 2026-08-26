import { ProviderError } from './errors';

export interface JsonSource {
  load(): Promise<unknown>;
}

export interface HttpJsonSourceOptions {
  url: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export class HttpJsonSource implements JsonSource {
  private readonly fetcher: typeof fetch;
  private readonly timeoutMs: number;

  constructor(private readonly options: HttpJsonSourceOptions) {
    this.fetcher = options.fetcher ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 10_000;
  }

  async load(): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetcher(this.options.url, {
        headers: { Accept: 'application/json', ...this.options.headers },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) throw new ProviderError('PROVIDER_UNAVAILABLE');
      try {
        return await response.json();
      } catch (error) {
        throw new ProviderError('INVALID_UPSTREAM_DATA', { cause: error });
      }
    } catch (error) {
      if (error instanceof ProviderError) throw error;
      throw new ProviderError('PROVIDER_UNAVAILABLE', { cause: error });
    } finally {
      clearTimeout(timeout);
    }
  }
}
