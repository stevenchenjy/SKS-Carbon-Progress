import 'server-only';
import type { ProjectProvider } from '@/lib/projects/provider';
import { MockProjectProvider } from '@/lib/projects/providers/mockProjects';
import { StartSnapshotProvider } from '@/lib/projects/providers/startSnapshotProvider';
import { getProjectProviderSelection, requireHttpUrl } from '@/lib/providers/config';
import { HttpJsonSource } from '@/lib/providers/http-json-source';

export function getProjectProvider(): ProjectProvider {
  const selected = getProjectProviderSelection();
  if (selected === 'start-snapshot') {
    return new StartSnapshotProvider(new HttpJsonSource({ url: requireHttpUrl('START_PUBLIC_SNAPSHOT_URL') }));
  }
  return new MockProjectProvider();
}
