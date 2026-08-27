import type { DataQuality } from '@/lib/data-quality';

export type DataAvailability = 'available' | 'partial' | 'unavailable';

export type FreshnessState = 'live' | 'cached' | 'stale' | 'unavailable' | 'not-applicable';

export interface FreshnessMetadata {
  state: FreshnessState;
  observedAt: string | null;
  staleAfterMinutes: number | null;
}

export type CoverageKind =
  | 'campus-wide'
  | 'selected-devices'
  | 'selected-zones'
  | 'building'
  | 'inventory-boundary'
  | 'public-subset'
  | 'unknown'
  | 'not-applicable';

export interface CoverageMetadata {
  kind: CoverageKind;
  label: string;
  note: string;
  monitoredDeviceCount: number | null;
}

export interface ReportingPeriodMetadata {
  start: string;
  end: string;
  label: string;
}

export type PublicationStatus = 'prototype' | 'draft' | 'reported';

export type ProviderSourceType =
  | 'synthetic'
  | 'inventory'
  | 'vendor-feed'
  | 'public-snapshot'
  | 'spreadsheet-snapshot'
  | 'configured-roadmap'
  | 'unknown';

export type VerificationState = 'not-applicable' | 'not-verified' | 'pending' | 'verified';

export interface VerificationMetadata {
  state: VerificationState;
  reference: string | null;
  note: string | null;
}

export interface ProviderMetadata {
  synthetic: boolean;
  status: DataQuality;
  provider: string;
  sourceLabel: string;
  disclosure: string;
  availability: DataAvailability;
  publicationStatus: PublicationStatus;
  freshness: FreshnessMetadata;
  coverage: CoverageMetadata;
  reportingPeriod: ReportingPeriodMetadata | null;
  sourceType?: ProviderSourceType;
  verification?: VerificationMetadata;
  methodologyNote?: string | null;
}

export function unavailableMetadata(domainLabel: string, disclosure: string): ProviderMetadata {
  return {
    synthetic: false,
    status: 'pending',
    provider: 'unavailable',
    sourceLabel: `${domainLabel} unavailable`,
    disclosure,
    availability: 'unavailable',
    publicationStatus: 'draft',
    freshness: { state: 'unavailable', observedAt: null, staleAfterMinutes: null },
    coverage: {
      kind: 'unknown',
      label: 'Coverage unavailable',
      note: 'No coverage claim is made while this source is unavailable.',
      monitoredDeviceCount: null,
    },
    reportingPeriod: null,
    sourceType: 'unknown',
    verification: { state: 'not-applicable', reference: null, note: null },
    methodologyNote: null,
  };
}
