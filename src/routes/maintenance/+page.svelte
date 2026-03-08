<svelte:head>
  <title>Maintenance en cours</title>
</svelte:head>

<main class="page">
  <div class="card">
    <p class="eyebrow">Maintenance</p>
    <h1>Nous finalisons la mise en ligne</h1>
    <p class="lead">
      Le service est temporairement indisponible le temps de terminer les derniers reglages.
      Revenez dans quelques minutes.
    </p>
    <div class="info">
      <div>
        <span class="label">Statut</span>
        <span class="value">En cours</span>
      </div>
      <div>
        <span class="label">Contact</span>
        <span class="value">code.appisland@gmail.com</span>
      </div>
    </div>
    <a class="link" href="/mentions-legales">Mentions legales</a>
  </div>
</main>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
    background:
      radial-gradient(900px 420px at 10% -10%, rgba(37, 99, 235, 0.2), transparent 60%),
      radial-gradient(900px 420px at 110% 10%, rgba(14, 165, 233, 0.18), transparent 60%),
      #f6f8ff;
  }

  .card {
    width: 100%;
    max-width: 560px;
    background: rgba(255, 255, 255, 0.96);
    border-radius: var(--radius-lg);
    padding: 32px 34px;
    border: 1px solid var(--brand-border);
    box-shadow: var(--shadow-soft);
  }

  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-size: 0.7rem;
    color: var(--brand-accent);
    margin: 0 0 10px;
    font-weight: 700;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 2rem;
    color: var(--brand-ink);
  }

  .lead {
    margin: 0 0 22px;
    color: var(--brand-muted);
    line-height: 1.6;
  }

  .info {
    display: grid;
    gap: 12px;
    margin-bottom: 18px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(248, 250, 252, 0.9);
    border: 1px solid var(--brand-border);
  }

  .label {
    display: block;
    text-transform: uppercase;
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    color: rgba(91, 107, 128, 0.7);
    font-weight: 600;
  }

  .value {
    display: block;
    font-size: 0.95rem;
    color: var(--brand-ink);
    font-weight: 600;
    margin-top: 4px;
  }

  .link {
    color: var(--brand-accent);
    text-decoration: none;
    font-weight: 600;
  }

  .link:hover {
    text-decoration: underline;
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 1.6rem;
    }

    .card {
      padding: 26px;
    }
  }
</style>
