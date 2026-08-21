export type DataQuality = 'measured' | 'estimated' | 'verified' | 'prototype' | 'pending';

export const dataQualityLabels: Record<DataQuality, string> = {
  measured: 'Measured',
  estimated: 'Estimated',
  verified: 'Verified',
  prototype: 'Prototype',
  pending: 'Pending',
};
