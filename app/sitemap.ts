import type { MetadataRoute } from 'next';

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sks-carbon-progress.stevenchenjy.chatgpt.site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteOrigin, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteOrigin}/start`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${siteOrigin}/projects`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteOrigin}/carbon`, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
