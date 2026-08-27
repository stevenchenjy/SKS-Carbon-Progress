import 'server-only';
import { requireHttpUrl, getSiteContentProviderSelection } from '@/lib/providers/config';
import { HttpJsonSource } from '@/lib/providers/http-json-source';
import type { SiteContentProvider } from '@/lib/site-content/provider';
import { MockSiteContentProvider } from '@/lib/site-content/providers/mockSiteContentProvider';
import { SnapshotSiteContentProvider } from '@/lib/site-content/providers/snapshotSiteContentProvider';

export function getSiteContentProvider(): SiteContentProvider {
  const selected = getSiteContentProviderSelection();
  if (selected === 'snapshot') {
    return new SnapshotSiteContentProvider(new HttpJsonSource({ url: requireHttpUrl('SITE_CONTENT_URL') }));
  }
  return new MockSiteContentProvider();
}
