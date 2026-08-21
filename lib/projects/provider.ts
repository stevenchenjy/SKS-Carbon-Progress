import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export interface ProjectProvider {
  getMetadata(): Promise<ProviderMetadata>;
  getPublicProjects(): Promise<PublicProject[]>;
}
