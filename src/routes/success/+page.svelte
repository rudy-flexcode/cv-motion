<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import { supabase } from '$lib/assets/supabase';

  let loading = false;
  let verifying = false;
  let errorMsg = '';
  let cvId: string | null = null;
  let autoDownloadTried = false;

  async function verifyPayment(): Promise<boolean> {
    verifying = true;
    errorMsg = '';

    const sessionId = get(page).url.searchParams.get('session_id');
    if (!sessionId) {
      errorMsg = 'Session Stripe manquante.';
      verifying = false;
      return false;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      errorMsg = 'Session utilisateur expiree. Merci de vous reconnecter.';
      verifying = false;
      return false;
    }

    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessionId })
    });

    const dataRes = await res.json();

    if (!res.ok) {
      errorMsg = dataRes.error || 'Erreur lors de la verification du paiement.';
      verifying = false;
      return false;
    }

    cvId = dataRes.cvId;
    verifying = false;
    return true;
  }

  async function downloadCV() {
    if (!cvId) return;
    loading = true;
    errorMsg = '';

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      errorMsg = 'Session utilisateur expiree. Merci de vous reconnecter.';
      loading = false;
      return;
    }

    try {
      const res = await fetch(`/secure-cv?cvId=${cvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erreur lors du telechargement du CV.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${cvId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      errorMsg = err.message || 'Erreur inconnue';
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const ok = await verifyPayment();
    if (ok && !autoDownloadTried) {
      autoDownloadTried = true;
      await downloadCV();
    }
  });
</script>

<svelte:head>
  <title>Paiement reussi | CV Motion</title>
  <meta
    name="description"
    content="Votre paiement est confirme. Le telechargement du CV peut demarrer."
  />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page">
  <div class="card">
    <div class="badge">Paiement confirme</div>
    <h1>Merci pour votre paiement</h1>
    <p class="muted">
      Votre CV est pret. Le telechargement peut demarrer automatiquement.
    </p>

    {#if verifying}
      <div class="status">Verification du paiement en cours...</div>
    {/if}

    {#if errorMsg}
      <div class="error">{errorMsg}</div>
    {/if}

    <div class="actions">
      <button on:click={downloadCV} disabled={loading || !cvId}>
        {loading ? 'Telechargement...' : 'Telecharger le CV'}
      </button>
      <a class="link" href="/">Retour a l'accueil</a>
    </div>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background:
      radial-gradient(1000px 500px at 10% -10%, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 60%),
      radial-gradient(900px 450px at 110% 20%, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0) 55%),
      linear-gradient(135deg, var(--brand-ink) 0%, var(--brand-ink-soft) 55%, var(--brand-ink) 100%);
  }

  .card {
    width: 100%;
    max-width: 520px;
    background: rgba(255, 255, 255, 0.96);
    border-radius: var(--radius-lg);
    padding: 36px;
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: var(--shadow-strong);
    position: relative;
    overflow: hidden;
  }

  .badge {
    display: inline-block;
    background: linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-soft) 100%);
    color: #1f2937;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 999px;
  }

  h1 {
    margin: 16px 0 10px;
    font-size: 2rem;
    color: var(--brand-ink);
  }

  .muted {
    color: var(--brand-muted);
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .status {
    padding: 12px 14px;
    background: rgba(248, 250, 252, 0.9);
    border-radius: 10px;
    color: var(--brand-ink);
    font-weight: 600;
    margin-bottom: 12px;
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .error {
    padding: 12px 14px;
    background: #fee2e2;
    border-radius: 10px;
    color: #991b1b;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  button {
    background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong));
    color: #f8fafc;
    border: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 12px 26px rgba(37, 99, 235, 0.35);
    border: 1px solid rgba(147, 197, 253, 0.35);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .link {
    color: var(--brand-ink);
    font-weight: 600;
    text-decoration: none;
    padding: 8px 4px;
  }

  .link:hover {
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    .card {
      padding: 28px;
    }

    h1 {
      font-size: 1.6rem;
    }
  }
</style>
