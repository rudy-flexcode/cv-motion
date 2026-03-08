import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ url }) => {
  const origin = url.origin;
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /secure-cv',
    'Disallow: /success',
    'Disallow: /cancel',
    'Disallow: /maintenance',
    `Sitemap: ${origin}/sitemap.xml`
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400'
    }
  });
};
