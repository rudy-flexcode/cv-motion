import type { Handle } from '@sveltejs/kit';
import { PUBLIC_MAINTENANCE } from '$env/static/public';

const allowedPaths = [
  '/maintenance',
  '/mentions-legales',
  '/cgv',
  '/confidentialite',
  '/success',
  '/cancel'
];

const allowedApi = ['/api/stripe-webhook', '/api/verify-payment', '/secure-cv'];

export const handle: Handle = async ({ event, resolve }) => {
  if (PUBLIC_MAINTENANCE !== '1') {
    return resolve(event);
  }

  const path = event.url.pathname;

  if (path.startsWith('/_app') || path.startsWith('/favicon')) {
    return resolve(event);
  }

  if (allowedPaths.some((allowed) => path === allowed || path.startsWith(`${allowed}/`))) {
    return resolve(event);
  }

  if (allowedApi.some((allowed) => path.startsWith(allowed))) {
    return resolve(event);
  }

  if (path.startsWith('/api')) {
    return new Response(JSON.stringify({ error: 'Maintenance en cours' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return Response.redirect(new URL('/maintenance', event.url), 307);
};
