// src/routes/api/verify-payment/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

interface VerifyPaymentRequest {
  sessionId?: string;
}

interface SessionMetadata {
  cvId?: string;
  userId?: string;
}

interface VerifyPaymentSuccess {
  valid: boolean;
  cvId: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export const POST: RequestHandler = async ({ request }): Promise<Response> => {
  try {
    const body: VerifyPaymentRequest = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      const errorResponse: ErrorResponse = {
        error: 'Session ID manquant ou invalide'
      };
      return json(errorResponse, { status: 400 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      const errorResponse: ErrorResponse = { error: 'Non autorise' };
      return json(errorResponse, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      const errorResponse: ErrorResponse = { error: 'Session invalide' };
      return json(errorResponse, { status: 401 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const amount =
      typeof session.amount_total === 'number' ? session.amount_total / 100 : null;
    const currency = session.currency ? session.currency.toUpperCase() : null;
    const paymentMethod = session.payment_method_types?.[0] ?? null;

    if (session.payment_status !== 'paid') {
      const errorResponse: ErrorResponse = {
        error: 'Paiement non valide',
        details: `Statut actuel: ${session.payment_status}`
      };
      return json(errorResponse, { status: 403 });
    }

    const metadata = session.metadata as SessionMetadata | null;
    const cvId = metadata?.cvId;
    const userId = metadata?.userId;

    if (!cvId || !userId) {
      const errorResponse: ErrorResponse = {
        error: 'Metadonnees manquantes dans la session Stripe'
      };
      return json(errorResponse, { status: 400 });
    }

    if (userId !== userData.user.id) {
      const errorResponse: ErrorResponse = {
        error: 'Utilisateur non autorise pour cette session'
      };
      return json(errorResponse, { status: 403 });
    }

    const { data: cvRow, error: cvError } = await supabaseAdmin
      .from('csv')
      .select('id')
      .eq('id', cvId)
      .eq('user_id', userId)
      .maybeSingle();

    if (cvError) {
      const errorResponse: ErrorResponse = { error: 'Erreur serveur CV' };
      return json(errorResponse, { status: 500 });
    }

    if (!cvRow) {
      const errorResponse: ErrorResponse = { error: 'CV introuvable' };
      return json(errorResponse, { status: 404 });
    }

    const { data: existingPayment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('cv_id', cvId)
      .eq('user_id', userId)
      .maybeSingle();

    if (paymentError) {
      const errorResponse: ErrorResponse = { error: 'Erreur serveur paiement' };
      return json(errorResponse, { status: 500 });
    }

    const nowIso = new Date().toISOString();

    if (existingPayment) {
      const { error: updateError } = await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          stripe_session_id: sessionId,
          amount,
          currency,
          payment_method: paymentMethod,
          updated_at: nowIso
        })
        .eq('id', existingPayment.id);

      if (updateError) {
        const errorResponse: ErrorResponse = { error: 'Erreur mise a jour paiement' };
        return json(errorResponse, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseAdmin.from('payments').insert([
        {
          user_id: userId,
          cv_id: cvId,
          status: 'completed',
          stripe_session_id: sessionId,
          amount,
          currency,
          payment_method: paymentMethod,
          updated_at: nowIso
        }
      ]);

      if (insertError) {
        const errorResponse: ErrorResponse = { error: 'Erreur creation paiement' };
        return json(errorResponse, { status: 500 });
      }
    }

    const successResponse: VerifyPaymentSuccess = {
      valid: true,
      cvId
    };

    return json(successResponse, { status: 200 });
  } catch (err: unknown) {
    console.error('Erreur verification paiement:', err);

    let errorMessage = 'Erreur serveur lors de la verification';
    let errorDetails: string | undefined;

    if (err instanceof Stripe.errors.StripeError) {
      errorMessage = 'Erreur lors de la communication avec Stripe';
      errorDetails = err.message;
    } else if (err instanceof Error) {
      errorDetails = err.message;
    }

    const errorResponse: ErrorResponse = {
      error: errorMessage,
      ...(errorDetails && { details: errorDetails })
    };

    return json(errorResponse, { status: 500 });
  }
};
