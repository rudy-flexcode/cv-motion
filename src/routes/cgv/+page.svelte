<svelte:head>
  <title>Conditions generales de vente</title>
</svelte:head>

<main class="legal-page">
  <div class="legal-card">
    <header class="legal-hero">
      <p class="legal-eyebrow">Conditions</p>
      <h1>Conditions generales de vente</h1>
      <p class="legal-updated">Derniere mise a jour : 22 fevrier 2026</p>
    </header>

    <section class="legal-section">
      <h2>1. Objet</h2>
      <p>
        Les presentes conditions definissent les modalites de vente du service de creation et de
        telechargement d'un CV au format PDF via le site.
      </p>
    </section>

    <section class="legal-section">
      <h2>2. Identite du vendeur</h2>
      <p>Nom et prenom : Robert Rudy (entrepreneur individuel).</p>
      <p>Nom commercial : Kreol tech.</p>
      <p>Adresse : 11 A Impasse Georges Sand, Manapany les Bains, 97480 Saint-Joseph, France.</p>
      <p>Email : code.appisland@gmail.com.</p>
      <p>SIREN : 792 680 894.</p>
      <p>SIRET (etablissement principal) : 79268089400039.</p>
      <p>Code APE : 6201Z - Programmation informatique.</p>
      <p>Date d'immatriculation au RNE : 12/02/2026.</p>
    </section>

    <section class="legal-section">
      <h2>3. Prix</h2>
      <p>Le prix est indique en euros, toutes taxes comprises, sur la page de paiement.</p>
      <p>TVA : TVA non applicable, art. 293 B du CGI.</p>
    </section>

    <section class="legal-section">
      <h2>4. Paiement</h2>
      <p>
        Le paiement est traite par Stripe. Les donnees bancaires ne sont pas stockees sur le site.
      </p>
    </section>

    <section class="legal-section">
      <h2>5. Livraison du contenu numerique</h2>
      <p>
        Le CV au format PDF est fourni immediatement apres la validation du paiement, via un lien
        de telechargement.
      </p>
    </section>

    <section class="legal-section">
      <h2>6. Droit de retraction et absence de remboursement</h2>
      <p>
        Le client dispose, en principe, d'un droit de retraction de 14 jours. Cependant, pour les
        contenus numeriques fournis immediatement, ce droit ne s'applique pas si le client donne son
        accord prealable a l'execution immediate et reconnait perdre son droit de retraction.
      </p>
      <p>
        En cochant la case de renonciation avant paiement, le client demande la fourniture
        immediate et accepte la perte du droit de retraction. Aucun remboursement n'est donc du une
        fois le contenu numerique fourni, sauf dysfonctionnement technique majeur non resolu.
      </p>
    </section>

    <section class="legal-section">
      <h2>7. Support</h2>
      <p>Pour toute question, contactez : code.appisland@gmail.com.</p>
    </section>

    <section class="legal-section">
      <h2>8. Donnees personnelles</h2>
      <p>Les donnees personnelles sont traitees selon la politique de confidentialite.</p>
    </section>

    <section class="legal-section">
      <h2>9. Droit applicable</h2>
      <p>Les presentes CGV sont soumises au droit francais.</p>
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
