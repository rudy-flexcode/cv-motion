<svelte:head>
  <title>Paiement annule</title>
</svelte:head>

<div class="page">
  <div class="card">
    <div class="badge">Paiement annule</div>
    <h1>Pas de souci</h1>
    <p class="muted">
      Votre paiement a ete annule. Votre CV reste disponible et vous pouvez
      reessayer quand vous voulez.
    </p>

    <div class="actions">
      <a class="primary" href="/">Retour a l'accueil</a>
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

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primary {
    background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong));
    color: #f8fafc;
    text-decoration: none;
    padding: 12px 18px;
    border-radius: 12px;
    font-weight: 700;
    box-shadow: 0 12px 26px rgba(37, 99, 235, 0.35);
    border: 1px solid rgba(147, 197, 253, 0.35);
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
