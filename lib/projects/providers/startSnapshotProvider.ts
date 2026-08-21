import type { ProjectProvider } from '@/lib/projects/provider';
import type { PublicProject } from '@/lib/projects/types';
import type { ProviderMetadata } from '@/lib/provider-metadata';

export interface StartPublicSnapshot {
  publicProjects: Array<{
    id: string;
    title: string;
    category: PublicProject['category'];
    status: PublicProject['status'];
    summary: string;
    milestone: PublicProject['milestone'];
    impact: string;
    updatedAt: string;
    verified?: boolean;
  }>;
}

export class StartSnapshotProvider implements ProjectProvider {
  constructor(private readonly snapshot: StartPublicSnapshot) {}

  async getMetadata(): Promise<ProviderMetadata> {
    const verified = this.snapshot.publicProjects.length > 0 && this.snapshot.publicProjects.every((project) => project.verified);
    return {
      synthetic: false,
      status: verified ? 'verified' : 'measured',
      provider: 'start-public-snapshot',
      sourceLabel: 'START public project snapshot',
      disclosure: 'Public project fields supplied by an approved START snapshot.',
    };
  }

  async getPublicProjects(): Promise<PublicProject[]> {
    // Whitelist fields one by one: never spread an internal START record into a public response.
    return this.snapshot.publicProjects.map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category,
      status: project.status,
      summary: project.summary,
      milestone: structuredClone(project.milestone),
      impact: project.impact,
      updatedAt: project.updatedAt,
      quality: project.verified ? 'verified' : 'measured',
    }));
  }
}
