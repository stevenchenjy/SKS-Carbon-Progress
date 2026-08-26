import { getProjectProvider } from '@/lib/projects/server';
import { safeApiResponse } from '@/lib/api/responses';
import type { ProjectProvider } from '@/lib/projects/provider';

export async function projectsResponse(providerFactory: () => ProjectProvider = getProjectProvider) {
  return safeApiResponse(async () => {
    const provider = providerFactory();
    const [data, meta] = await Promise.all([provider.getPublicProjects(), provider.getMetadata()]);
    return { data, meta };
  });
}

export async function GET() {
  return projectsResponse();
}
