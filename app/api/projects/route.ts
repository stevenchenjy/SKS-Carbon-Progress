import { getProjectProvider } from '@/lib/projects/server';

export async function GET() {
  const provider = getProjectProvider();
  const [data, meta] = await Promise.all([provider.getPublicProjects(), provider.getMetadata()]);
  return Response.json({ data, meta });
}
