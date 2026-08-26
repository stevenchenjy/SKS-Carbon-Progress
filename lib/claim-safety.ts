import { dataQualityLabels, type DataQuality } from '@/lib/data-quality';
import type { FreshnessState, ProviderMetadata, ProviderSourceType, PublicationStatus } from '@/lib/provider-metadata';

export type PublicClaimTerm =
  | 'target'
  | 'modeled-pathway'
  | 'prototype'
  | 'measured'
  | 'estimated'
  | 'reported'
  | 'verified'
  | 'stale'
  | 'unavailable';

export interface PublicClaimDefinition {
  label: string;
  description: string;
  publicRule: string;
}

export const publicClaimVocabulary: Record<PublicClaimTerm, PublicClaimDefinition> = {
  target: {
    label: 'Target',
    description: 'A formally approved future outcome with a defined metric, boundary, and time period.',
    publicRule: 'Never present a target as a measured result or current achievement.',
  },
  'modeled-pathway': {
    label: 'Modeled pathway',
    description: 'A scenario showing one possible future trajectory rather than an observed result.',
    publicRule: 'Keep scenarios visually and verbally separate from inventory records.',
  },
  prototype: {
    label: 'Prototype',
    description: 'Synthetic content used only to design, test, and explain the platform.',
    publicRule: 'State that it is not a Storm King School result or achievement.',
  },
  measured: {
    label: 'Measured',
    description: 'Captured from an identified meter, bill, count, or other primary record.',
    publicRule: 'Name the source, coverage, unit, and observation period.',
  },
  estimated: {
    label: 'Estimated',
    description: 'Calculated from documented assumptions when direct activity data is incomplete or unavailable.',
    publicRule: 'Keep the estimation method and uncertainty visible.',
  },
  reported: {
    label: 'Reported',
    description: 'Approved for public reporting by the source owner; not automatically independently verified.',
    publicRule: 'Do not use verified language unless verification metadata also supports it.',
  },
  verified: {
    label: 'Verified',
    description: 'Reviewed against an identified external standard or assurance process with public evidence.',
    publicRule: 'Require a real, reported source and an evidence reference before making this claim.',
  },
  stale: {
    label: 'Stale',
    description: 'Valid source data whose observation time is older than the configured freshness threshold.',
    publicRule: 'Show the observation time and never replace it with invented current values.',
  },
  unavailable: {
    label: 'Unavailable',
    description: 'The selected source cannot currently supply safely usable data.',
    publicRule: 'Show an empty state and never fall back to synthetic values after real-source selection.',
  },
};

export function dataQualityDescription(quality: DataQuality): string {
  if (quality === 'pending') return 'Awaiting enough reviewed information for a public quality classification.';
  return publicClaimVocabulary[quality].description;
}

export function freshnessLabel(state: FreshnessState): string {
  const labels: Record<FreshnessState, string> = {
    live: 'Live',
    cached: 'Cached',
    stale: publicClaimVocabulary.stale.label,
    unavailable: publicClaimVocabulary.unavailable.label,
    'not-applicable': 'Not a live feed',
  };
  return labels[state];
}

export function publicationLabel(status: PublicationStatus): string {
  return status === 'prototype' ? 'Prototype' : status === 'draft' ? 'Draft' : publicClaimVocabulary.reported.label;
}

export function disclosureHeading(metadata?: ProviderMetadata): string {
  if (!metadata) return 'Prototype data only';
  if (metadata.availability === 'unavailable') return 'Data source unavailable';
  if (metadata.synthetic) return 'Prototype data only';
  if (metadata.publicationStatus === 'draft') return `Draft data · ${metadata.sourceLabel}`;
  return metadata.sourceLabel;
}

export function canClaimVerified(metadata: ProviderMetadata): boolean {
  return !metadata.synthetic
    && metadata.availability !== 'unavailable'
    && metadata.publicationStatus === 'reported'
    && metadata.status === 'verified'
    && metadata.verification?.state === 'verified'
    && metadata.verification.reference !== null;
}

export function qualityLabel(quality: DataQuality): string {
  return dataQualityLabels[quality];
}

export function sourceTypeLabel(sourceType: ProviderSourceType): string {
  const labels: Record<ProviderSourceType, string> = {
    synthetic: 'Synthetic fixture',
    inventory: 'Reviewed inventory',
    'vendor-feed': 'Vendor feed',
    'public-snapshot': 'Sanitized public snapshot',
    'configured-roadmap': 'Configured roadmap',
    unknown: 'Unknown source type',
  };
  return labels[sourceType];
}

export function verificationLabel(metadata: ProviderMetadata): string {
  if (metadata.synthetic) return 'Not applicable to synthetic data';
  if (metadata.verification?.state === 'verified') {
    return canClaimVerified(metadata) ? 'Verified · evidence supplied' : 'Verification evidence supplied';
  }
  if (metadata.verification?.state === 'pending') return 'Verification pending';
  if (metadata.verification?.state === 'not-verified') return 'Not independently verified';
  return 'Not applicable';
}
