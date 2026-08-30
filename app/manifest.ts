import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Storm King Sustainability Field Report',
    short_name: 'SKS Field Report',
    description: 'Student sustainability work documented with clear status, source, method, and evidence boundaries.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f5',
    theme_color: '#164d3a',
    icons: [{ src: '/icon.png', sizes: '128x128', type: 'image/png' }],
  };
}
