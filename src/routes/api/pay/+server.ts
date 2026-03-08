// src/routes/api/pay/+server.ts
import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export async function POST({ request, url }) {
  const { cvId } = await request.json();

  if (!cvId) {
    return json({ error: 'cvId manquant' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return json({ error: 'Non autorise' }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ error: 'Session invalide' }, { status: 401 });
  }

  const userId = userData.user.id;

  const { data: cvRow, error: cvError } = await supabaseAdmin
    .from('csv')
    .select('id')
    .eq('id', cvId)
    .eq('user_id', userId)
    .maybeSingle();

  if (cvError) {
    console.error('Erreur CV:', cvError);
    return json({ error: 'Erreur serveur CV' }, { status: 500 });
  }

  if (!cvRow) {
    return json({ error: 'CV introuvable' }, { status: 404 });
  }

  const { data: existingPayment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('status')
    .eq('cv_id', cvId)
    .eq('user_id', userId)
    .maybeSingle();

  if (paymentError) {
    console.error('Erreur paiement:', paymentError);
    return json({ error: 'Erreur serveur paiement' }, { status: 500 });
  }

  if (existingPayment?.status === 'completed') {
    return json({ alreadyPaid: true, cvId });
  }

  try {
    const origin = url.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: 249, // 2,49 EUR
            product_data: { name: 'Telechargement CV PDF' }
          },
          quantity: 1
        }
      ],
      payment_method_types: ['card'],
      metadata: { cvId, userId },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`
    });

    return json({
      url: session.url,
      id: session.id,
      sessionId: session.id
    });
  } catch (err: any) {
    console.error('Erreur Stripe:', err);
    return json({ error: err.message || 'Erreur Stripe inconnue' }, { status: 500 });
  }
}
