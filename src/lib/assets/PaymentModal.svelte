<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/assets/supabase';

  export let cv;

  const dispatch = createEventDispatcher<{ close: void }>();
  let acceptTerms = false;
  let acceptWithdrawal = false;
  let isSubmitting = false;
  let errorMsg = '';
  let sessionToken = '';
  let ready = false;

  async function downloadProtectedCv(cvId: string) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert('Veuillez vous reconnecter pour telecharger.');
      return;
    }

    const res = await fetch(`/secure-cv?cvId=${cvId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Erreur lors du telechargement du CV');
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
  }

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert('Veuillez vous connecter pour continuer.');
      dispatch('close');
      return;
    }
    sessionToken = token;
    ready = true;
  });

  async function startPayment() {
    if (!acceptTerms || !acceptWithdrawal) {
      errorMsg = 'Veuillez accepter les CGV et la renonciation au droit de retraction.';
      return;
    }

    if (!ready || isSubmitting) return;
    errorMsg = '';
    isSubmitting = true;

    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({ cvId: cv.id })
    });

    const dataRes = await res.json();

    if (!res.ok) {
      console.error('Erreur API /api/pay:', dataRes);
      alert(dataRes.error || 'Erreur lors de la creation du paiement Stripe');
      dispatch('close');
      return;
    }

    if (dataRes.alreadyPaid) {
      try {
        await downloadProtectedCv(cv.id);
      } catch (err: any) {
        alert(err.message || 'Erreur lors du telechargement');
      } finally {
        isSubmitting = false;
        dispatch('close');
      }
      return;
    }

    if (!dataRes.url) {
      alert('URL Stripe manquante');
      dispatch('close');
      return;
    }

    window.location.href = dataRes.url;
  }
</script>

<div class="modal-backdrop">
  <div class="modal-shell">
    <div class="modal-content">
      <div class="brand-row">
        <div class="brand-dot"></div>
        <span class="brand">CV Premium</span>
        <span class="badge">Paiement securise</span>
      </div>

      <div class="hero">
        <div class="spinner" aria-hidden="true"></div>
        <p class="title">Finaliser votre CV</p>
        <p class="sub">Paiement unique pour debloquer le PDF HD.</p>
      </div>

      <div class="trust">
        <div class="trust-card">
          <div class="trust-head">
            <div class="shield-dot"></div>
            <span class="trust-label">Paiement</span>
          </div>
          <div class="trust-value">Stripe securise</div>
          <div class="trust-sub">Carte bancaire protegee</div>
        </div>

        <div class="trust-card">
          <div class="trust-head">
            <div class="bolt-dot"></div>
            <span class="trust-label">Livraison</span>
          </div>
          <div class="trust-value">PDF immediat</div>
          <div class="trust-sub">Acces instantane apres paiement</div>
        </div>
      </div>

      <div class="consent">
        <label class="check">
          <input type="checkbox" bind:checked={acceptTerms} />
          <span>
            J'accepte les <a href="/cgv" target="_blank" rel="noreferrer">CGV</a> et la
            <a href="/confidentialite" target="_blank" rel="noreferrer">politique de confidentialite</a>.
          </span>
        </label>
        <label class="check">
          <input type="checkbox" bind:checked={acceptWithdrawal} />
          <span>
            Je demande la fourniture immediate du contenu numerique et renonce a mon droit de retraction.
          </span>
        </label>
        {#if errorMsg}
          <div class="consent-error">{errorMsg}</div>
        {/if}
        <button class="cta" on:click={startPayment} disabled={!acceptTerms || !acceptWithdrawal || isSubmitting}>
          {isSubmitting ? 'Redirection...' : 'Continuer vers Stripe'}
        </button>
      </div>

      <p class="footnote">
        Vous pourrez telecharger le CV immediatement apres validation.
      </p>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(1200px circle at 15% 10%, rgba(37, 99, 235, 0.4), transparent 58%),
      radial-gradient(900px circle at 90% 20%, rgba(14, 165, 233, 0.3), transparent 60%),
      rgba(6, 10, 22, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
  }

  .modal-shell {
    position: relative;
    padding: 2px;
    border-radius: 26px;
    background: linear-gradient(140deg, rgba(226, 232, 240, 0.6), rgba(59, 130, 246, 0.7), rgba(212, 175, 55, 0.7));
    box-shadow: 0 24px 70px rgba(2, 6, 23, 0.6), inset 0 0 18px rgba(255, 255, 255, 0.1);
  }

  .modal-shell::before {
    content: '';
    position: absolute;
    inset: -32px;
    border-radius: 40px;
    background: radial-gradient(600px circle at 20% 20%, rgba(59, 130, 246, 0.35), transparent 60%);
    filter: blur(18px);
    z-index: -1;
  }

  .modal-content {
    background: linear-gradient(180deg, rgba(12, 26, 58, 0.96), rgba(6, 12, 30, 0.98));
    border-radius: 24px;
    padding: 24px 24px 20px;
    width: 86vw;
    max-width: 480px;
    color: #e2e8f0;
    text-align: left;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #cbd5f5;
  }

  .brand {
    font-weight: 700;
    font-family: "Fraunces", "Times New Roman", serif;
    font-size: 0.9rem;
  }

  .brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 6px;
    background: transparent;
    border: 1px solid rgba(212, 175, 55, 0.6);
    box-shadow:
      0 4px 10px rgba(15, 23, 42, 0.35),
      inset 0 0 8px rgba(255, 255, 255, 0.12);
  }

  .badge {
    margin-left: auto;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(30, 64, 175, 0.45);
    border: 1px solid rgba(147, 197, 253, 0.35);
    color: #e0f2fe;
    font-weight: 600;
    letter-spacing: 0.08em;
    font-size: 0.68rem;
  }

  .hero {
    text-align: center;
    padding: 6px 0 4px;
  }

  .title {
    margin: 12px 0 6px;
    font-size: 1.3rem;
    color: #f8fafc;
    font-weight: 700;
    font-family: "Fraunces", "Times New Roman", serif;
  }

  .sub {
    margin: 0;
    font-size: 0.92rem;
    color: #cbd5f5;
    font-weight: 500;
  }

  .spinner {
    width: 54px;
    height: 54px;
    margin: 0 auto;
    border-radius: 50%;
    background: conic-gradient(from 90deg, #f8fafc, #93c5fd, #1d4ed8, #d4af37, #f8fafc);
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px));
    mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px));
    animation: spin 1s linear infinite;
    box-shadow: 0 8px 20px rgba(30, 64, 175, 0.45);
  }

  .trust {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .trust-card {
    background: rgba(15, 23, 42, 0.65);
    border-radius: 16px;
    padding: 12px;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: inset 0 0 24px rgba(15, 23, 42, 0.4);
  }

  .trust-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .trust-label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9fb3d8;
    font-weight: 600;
  }

  .shield-dot {
    width: 16px;
    height: 16px;
    border-radius: 6px;
    background: linear-gradient(135deg, #38bdf8, #1d4ed8);
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
  }

  .bolt-dot {
    width: 16px;
    height: 16px;
    border-radius: 6px;
    background: linear-gradient(135deg, #f8e09a, #fbbf24);
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.35);
  }

  .trust-value {
    font-size: 0.95rem;
    color: #f8fafc;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .trust-sub {
    font-size: 0.8rem;
    color: #b6c5e3;
  }

  .footnote {
    margin: 16px 0 0;
    font-size: 0.78rem;
    color: #9fb3d8;
    text-align: center;
  }

  .consent {
    margin-top: 18px;
    display: grid;
    gap: 10px;
    background: rgba(15, 23, 42, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 16px;
    padding: 14px;
  }

  .check {
    display: grid;
    grid-template-columns: 16px 1fr;
    gap: 10px;
    align-items: start;
    font-size: 0.82rem;
    color: #dbeafe;
  }

  .check input {
    margin-top: 2px;
    accent-color: var(--brand-gold);
  }

  .check a {
    color: #f8e09a;
    text-decoration: none;
    font-weight: 600;
  }

  .check a:hover {
    text-decoration: underline;
  }

  .consent-error {
    font-size: 0.8rem;
    color: #fca5a5;
  }

  .cta {
    margin-top: 4px;
    width: 100%;
    padding: 10px 16px;
    border-radius: 999px;
    border: 1px solid rgba(212, 175, 55, 0.5);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(212, 175, 55, 0.35));
    color: #f8fafc;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cta:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.4);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 540px) {
    .modal-content {
      padding: 22px 18px 18px;
    }

    .trust {
      grid-template-columns: 1fr;
    }

    .brand-row {
      flex-wrap: wrap;
    }

    .badge {
      margin-left: 0;
    }
  }
</style>
