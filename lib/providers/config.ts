import { ProviderError } from './errors.ts';

export type CarbonProviderSelection = 'mock' | 'inventory';
export type EnergyProviderSelection = 'mock' | 'revert';
export type ProjectProviderSelection = 'mock' | 'start-snapshot';
export type RoadmapProviderSelection = 'mock' | 'config';
export type SiteContentProviderSelection = 'mock' | 'snapshot';

function selector<T extends string>(name: string, allowed: readonly T[], fallback: T, env: NodeJS.ProcessEnv): T {
  const value = env[name]?.trim() || fallback;
  if (!allowed.includes(value as T)) {
    throw new ProviderError('PROVIDER_MISCONFIGURED', { detail: `${name} has an unsupported value.` });
  }
  return value as T;
}

export const getCarbonProviderSelection = (env: NodeJS.ProcessEnv = process.env) => selector('CARBON_PROVIDER', ['mock', 'inventory'] as const, 'mock', env);
export const getEnergyProviderSelection = (env: NodeJS.ProcessEnv = process.env) => selector('ENERGY_PROVIDER', ['mock', 'revert'] as const, 'mock', env);
export const getProjectProviderSelection = (env: NodeJS.ProcessEnv = process.env) => selector('PROJECT_PROVIDER', ['mock', 'start-snapshot'] as const, 'mock', env);
export const getRoadmapProviderSelection = (env: NodeJS.ProcessEnv = process.env) => selector('ROADMAP_PROVIDER', ['mock', 'config'] as const, 'mock', env);
export const getSiteContentProviderSelection = (env: NodeJS.ProcessEnv = process.env) => selector('SITE_CONTENT_PROVIDER', ['mock', 'snapshot'] as const, 'mock', env);

export function getProviderSelections(env: NodeJS.ProcessEnv = process.env) {
  return {
    carbon: getCarbonProviderSelection(env),
    energy: getEnergyProviderSelection(env),
    projects: getProjectProviderSelection(env),
    roadmap: getRoadmapProviderSelection(env),
    siteContent: getSiteContentProviderSelection(env),
  };
}

export function requireHttpUrl(name: string, env: NodeJS.ProcessEnv = process.env): string {
  const value = env[name]?.trim();
  if (!value) throw new ProviderError('PROVIDER_MISCONFIGURED', { detail: `${name} is required.` });
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Unsupported protocol');
    return url.toString();
  } catch (error) {
    throw new ProviderError('PROVIDER_MISCONFIGURED', { cause: error, detail: `${name} must be an HTTP(S) URL.` });
  }
}

export function requireSecret(name: string, env: NodeJS.ProcessEnv = process.env): string {
  const value = env[name]?.trim();
  if (!value) throw new ProviderError('PROVIDER_MISCONFIGURED', { detail: `${name} is required.` });
  return value;
}

export function optionalPositiveInteger(name: string, fallback: number, env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new ProviderError('PROVIDER_MISCONFIGURED', { detail: `${name} must be a positive integer.` });
  }
  return value;
}

export interface ProviderDiagnostic {
  domain: 'carbon' | 'energy' | 'projects' | 'roadmap' | 'site-content';
  selected: string;
  ready: boolean;
  missing: string[];
  invalid: string[];
  note: string;
}

export function getProviderDiagnostics(env: NodeJS.ProcessEnv = process.env): ProviderDiagnostic[] {
  const selections = getProviderSelections(env);
  const missing = (names: string[]) => names.filter((name) => !env[name]?.trim());
  const invalidUrls = (names: string[]) => names.filter((name) => {
    if (!env[name]?.trim()) return false;
    try {
      requireHttpUrl(name, env);
      return false;
    } catch {
      return true;
    }
  });
  const invalidPositiveIntegers = (names: Array<{ name: string; fallback: number }>) => names.flatMap(({ name, fallback }) => {
    if (!env[name]?.trim()) return [];
    try {
      optionalPositiveInteger(name, fallback, env);
      return [];
    } catch {
      return [name];
    }
  });
  const carbonMissing = selections.carbon === 'inventory' ? missing(['CARBON_DATA_URL']) : [];
  const energyMissing = selections.energy === 'revert' ? missing(['REVERT_API_URL', 'REVERT_API_KEY']) : [];
  const projectMissing = selections.projects === 'start-snapshot' ? missing(['START_PUBLIC_SNAPSHOT_URL']) : [];
  const roadmapMissing = selections.roadmap === 'config' ? missing(['ROADMAP_DATA_URL']) : [];
  const siteContentMissing = selections.siteContent === 'snapshot' ? missing(['SITE_CONTENT_URL']) : [];
  const carbonInvalid = selections.carbon === 'inventory' ? invalidUrls(['CARBON_DATA_URL']) : [];
  const energyInvalid = selections.energy === 'revert'
    ? [
        ...invalidUrls(['REVERT_API_URL']),
        ...invalidPositiveIntegers([
          { name: 'REVERT_STALE_AFTER_MINUTES', fallback: 30 },
          { name: 'REVERT_CACHE_TTL_SECONDS', fallback: 60 },
        ]),
      ]
    : [];
  const projectInvalid = selections.projects === 'start-snapshot' ? invalidUrls(['START_PUBLIC_SNAPSHOT_URL']) : [];
  const roadmapInvalid = selections.roadmap === 'config' ? invalidUrls(['ROADMAP_DATA_URL']) : [];
  const siteContentInvalid = selections.siteContent === 'snapshot' ? invalidUrls(['SITE_CONTENT_URL']) : [];
  const diagnostics: ProviderDiagnostic[] = [
    { domain: 'carbon', selected: selections.carbon, ready: carbonMissing.length + carbonInvalid.length === 0, missing: carbonMissing, invalid: carbonInvalid, note: selections.carbon === 'mock' ? 'Synthetic provider active.' : 'Normalized inventory source selected.' },
    { domain: 'energy', selected: selections.energy, ready: false, missing: energyMissing, invalid: energyInvalid, note: selections.energy === 'mock' ? 'Synthetic provider active.' : 'Official Revert transport contract is still required.' },
    { domain: 'projects', selected: selections.projects, ready: projectMissing.length + projectInvalid.length === 0, missing: projectMissing, invalid: projectInvalid, note: selections.projects === 'mock' ? 'Synthetic provider active.' : 'Sanitized START snapshot selected.' },
    { domain: 'roadmap', selected: selections.roadmap, ready: roadmapMissing.length + roadmapInvalid.length === 0, missing: roadmapMissing, invalid: roadmapInvalid, note: selections.roadmap === 'mock' ? 'Synthetic roadmap provider active.' : 'Validated roadmap configuration selected.' },
    { domain: 'site-content', selected: selections.siteContent, ready: siteContentMissing.length + siteContentInvalid.length === 0, missing: siteContentMissing, invalid: siteContentInvalid, note: selections.siteContent === 'mock' ? 'Reviewed narrative with safe placeholders active.' : 'Validated spreadsheet snapshot selected.' },
  ];
  return diagnostics.map((item) => item.domain === 'energy' && selections.energy === 'mock' ? { ...item, ready: true } : item);
}
