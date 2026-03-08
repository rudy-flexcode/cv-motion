<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/assets/supabase';
  import { COMPETENCES, COMPETENCES_GROUPED } from '$lib/competences';
  import CVPreviewModal from '$lib/assets/CVPreviewModal.svelte';
  import PaymentModal from '$lib/assets/PaymentModal.svelte';
  import logoKreolTech from '$lib/assets/logo-kreol-tech.png';

  const METIERS_GROUPED = COMPETENCES_GROUPED ? Object.entries(COMPETENCES_GROUPED) : [];

  let email = '';
  let password = '';
  let isLogin = true;
  let user: any = null;

  let cvs: any[] = [];
  let editingId: string | null = null;
  let modalCV: any = null;

  let showPaymentModal = false;
  let cvToPay: any = null;
  let downloadingId: string | null = null;
  let regeneratingId: string | null = null;
  let userEmailSuffix = '';
  let cvTitle = 'CV';

  type Experience = {
    poste: string;
    entreprise: string;
    debut: string;
    fin: string;
    description: string;
  };

  type Formation = {
    diplome: string;
    etablissement: string;
    debut: string;
    fin: string;
  };

  let cvForm = {
    nom: '',
    prenom: '',
    metier: '',
    tel: '',
    email: '',
    adresse: '',
    ville: '',
    linkedin: '',
    portfolio: '',
    presentation: '',
    experiences: [] as Experience[],
    formations: [] as Formation[],
    competences: [] as string[],
    langues: '',
    permis: ''
  };

  let selectedCompetences: string[] = [];
  let competencesDisponibles: string[] = [];

  $: userEmailSuffix = user?.email ? ` : ${user.email}` : '';
  $: cvTitle = (cvForm.prenom || cvForm.nom) ? `${cvForm.prenom} ${cvForm.nom}`.trim() : 'CV';

  function onMetierChange() {
    competencesDisponibles = COMPETENCES[cvForm.metier] || [];
    selectedCompetences = [];
    cvForm.competences = [];
  }

  function ajouterExperience() {
    cvForm.experiences = [...cvForm.experiences, { poste: '', entreprise: '', debut: '', fin: '', description: '' }];
  }

  function supprimerExperience(index: number) {
    cvForm.experiences = cvForm.experiences.filter((_, i) => i !== index);
  }

  function ajouterFormation() {
    cvForm.formations = [...cvForm.formations, { diplome: '', etablissement: '', debut: '', fin: '' }];
  }

  function supprimerFormation(index: number) {
    cvForm.formations = cvForm.formations.filter((_, i) => i !== index);
  }

  async function signup() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert('Compte cree. Verifiez votre email pour confirmer.');
    email = '';
    password = '';
    isLogin = true;
  }

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    user = data.user;
    await getMesCVs();
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      user = null;
      cvs = [];
    }
  }

  async function ajouterCV() {
    if (!user) return;
    cvForm.competences = [...selectedCompetences];
    const { error } = await supabase.from('csv').insert([{ user_id: user.id, data: cvForm }]);
    if (error) return alert(error.message);
    resetForm();
    await getMesCVs();
  }

  async function modifierCV(id: string) {
    cvForm.competences = [...selectedCompetences];
    const { error } = await supabase.from('csv').update({ data: cvForm }).eq('id', id);
    if (error) return alert(error.message);
    editingId = null;
    resetForm();
    await getMesCVs();
  }

  async function supprimerCV(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce CV ?')) return;
    const { error } = await supabase.from('csv').delete().eq('id', id);
    if (error) return alert(error.message);
    await getMesCVs();
  }

  async function getMesCVs() {
    if (!user) return;
    const { data, error } = await supabase.from('csv').select('*').eq('user_id', user.id).order('id', { ascending: false });
    if (error) return alert(error.message);
    cvs = data as any[];
  }

  function handleSubmit() {
    if (editingId) {
      modifierCV(editingId);
      return;
    }
    ajouterCV();
  }

  function editCV(cv: any) {
    editingId = cv.id;
    cvForm = { ...cv.data };
    selectedCompetences = [...cv.data.competences];
    competencesDisponibles = COMPETENCES[cvForm.metier] || [];
  }

  function resetForm() {
    cvForm = {
      nom: '',
      prenom: '',
      metier: '',
      tel: '',
      email: '',
      adresse: '',
      ville: '',
      linkedin: '',
      portfolio: '',
      presentation: '',
      experiences: [],
      formations: [],
      competences: [],
      langues: '',
      permis: ''
    };
    selectedCompetences = [];
    competencesDisponibles = [];
  }

  async function downloadSecureCv(cvId: string, refresh = false) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert('Veuillez vous connecter pour telecharger.');
      return;
    }

    if (refresh) {
      regeneratingId = cvId;
    } else {
      downloadingId = cvId;
    }

    try {
      const refreshParam = refresh ? '&refresh=1' : '';
      const res = await fetch(`/secure-cv?cvId=${cvId}${refreshParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 403) {
          alert('Paiement requis. Utilisez PDF securise.');
        } else {
          alert(text || 'Erreur lors du telechargement.');
        }
        return;
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
    } finally {
      if (refresh) {
        regeneratingId = null;
      } else {
        downloadingId = null;
      }
    }
  }

  function toggleCompetence(comp: string) {
    if (selectedCompetences.includes(comp)) {
      selectedCompetences = selectedCompetences.filter(c => c !== comp);
    } else {
      selectedCompetences = [...selectedCompetences, comp];
    }
  }

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      user = data.session.user;
      await getMesCVs();
    }
  });
</script>

<svelte:head>
  <title>CV Motion | Generateur de CV moderne</title>
  <meta
    name="description"
    content="Creez un CV professionnel en minutes, export PDF HD, design moderne et paiement securise."
  />
  <meta property="og:title" content="CV Motion | Generateur de CV moderne" />
  <meta
    property="og:description"
    content="Creez un CV professionnel en minutes, export PDF HD, design moderne et paiement securise."
  />
  <meta name="twitter:title" content="CV Motion | Generateur de CV moderne" />
  <meta
    name="twitter:description"
    content="Creez un CV professionnel en minutes, export PDF HD, design moderne et paiement securise."
  />
</svelte:head>

<main class="page">
  <section class="hero">
    <div class="hero-orb hero-orb--one"></div>
    <div class="hero-orb hero-orb--two"></div>
    <div class="hero-orb hero-orb--three"></div>

    <div class="hero-content">
      <div class="brand-row">
        <img class="brand-logo" src={logoKreolTech} alt="Kreol tech" />
        <span class="brand-name">Kreol tech</span>
      </div>
      <span class="hero-eyebrow">CV premium</span>
      <h1 class="hero-title"><span class="hero-title-accent">CV</span> Motion</h1>
      <p class="hero-lead">
        Creez un CV clair et moderne en quelques minutes. Export PDF propre, stockage securise, acces immediat.
      </p>
      <div class="hero-actions">
        <div class="hero-actions-inner">
          <a class="btn-primary" href={user ? '#builder' : '#auth'}>Creer mon CV</a>
          <a class="btn-ghost" href="#builder">Voir un exemple</a>
          <a class="btn-primary is-clone" href={user ? '#builder' : '#auth'} aria-hidden="true">Creer mon CV</a>
          <a class="btn-ghost is-clone" href="#builder" aria-hidden="true">Voir un exemple</a>
        </div>
      </div>
      <div class="hero-proof">
        <div class="proof-line">Export PDF pro en 1 clic</div>
        <div class="proof-line">Stockage prive et securise</div>
        <div class="proof-secure">Paiement securise par Stripe</div>
      </div>
    </div>

    <div class="hero-showcase">
      <div class="showcase-card showcase-card--primary">
        <div class="price-row">
          <span class="price-tag">2,49 EUR</span>
          <span class="price-sub">Paiement unique</span>
        </div>
        <div class="mini-cv">
          <div class="mini-header">
            <div class="mini-avatar"></div>
            <div class="mini-lines">
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="mini-body">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="mini-grid">
            <div class="mini-block"></div>
            <div class="mini-block"></div>
            <div class="mini-block"></div>
          </div>
        </div>
        <div class="showcase-tags">
          <span>PDF HD</span>
          <span>Design pro</span>
          <span>Acces instantane</span>
        </div>
      </div>

      <div class="showcase-card showcase-card--glass">
        <p class="glass-title">Pret a postuler</p>
        <p class="glass-sub">Un CV lisible, un PDF net, un partage rapide.</p>
        <div class="glass-metrics">
          <div>
            <span class="metric-value">Instantane</span>
            <span class="metric-label">Generation PDF</span>
          </div>
          <div>
            <span class="metric-value">100% prive</span>
            <span class="metric-label">Stockage securise</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  {#if !user}
    <section class="auth-container" id="auth">
      <h2>{isLogin ? 'Se connecter' : 'Creer un compte'}</h2>
      <form on:submit|preventDefault={isLogin ? login : signup}>
        <div class="form-group">
          <input type="email" placeholder="Email" bind:value={email} required />
        </div>
        <div class="form-group">
          <input type="password" placeholder="Mot de passe" bind:value={password} required />
        </div>
        <button type="submit">{isLogin ? 'Se connecter' : "S'inscrire"}</button>
      </form>
      <button type="button" class="toggle-link" on:click={() => isLogin = !isLogin}>
        {isLogin ? 'Pas encore de compte ? Creer un' : 'Deja inscrit ? Se connecter'}
      </button>
    </section>
  {/if}

  {#if user}
    <div class="top-bar">
      <span class="user-pill">Connecte{userEmailSuffix}</span>
      <button class="logout-btn" on:click={logout}>Se deconnecter</button>
    </div>
  {/if}

  {#if user}
    <div class="container" id="builder">
      <div class="form-section">
        <h2>{editingId ? 'Modifier le CV' : 'Creer un CV'}</h2>
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-row">
            <div class="form-group">
              <label for="prenom">Prenom *</label>
              <input id="prenom" type="text" bind:value={cvForm.prenom} required />
            </div>
            <div class="form-group">
              <label for="nom">Nom *</label>
              <input id="nom" type="text" bind:value={cvForm.nom} required />
            </div>
          </div>

          <div class="form-group">
            <label for="metier">Metier / Titre professionnel *</label>
            <select id="metier" bind:value={cvForm.metier} on:change={onMetierChange} required>
              <option value="">Choisir un metier</option>
              {#each METIERS_GROUPED as group}
                <optgroup label={group[0]}>
                  {#each Object.keys(group[1]) as metier}
                    <option value={metier}>{metier}</option>
                  {/each}
                </optgroup>
              {/each}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email</label>
              <input id="email" type="email" bind:value={cvForm.email} />
            </div>
            <div class="form-group">
              <label for="tel">Telephone</label>
              <input id="tel" type="tel" bind:value={cvForm.tel} />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="adresse">Adresse</label>
              <input id="adresse" type="text" bind:value={cvForm.adresse} />
            </div>
            <div class="form-group">
              <label for="ville">Ville</label>
              <input id="ville" type="text" bind:value={cvForm.ville} />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="linkedin">LinkedIn</label>
              <input id="linkedin" type="text" bind:value={cvForm.linkedin} placeholder="linkedin.com/in/votre-profil" />
            </div>
            <div class="form-group">
              <label for="portfolio">Portfolio / Site web</label>
              <input id="portfolio" type="text" bind:value={cvForm.portfolio} placeholder="www.votre-site.com" />
            </div>
          </div>

          <div class="form-group">
            <label for="presentation">Presentation</label>
            <textarea id="presentation" bind:value={cvForm.presentation} placeholder="Presentez-vous en quelques lignes..."></textarea>
          </div>

          {#if competencesDisponibles.length > 0}
            <fieldset>
              <legend>Competences</legend>
              <div class="competences">
                {#each competencesDisponibles as comp}
                  <button
                    type="button"
                    class="competence-btn"
                    class:selected={selectedCompetences.includes(comp)}
                    on:click={() => toggleCompetence(comp)}
                  >
                    {comp}
                  </button>
                {/each}
              </div>
            </fieldset>
          {/if}

          <fieldset>
            <legend>Experiences professionnelles</legend>
            {#each cvForm.experiences as exp, i}
              <div class="experience-item">
                <div class="item-header">
                  <h4>Experience {i + 1}</h4>
                  <button type="button" class="btn-remove" on:click={() => supprimerExperience(i)}>Supprimer</button>
                </div>
                <div class="form-group">
                  <label for={"poste-" + i}>Poste</label>
                  <input id={"poste-" + i} type="text" bind:value={exp.poste} placeholder="Ex: Developpeur Full Stack" />
                </div>
                <div class="form-group">
                  <label for={"entreprise-" + i}>Entreprise</label>
                  <input id={"entreprise-" + i} type="text" bind:value={exp.entreprise} placeholder="Ex: Google France" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for={"debut-" + i}>Debut</label>
                    <input id={"debut-" + i} type="text" bind:value={exp.debut} placeholder="Ex: Janvier 2020" />
                  </div>
                  <div class="form-group">
                    <label for={"fin-" + i}>Fin</label>
                    <input id={"fin-" + i} type="text" bind:value={exp.fin} placeholder="Ex: Present" />
                  </div>
                </div>
                <div class="form-group">
                  <label for={"description-" + i}>Description</label>
                  <textarea id={"description-" + i} bind:value={exp.description} placeholder="Decrivez vos missions et realisations..."></textarea>
                </div>
              </div>
            {/each}
            <button type="button" class="btn-add" on:click={ajouterExperience}>Ajouter une experience</button>
          </fieldset>

          <fieldset>
            <legend>Formations</legend>
            {#each cvForm.formations as form, i}
              <div class="formation-item">
                <div class="item-header">
                  <h4>Formation {i + 1}</h4>
                  <button type="button" class="btn-remove" on:click={() => supprimerFormation(i)}>Supprimer</button>
                </div>
                <div class="form-group">
                  <label for={"diplome-" + i}>Diplome</label>
                  <input id={"diplome-" + i} type="text" bind:value={form.diplome} placeholder="Ex: Master en Informatique" />
                </div>
                <div class="form-group">
                  <label for={"etablissement-" + i}>Etablissement</label>
                  <input id={"etablissement-" + i} type="text" bind:value={form.etablissement} placeholder="Ex: Universite Paris-Saclay" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label for={"form-debut-" + i}>Debut</label>
                    <input id={"form-debut-" + i} type="text" bind:value={form.debut} placeholder="Ex: 2018" />
                  </div>
                  <div class="form-group">
                    <label for={"form-fin-" + i}>Fin</label>
                    <input id={"form-fin-" + i} type="text" bind:value={form.fin} placeholder="Ex: 2020" />
                  </div>
                </div>
              </div>
            {/each}
            <button type="button" class="btn-add" on:click={ajouterFormation}>Ajouter une formation</button>
          </fieldset>

          <div class="form-row">
            <div class="form-group">
              <label for="langues">Langues</label>
              <input id="langues" type="text" bind:value={cvForm.langues} placeholder="Ex: Francais (natif), Anglais (C1)" />
            </div>
            <div class="form-group">
              <label for="permis">Permis</label>
              <input id="permis" type="text" bind:value={cvForm.permis} placeholder="Ex: Permis B" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit">{editingId ? 'Modifier' : 'Creer'} le CV</button>
            {#if editingId}
              <button type="button" class="btn-secondary" on:click={() => { editingId = null; resetForm(); }}>Annuler</button>
            {/if}
          </div>
        </form>
      </div>

      <div class="preview-wrapper">
        <div class="preview">
          <div class="cv-preview">
            <div class="cv-header">
              <h2>{cvTitle}</h2>
              {#if cvForm.metier}
                <div class="cv-metier">{cvForm.metier}</div>
              {/if}
            </div>

            <div class="cv-body">
              <div class="cv-sidebar-bg" aria-hidden="true"></div>
              <div class="cv-divider" aria-hidden="true"></div>
              <div class="cv-layout">
                <aside class="cv-sidebar">
                  {#if cvForm.email || cvForm.tel || cvForm.adresse || cvForm.ville || cvForm.linkedin || cvForm.portfolio}
                    <div class="cv-section cv-section--sidebar">
                      <h3>Contact</h3>
                      <div class="cv-contact-list">
                        {#if cvForm.email}
                          <div class="cv-contact-item">
                            <span class="cv-dot"></span>
                            <span class="cv-label">Email</span>
                            <span class="cv-value">{cvForm.email}</span>
                          </div>
                        {/if}
                        {#if cvForm.tel}
                          <div class="cv-contact-item">
                            <span class="cv-dot"></span>
                            <span class="cv-label">Tel</span>
                            <span class="cv-value">{cvForm.tel}</span>
                          </div>
                        {/if}
                        {#if cvForm.adresse || cvForm.ville}
                          <div class="cv-contact-item">
                            <span class="cv-dot"></span>
                            <span class="cv-label">Adresse</span>
                            <span class="cv-value">{cvForm.adresse} {cvForm.ville}</span>
                          </div>
                        {/if}
                        {#if cvForm.linkedin}
                          <div class="cv-contact-item">
                            <span class="cv-dot"></span>
                            <span class="cv-label">LinkedIn</span>
                            <span class="cv-value">{cvForm.linkedin}</span>
                          </div>
                        {/if}
                        {#if cvForm.portfolio}
                          <div class="cv-contact-item">
                            <span class="cv-dot"></span>
                            <span class="cv-label">Portfolio</span>
                            <span class="cv-value">{cvForm.portfolio}</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/if}

                  {#if selectedCompetences.length > 0}
                    <div class="cv-section cv-section--sidebar">
                      <h3>Competences</h3>
                      <div class="cv-competences">
                        {#each selectedCompetences as comp}
                          <div class="cv-competence-tag">{comp}</div>
                        {/each}
                      </div>
                    </div>
                  {/if}

                  {#if cvForm.langues || cvForm.permis}
                    <div class="cv-section cv-section--sidebar">
                      <h3>Infos</h3>
                      {#if cvForm.langues}
                        <div class="cv-contact-item">
                          <span class="cv-dot"></span>
                          <span class="cv-label">Langues</span>
                          <span class="cv-value">{cvForm.langues}</span>
                        </div>
                      {/if}
                      {#if cvForm.permis}
                        <div class="cv-contact-item">
                          <span class="cv-dot"></span>
                          <span class="cv-label">Permis</span>
                          <span class="cv-value">{cvForm.permis}</span>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </aside>

                <section class="cv-main">
                  {#if cvForm.presentation}
                    <div class="cv-section">
                      <h3>A propos</h3>
                      <div class="cv-presentation">{cvForm.presentation}</div>
                    </div>
                  {/if}

                  {#if cvForm.experiences.length > 0}
                    <div class="cv-section">
                      <h3>Experiences professionnelles</h3>
                      {#each cvForm.experiences as exp}
                        {#if exp.poste || exp.entreprise || exp.debut || exp.fin || exp.description}
                          <div class="cv-experience-item">
                            {#if exp.poste || exp.entreprise || exp.debut || exp.fin}
                              <div class="cv-exp-header">
                                {#if exp.poste || exp.entreprise}
                                  <div class="cv-exp-title">{[exp.poste, exp.entreprise].filter(Boolean).join(' - ')}</div>
                                {/if}
                                {#if exp.debut || exp.fin}
                                  <div class="cv-exp-dates">{[exp.debut, exp.fin].filter(Boolean).join(' - ')}</div>
                                {/if}
                              </div>
                            {/if}
                            {#if exp.description}
                              <div class="cv-exp-description">
                                {#each exp.description.split('\n').map(line => line.trim()).filter(Boolean) as line, idx}
                                  <div class={"cv-exp-line " + (idx === 0 ? "cv-exp-line--bullet" : "cv-exp-subline")}>
                                    {line}
                                  </div>
                                {/each}
                              </div>
                            {/if}
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}

                  {#if cvForm.formations.length > 0}
                    <div class="cv-section">
                      <h3>Formations</h3>
                      {#each cvForm.formations as form}
                        {#if form.diplome || form.etablissement || form.debut || form.fin}
                          <div class="cv-formation-item">
                            <div class="cv-exp-header">
                              {#if form.diplome || form.etablissement}
                                <div class="cv-exp-title">{[form.diplome, form.etablissement].filter(Boolean).join(' - ')}</div>
                              {/if}
                              {#if form.debut || form.fin}
                                <div class="cv-exp-dates">{[form.debut, form.fin].filter(Boolean).join(' - ')}</div>
                              {/if}
                            </div>
                          </div>
                        {/if}
                      {/each}
                    </div>
                  {/if}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if user}
    <div class="cv-list">
      <h2>Mes CVs</h2>
      {#if cvs.length === 0}
        <p class="cv-empty">Aucun CV pour le moment.</p>
      {/if}
      {#if cvs.length > 0}
        {#each cvs as cv}
          <div class="cv-item">
            <div class="cv-item-info">
              <strong>{cv.data.prenom} {cv.data.nom}</strong>
              <span>{cv.data.metier}</span>
            </div>
            <div class="cv-actions">
              <button class="visualiser" on:click={() => modalCV = cv}>Visualiser</button>
              <button on:click={() => editCV(cv)}>Modifier</button>
              <button
                class="download"
                on:click={() => {
                  cvToPay = cv;
                  showPaymentModal = true;
                }}
                title="PDF securise"
              >
                PDF securise
              </button>
              <button
                class="refresh"
                on:click={() => downloadSecureCv(cv.id, true)}
                disabled={regeneratingId === cv.id}
                title="Regenerer avec le nouveau design"
              >
                {regeneratingId === cv.id ? 'Regeneration...' : 'Regenerer PDF'}
              </button>
              <button class="delete" on:click={() => supprimerCV(cv.id)}>Supprimer</button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <footer class="site-footer">
    <div class="footer-inner">
      <span>&copy; {new Date().getFullYear()} Rudy Robert</span>
      <div class="footer-links">
        <a href="/mentions-legales">Mentions legales</a>
        <a href="/cgv">CGV</a>
        <a href="/confidentialite">Confidentialite</a>
      </div>
    </div>
  </footer>

  {#if modalCV}
    <CVPreviewModal cvData={modalCV.data} on:close={() => modalCV = null} />
  {/if}

  {#if showPaymentModal && cvToPay}
    <PaymentModal cv={cvToPay} on:close={() => { showPaymentModal = false; cvToPay = null; }} />
  {/if}
</main>

<style>
  @import "../lib/assets/cv-preview.css";

  .page {
    max-width: 1240px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .hero {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-xl);
    padding: 44px;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 32px;
    align-items: center;
    background: linear-gradient(135deg, #0b1220 0%, #111a2e 55%, #132b52 100%);
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: var(--shadow-strong);
    color: #e2e8f0;
  }

  .hero-orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(18px);
    opacity: 0.6;
  }

  .hero-orb--one {
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.85), transparent 70%);
    top: -80px;
    left: -40px;
  }

  .hero-orb--two {
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(14, 165, 233, 0.6), transparent 70%);
    bottom: -140px;
    right: 10%;
  }

  .hero-orb--three {
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.6), transparent 70%);
    top: 40px;
    right: -40px;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 18px;
    animation: fadeUp 0.9s ease both;
  }

  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand-logo {
    width: 46px;
    height: 46px;
    object-fit: contain;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.35);
    padding: 6px;
  }

  .brand-name {
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.88rem;
    color: rgba(226, 232, 240, 0.9);
  }

  .hero-eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(191, 219, 254, 0.85);
  }

  .hero-title {
    margin: 0;
    font-size: 3.7rem;
    color: #f8fafc;
    font-family: "Fraunces", "Times New Roman", serif;
  }

  .hero-title-accent {
    color: #93c5fd;
  }

  .hero-lead {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #c7d2fe;
    max-width: 520px;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hero-actions-inner {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  .hero-actions-inner .is-clone {
    display: none;
  }

  .btn-primary,
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 22px;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #f8fafc;
    border: 1px solid rgba(147, 197, 253, 0.35);
    box-shadow: 0 14px 30px rgba(37, 99, 235, 0.35);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(37, 99, 235, 0.45);
  }

  .btn-ghost {
    border: 1px solid rgba(148, 163, 184, 0.35);
    color: #e2e8f0;
    background: rgba(15, 23, 42, 0.35);
  }

  .btn-ghost:hover {
    transform: translateY(-1px);
  }

  .hero-proof {
    display: grid;
    gap: 10px;
    font-size: 0.92rem;
    color: #e0e7ff;
  }

  .proof-line {
    font-weight: 600;
  }

  .proof-secure {
    color: rgba(191, 219, 254, 0.9);
  }

  .hero-showcase {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 18px;
    animation: fadeUp 0.9s ease both;
    animation-delay: 0.1s;
  }

  .showcase-card {
    border-radius: 22px;
    padding: 18px;
    border: 1px solid rgba(148, 163, 184, 0.25);
  }

  .showcase-card--primary {
    background: linear-gradient(150deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.92));
    box-shadow: 0 20px 42px rgba(15, 23, 42, 0.45);
  }

  .showcase-card--glass {
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(10px);
  }

  .price-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .price-tag {
    font-size: 1.8rem;
    font-weight: 700;
    color: #f8fafc;
  }

  .price-sub {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: rgba(191, 219, 254, 0.75);
  }

  .mini-cv {
    background: rgba(15, 23, 42, 0.7);
    border-radius: 16px;
    padding: 14px;
    display: grid;
    gap: 12px;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  .mini-header {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .mini-avatar {
    width: 32px;
    height: 32px;
    border-radius: 12px;
    background: linear-gradient(135deg, #93c5fd, #1d4ed8);
  }

  .mini-lines {
    display: grid;
    gap: 6px;
    flex: 1;
  }

  .mini-lines span {
    display: block;
    height: 6px;
    border-radius: 999px;
    background: rgba(191, 219, 254, 0.55);
  }

  .mini-lines span:last-child {
    width: 70%;
    background: rgba(191, 219, 254, 0.35);
  }

  .mini-body {
    display: grid;
    gap: 6px;
  }

  .mini-body span {
    display: block;
    height: 6px;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.35);
  }

  .mini-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .mini-block {
    height: 20px;
    border-radius: 10px;
    background: rgba(59, 130, 246, 0.35);
  }

  .showcase-tags {
    margin-top: 12px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #dbeafe;
  }

  .showcase-tags span {
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
  }

  .glass-title {
    margin: 0 0 6px;
    font-size: 1.05rem;
    color: #f8fafc;
    font-weight: 700;
  }

  .glass-sub {
    margin: 0 0 14px;
    color: #c7d2fe;
    font-size: 0.9rem;
  }

  .glass-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .metric-value {
    display: block;
    font-weight: 700;
    color: #93c5fd;
  }

  .metric-label {
    display: block;
    font-size: 0.78rem;
    color: #c7d2fe;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes hero-marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  .auth-container {
    max-width: 420px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.94);
    border-radius: var(--radius-lg);
    border: 1px solid var(--brand-border);
    padding: 28px;
    display: grid;
    gap: 16px;
    box-shadow: var(--shadow-soft);
    backdrop-filter: blur(6px);
  }

  .auth-container h2 {
    margin: 0;
    font-size: 1.6rem;
    color: var(--brand-ink);
  }

  .toggle-link {
    background: transparent;
    border: none;
    color: var(--brand-accent);
    font-weight: 600;
    cursor: pointer;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .user-pill {
    font-size: 0.9rem;
    color: var(--brand-muted);
    background: rgba(255, 255, 255, 0.75);
    border: 1px solid var(--brand-border);
    padding: 6px 12px;
    border-radius: 999px;
  }

  .logout-btn {
    background: var(--brand-ink);
    color: #ffffff;
    border: 1px solid rgba(15, 23, 42, 0.2);
    padding: 10px 18px;
    border-radius: 999px;
    cursor: pointer;
  }

  .container {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) 210mm;
    gap: 28px;
    align-items: start;
  }

  .form-section {
    background: rgba(255, 255, 255, 0.96);
    padding: 30px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--brand-border);
    box-shadow: var(--shadow-soft);
  }

  .form-section h2 {
    margin-top: 0;
    font-size: 1.7rem;
    color: var(--brand-ink);
    border-bottom: 2px solid var(--brand-border);
    padding-bottom: 10px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    color: var(--brand-ink-muted);
    font-weight: 500;
    font-size: 0.95rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
  }

  input,
  select,
  textarea {
    padding: 11px 14px;
    font-size: 0.98rem;
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--brand-border);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: inherit;
    box-sizing: border-box;
    background: #ffffff;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--brand-accent);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }

  textarea {
    resize: vertical;
    min-height: 100px;
    word-break: break-word;
  }

  button {
    padding: 10px 18px;
    background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-strong));
    color: #f8fafc;
    border: 1px solid rgba(147, 197, 253, 0.35);
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.95rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 12px 26px rgba(37, 99, 235, 0.25);
  }

  button:hover {
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: #ffffff;
    color: var(--brand-ink);
    border: 1px solid var(--brand-border);
    box-shadow: none;
  }

  .btn-add {
    background: #ffffff;
    color: var(--brand-ink);
    border: 1px dashed var(--brand-border-strong);
    box-shadow: none;
    padding: 8px 16px;
    border-radius: 12px;
  }

  .btn-remove {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    box-shadow: none;
    padding: 6px 12px;
    border-radius: 10px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }

  .competences {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .competence-btn {
    background: var(--brand-surface-soft);
    color: #1f2937;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.9rem;
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow: none;
  }

  .competence-btn.selected {
    background: var(--brand-accent-soft);
    color: #1e3a8a;
    border-color: rgba(37, 99, 235, 0.45);
  }

  fieldset {
    border: 1px solid var(--brand-border);
    border-radius: 14px;
    padding: 20px;
    margin: 22px 0;
    background: rgba(248, 250, 252, 0.6);
  }

  legend {
    font-weight: 600;
    color: var(--brand-ink-muted);
    padding: 0 10px;
  }

  .experience-item,
  .formation-item {
    background: rgba(248, 250, 252, 0.9);
    padding: 18px;
    border-radius: 14px;
    margin-bottom: 16px;
    border: 1px solid var(--brand-border);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .item-header h4 {
    margin: 0;
    color: #111827;
  }

  .preview {
    flex: 0 0 auto;
    width: calc(210mm + 16px);
    padding: 8px;
    background: rgba(255, 255, 255, 0.96);
    border-radius: var(--radius-md);
    border: 1px solid var(--brand-border);
    box-shadow: var(--shadow-soft);
    overflow: auto;
    max-height: 90vh;
  }

  .preview-wrapper {
    position: sticky;
    top: 24px;
  }

  .preview .cv-preview {
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
  }


  .cv-list {
    display: grid;
    gap: 14px;
    background: rgba(255, 255, 255, 0.96);
    border-radius: var(--radius-lg);
    border: 1px solid var(--brand-border);
    padding: 24px;
    box-shadow: var(--shadow-soft);
  }

  .cv-list h2 {
    margin: 0;
    font-size: 1.4rem;
    color: var(--brand-ink);
  }

  .cv-empty {
    color: var(--brand-muted);
    margin: 0;
  }

  .cv-item {
    border: 1px solid var(--brand-border);
    border-radius: 16px;
    padding: 16px;
    display: grid;
    gap: 10px;
    background: rgba(255, 255, 255, 0.8);
  }

  .cv-item-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #111827;
  }

  .cv-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .cv-actions button {
    background: #ffffff;
    color: var(--brand-ink);
    border: 1px solid var(--brand-border);
    box-shadow: none;
  }

  .cv-actions .download {
    border-color: rgba(37, 99, 235, 0.45);
    color: #1d4ed8;
  }

  .cv-actions .refresh {
    border-color: rgba(148, 163, 184, 0.7);
    color: var(--brand-ink-muted);
  }

  .cv-actions .delete {
    border-color: #fecaca;
    color: #b91c1c;
  }

  .site-footer {
    margin-top: 32px;
    padding: 18px 0 8px;
    color: var(--brand-muted);
    font-size: 0.85rem;
    border-top: 1px solid rgba(148, 163, 184, 0.25);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer-links {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .footer-links a {
    color: var(--brand-ink);
    text-decoration: none;
    font-weight: 600;
  }

  .footer-links a:hover {
    text-decoration: underline;
  }

  @media (max-width: 1200px) {
    .container {
      grid-template-columns: 1fr;
    }

    .preview,
    .preview-wrapper {
      width: 100%;
    }
  }

  @media (max-width: 980px) {
    .hero {
      grid-template-columns: 1fr;
    }

    .hero-showcase {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .hero {
      padding: 24px;
    }

    .hero-title {
      font-size: 2.6rem;
    }

    .hero-actions {
      overflow: hidden;
      -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
      mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
    }

    .hero-actions-inner {
      flex-wrap: nowrap;
      width: max-content;
      animation: hero-marquee 12s linear infinite;
    }

    .hero-actions-inner .is-clone {
      display: inline-flex;
    }

  }

  @media (prefers-reduced-motion: reduce) {
    .hero-actions-inner {
      animation: none;
    }
  }
</style>
