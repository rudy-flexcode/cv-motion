<svelte:head>
  <title>Mentions legales | CV Motion</title>
  <meta name="description" content="Informations legales et editeur du site CV Motion." />
</svelte:head>

<main class="legal-page">
  <div class="legal-card">
    <header class="legal-hero">
      <p class="legal-eyebrow">Informations legales</p>
      <h1>Mentions legales</h1>
      <p class="legal-updated">Derniere mise a jour : 22 fevrier 2026</p>
    </header>

    <section class="legal-section">
      <h2>Editeur</h2>
      <p>Nom et prenom : Robert Rudy (entrepreneur individuel).</p>
      <p>Nom commercial : Kreol tech.</p>
      <p>Adresse : 11 A Impasse Georges Sand, Manapany les Bains, 97480 Saint-Joseph, France.</p>
      <p>Email : code.appisland@gmail.com.</p>
      <p>Telephone : 06 93 61 31 64.</p>
      <p>SIREN : 792 680 894.</p>
      <p>SIRET (etablissement principal) : 79268089400039.</p>
      <p>Code APE : 6201Z - Programmation informatique.</p>
      <p>Date d'immatriculation au RNE : 12/02/2026.</p>
      <p>Debut d'activite : 01/03/2026.</p>
      <p>TVA : TVA non applicable, art. 293 B du CGI.</p>
      <p>Nature de l'activite principale : Liberale non reglementee.</p>
      <p>
        Activite principale : Developpement de sites web, applications web et web mobile. Conception,
        realisation et maintenance de solutions logicielles et SaaS. Creation de maquettes et interfaces web.
      </p>
    </section>

    <section class="legal-section">
      <h2>Directeur de publication</h2>
      <p>Robert Rudy.</p>
    </section>

    <section class="legal-section">
      <h2>Hebergeur</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
      <p>Contact : privacy@vercel.com.</p>
    </section>

    <section class="legal-section">
      <h2>Propriete intellectuelle</h2>
      <p>
        L'ensemble des contenus (textes, design, logos, elements graphiques, code) est protege par
        le droit de la propriete intellectuelle. Toute reproduction ou utilisation non autorisee est
        interdite.
      </p>
    </section>
  </div>
</main>

<style>
  .legal-page {
    min-height: 100vh;
    padding: 48px 20px 80px;
    display: flex;
    justify-content: center;
  }

  .legal-card {
    width: 100%;
    max-width: 920px;
    background: rgba(255, 255, 255, 0.96);
    border-radius: var(--radius-lg);
    padding: 32px 36px;
    border: 1px solid var(--brand-border);
    box-shadow: var(--shadow-soft);
  }

  .legal-hero {
    margin-bottom: 22px;
  }

  .legal-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.7rem;
    color: var(--brand-accent);
    margin: 0 0 8px;
    font-weight: 600;
  }

  .legal-updated {
    margin: 6px 0 0;
    color: var(--brand-muted);
    font-size: 0.9rem;
  }

  .legal-note {
    background: rgba(37, 99, 235, 0.08);
    border: 1px solid rgba(37, 99, 235, 0.2);
    color: #1e3a8a;
    padding: 12px 14px;
    border-radius: 12px;
    margin-bottom: 18px;
    font-size: 0.92rem;
  }

  .legal-section {
    margin-top: 22px;
  }

  .legal-section h2 {
    margin: 0 0 8px;
    font-size: 1.2rem;
    color: var(--brand-ink);
  }

  .legal-section p {
    margin: 6px 0;
    color: var(--brand-ink-muted);
    line-height: 1.55;
  }

  .placeholder {
    color: #b45309;
    font-weight: 700;
  }
</style>
