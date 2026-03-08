// Exemple avec Stripe
async function downloadPDF(cv: any) {
  // 1. Vérifier si l'utilisateur a payé pour ce CV
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('cv_id', cv.id)
    .eq('status', 'completed')
    .single();
  
  if (!payment) {
    // 2. Rediriger vers le paiement
    await initiatePayment(cv.id);
    return;
  }
  
  // 3. Générer et télécharger le PDF
  await generatePDF(cv);
}