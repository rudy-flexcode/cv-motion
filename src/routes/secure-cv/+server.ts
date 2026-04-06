import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { generateCvPdf, type CvData } from '$lib/server/pdf';

const CV_BUCKET = 'cv-pdfs';
export const config = { runtime: 'nodejs20.x' };

export const GET: RequestHandler = async ({ url, request }) => {
  const cvId = url.searchParams.get('cvId');
  if (!cvId) throw error(400, 'cvId manquant');
  const refresh = url.searchParams.get('refresh') === '1';

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw error(401, 'Non autorise');

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) throw error(401, 'Session invalide');

  const userId = userData.user.id;

  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('status')
    .eq('cv_id', cvId)
    .eq('user_id', userId)
    .maybeSingle();

  if (paymentError) throw error(500, 'Erreur paiement');
  if (!payment || payment.status !== 'completed') throw error(403, 'Paiement requis');

  const filePath = `${userId}/${cvId}.pdf`;
  if (!refresh) {
    const { data: existingFile, error: existingError } = await supabaseAdmin.storage
      .from(CV_BUCKET)
      .download(filePath);

    if (existingFile && !existingError) {
      const arrayBuffer = await existingFile.arrayBuffer();
      return new Response(arrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="CV_${cvId}.pdf"`,
          'Cache-Control': 'private, max-age=0, no-store'
        }
      });
    }
  }

  const { data: cvRow, error: cvError } = await supabaseAdmin
    .from('csv')
    .select('data')
    .eq('id', cvId)
    .eq('user_id', userId)
    .maybeSingle();

  if (cvError) throw error(500, 'Erreur CV');
  if (!cvRow) throw error(404, 'CV introuvable');

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateCvPdf(cvRow.data as CvData);
  } catch (err) {
    console.error('Erreur generation PDF:', err);
    throw error(500, 'Erreur generation PDF');
  }
  const { error: uploadError } = await supabaseAdmin.storage
    .from(CV_BUCKET)
    .upload(filePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error('Erreur upload PDF:', uploadError);
    throw error(500, 'Erreur stockage PDF');
  }

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="CV_${cvId}.pdf"`,
      'Cache-Control': 'private, max-age=0, no-store'
    }
  });
};
