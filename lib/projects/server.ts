import 'server-only';
import type { ProjectProvider } from '@/lib/projects/provider';
import { MockProjectProvider } from '@/lib/projects/providers/mockProjects';

let provider: ProjectProvider | undefined;

export function getProjectProvider(): ProjectProvider {
  provider ??= new MockProjectProvider();
  return provider;
}
