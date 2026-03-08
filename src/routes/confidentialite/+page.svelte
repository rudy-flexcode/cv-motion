<svelte:head>
  <title>Politique de confidentialite | CV Motion</title>
  <meta
    name="description"
    content="Politique de confidentialite et traitement des donnees personnelles de CV Motion."
  />
</svelte:head>

<main class="legal-page">
  <div class="legal-card">
    <header class="legal-hero">
      <p class="legal-eyebrow">Donnees personnelles</p>
      <h1>Politique de confidentialite</h1>
      <p class="legal-updated">Derniere mise a jour : 22 fevrier 2026</p>
    </header>

    <section class="legal-section">
      <h2>1. Responsable du traitement</h2>
      <p>Robert Rudy (entrepreneur individuel - Kreol tech).</p>
      <p>Email : code.appisland@gmail.com.</p>
    </section>

    <section class="legal-section">
      <h2>2. Donnees collectees</h2>
      <p>
        Donnees de compte : email, mot de passe (chiffre et gere par l'outil
        d'authentification), informations de profil.
      </p>
      <p>Donnees du CV : nom, prenom, experiences, competences, etc.</p>
      <p>Donnees de paiement : traitees par Stripe (nous ne stockons pas la carte).</p>
    </section>

    <section class="legal-section">
      <h2>3. Finalites et bases legales</h2>
      <p>Creation de compte et execution du service (base : execution du contrat).</p>
      <p>Gestion des paiements et obligations comptables (base : obligation legale).</p>
      <p>Support client (base : interet legitime).</p>
      <p>Emails commerciaux (base : consentement, si applicable).</p>
    </section>

    <section class="legal-section">
      <h2>4. Destinataires</h2>
      <p>
        Vos donnees peuvent etre traitees par nos prestataires : Stripe (paiement),
        Supabase (base de donnees/authentification) et Vercel (hebergement).
      </p>
    </section>

    <section class="legal-section">
      <h2>5. Duree de conservation</h2>
      <p>
        Les donnees sont conservees le temps necessaire aux finalites indiquees et aux
        obligations legales. Le client peut demander la suppression de son compte.
      </p>
    </section>

    <section class="legal-section">
      <h2>6. Securite</h2>
      <p>
        Des mesures techniques et organisationnelles sont mises en place pour proteger les
        donnees personnelles (chiffrement, controle d'acces).
      </p>
    </section>

    <section class="legal-section">
      <h2>7. Vos droits</h2>
      <p>
        Vous disposez d'un droit d'acces, de rectification, d'effacement, de limitation,
        d'opposition et de portabilite. Vous pouvez egalement retirer votre consentement a
        tout moment.
      </p>
      <p>Pour exercer vos droits : code.appisland@gmail.com.</p>
    </section>

    <section class="legal-section">
      <h2>8. Cookies</h2>
      <p>
        Le site utilise des cookies techniques necessaires au fonctionnement (authentification,
        session). Si des cookies de mesure d'audience sont ajoutes, un consentement
        specifique sera demande.
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
