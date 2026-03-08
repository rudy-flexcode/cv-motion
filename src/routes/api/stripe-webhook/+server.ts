import Stripe from 'stripe';
import type { RequestHandler } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export const POST: RequestHandler = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET manquant');
    return new Response('Webhook secret missing', { status: 500 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur signature webhook Stripe:', err);
    return new Response('Webhook signature error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const cvId = session.metadata?.cvId;
    const userId = session.metadata?.userId;

    if (!cvId || !userId) {
      console.error('Metadata manquante dans la session Stripe', session.id);
      return new Response('Missing metadata', { status: 400 });
    }

    const amount =
      typeof session.amount_total === 'number' ? session.amount_total / 100 : null;
    const currency = session.currency ? session.currency.toUpperCase() : null;
    const paymentMethod = session.payment_method_types?.[0] ?? null;

    const nowIso = new Date().toISOString();
    const { error: upsertError } = await supabaseAdmin.from('payments').upsert(
      {
        user_id: userId,
        cv_id: cvId,
        status: 'completed',
        stripe_session_id: session.id,
        amount,
        currency,
        payment_method: paymentMethod,
        updated_at: nowIso
      },
      { onConflict: 'user_id,cv_id' }
    );

    if (upsertError) {
      console.error('Erreur upsert paiement:', upsertError);
      return new Response('Database error', { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
