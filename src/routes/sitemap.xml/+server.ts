import type { RequestHandler } from '@sveltejs/kit';

const pages = ['/', '/cgv', '/confidentialite', '/mentions-legales'];

export const GET: RequestHandler = ({ url }) => {
  const origin = url.origin;
  const lastmod = new Date().toISOString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    pages
      .map((path) => {
        const loc = `${origin}${path}`;
        return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
      })
      .join('') +
    `</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400'
    }
  });
};
