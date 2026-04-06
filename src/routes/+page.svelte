<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { supabase } from '$lib/assets/supabase';
  import { COMPETENCES, COMPETENCES_GROUPED } from '$lib/competences';
  import CVPreviewModal from '$lib/assets/CVPreviewModal.svelte';
  import PaymentModal from '$lib/assets/PaymentModal.svelte';
  import logoKreolTech from '$lib/assets/logo-kreol-tech.png';

  const METIERS_GROUPED = COMPETENCES_GROUPED ? Object.entries(COMPETENCES_GROUPED) : [];

  let email = '';
  let password = '';
  let confirmPassword = '';
  let isLogin = true;
  let authError = '';
  let authNotice = '';
  let isSubmitting = false;
  let showPassword = false;
  let showConfirmPassword = false;
  let pendingEmail = '';
  let resendCooldown = 0;
  let resendInterval: ReturnType<typeof setInterval> | null = null;
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
  let showAuthModal = false;

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

  const SAMPLE_CV = {
    nom: 'Durand',
    prenom: 'Lea',
    metier: 'Developpeuse web',
    tel: '06 12 34 56 78',
    email: 'lea.durand@email.com',
    adresse: '12 rue des Lilas',
    ville: 'Paris',
    linkedin: 'linkedin.com/in/lea-durand',
    portfolio: 'www.lea-durand.dev',
    presentation:
      "Developpeuse web passionnee par les experiences claires et accessibles. J'aime transformer des idees en interfaces rapides et elegantes.",
    experiences: [
      {
        poste: 'Developpeuse front-end',
        entreprise: 'Studio Octo',
        debut: '2022',
        fin: 'Present',
        description: '- Refonte de tableaux de bord\n- Optimisation des performances web\n- Design system et components'
      },
      {
        poste: 'Integratrice web',
        entreprise: 'Agence Bloom',
        debut: '2020',
        fin: '2022',
        description: '- Integration responsive\n- Templates emails\n- Maintenance SEO'
      }
    ],
    formations: [
      {
        diplome: 'Master Informatique',
        etablissement: 'Universite Paris-Saclay',
        debut: '2018',
        fin: '2020'
      }
    ],
    competences: ['Svelte', 'TypeScript', 'Figma', 'Tailwind'],
    langues: 'Francais (natif), Anglais (B2)',
    permis: 'B'
  };

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

  function setAuthMode(nextIsLogin: boolean) {
    isLogin = nextIsLogin;
    authError = '';
    authNotice = '';
    password = '';
    confirmPassword = '';
  }

  function startResendCooldown(seconds = 30) {
    resendCooldown = seconds;
    if (resendInterval) clearInterval(resendInterval);
    resendInterval = setInterval(() => {
      resendCooldown -= 1;
      if (resendCooldown <= 0 && resendInterval) {
        clearInterval(resendInterval);
        resendInterval = null;
      }
    }, 1000);
  }

  async function signup() {
    authError = '';
    authNotice = '';
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      authError = 'Veuillez renseigner un email valide.';
      return;
    }

    if (password.length < 6) {
      authError = 'Le mot de passe doit contenir au moins 6 caracteres.';
      return;
    }

    if (password !== confirmPassword) {
      authError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    isSubmitting = true;
    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    isSubmitting = false;
    if (error) {
      authError = error.message;
      return;
    }

    pendingEmail = trimmedEmail;
    authNotice = `Compte cree. Un email de confirmation vient d'etre envoye a ${trimmedEmail}.`;
    startResendCooldown();
    password = '';
    confirmPassword = '';
    isLogin = true;
  }

  async function login() {
    authError = '';
    authNotice = '';
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      authError = 'Veuillez renseigner votre email.';
      return;
    }

    isSubmitting = true;
    const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    isSubmitting = false;
    if (error) {
      authError = error.message;
      return;
    }
    user = data.user;
    pendingEmail = '';
    await getMesCVs();
    showAuthModal = false;
  }

  async function resendConfirmation() {
    const resendEmail = (pendingEmail || email).trim();
    if (!resendEmail) {
      authError = 'Veuillez saisir votre email pour renvoyer le message.';
      return;
    }
    authError = '';
    authNotice = '';
    isSubmitting = true;
    const { error } = await supabase.auth.resend({ type: 'signup', email: resendEmail });
    isSubmitting = false;
    if (error) {
      authError = error.message;
      return;
    }
    pendingEmail = resendEmail;
    authNotice = `Email de confirmation renvoye a ${resendEmail}.`;
    startResendCooldown();
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
    if (!user) {
      authError = '';
      authNotice = 'Creez un compte pour sauvegarder et telecharger votre CV.';
      isLogin = false;
      openAuthModal();
      return;
    }
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

  function openAuthModal() {
    showAuthModal = true;
  }

  function closeAuthModal() {
    showAuthModal = false;
  }

  function openExample() {
    modalCV = { data: SAMPLE_CV };
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
          alert('Paiement requis. Utilisez Telecharger.');
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

  onDestroy(() => {
    if (resendInterval) clearInterval(resendInterval);
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
  <header class="mini-header">
    <div class="mini-brand">
      <img class="mini-logo" src={logoKreolTech} alt="Kreol tech" />
      <div class="mini-brand-text">
        <span class="mini-brand-name">Kreol tech</span>
        <span class="mini-brand-sub">CV Motion</span>
      </div>
    </div>
    <div class="mini-actions">
      {#if user}
        <span class="user-pill">Connecte{userEmailSuffix}</span>
        <button class="logout-btn" on:click={logout}>Se deconnecter</button>
      {:else}
        <button
          type="button"
          class="mini-auth ghost"
          on:click={() => {
            setAuthMode(true);
            openAuthModal();
          }}
        >
          Se connecter
        </button>
        <button
          type="button"
          class="mini-auth"
          on:click={() => {
            setAuthMode(false);
            openAuthModal();
          }}
        >
          Creer un compte
        </button>
      {/if}
    </div>
  </header>

  <div class="container" id="builder">
      <div class="form-section">
        <h2>{editingId ? 'Modifier le CV' : 'Creer un CV'}</h2>
        {#if !user}
          <div class="auth-callout">
            <div class="auth-callout-title">Etape 1 : Remplissez votre CV</div>
            <div class="auth-callout-text">Etape 2 : Creez un compte pour sauvegarder et telecharger.</div>
            <a
              class="auth-callout-link"
              href="#auth"
              on:click|preventDefault={() => {
                setAuthMode(false);
                openAuthModal();
              }}
            >
              Creer un compte
            </a>
          </div>
        {/if}
        <div class="builder-actions">
          <a class="btn-ghost" href="#example" on:click|preventDefault={openExample}>Voir un exemple</a>
        </div>
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
                title="Telecharger le PDF"
              >
                Telecharger
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

  {#if !user && showAuthModal}
    <div class="auth-modal" role="dialog" aria-modal="true" on:click={closeAuthModal}>
      <div class="auth-modal-card" on:click|stopPropagation>
        <button class="auth-modal-close" on:click={closeAuthModal} aria-label="Fermer">
          &times;
        </button>
        <section class="auth-container">
          <div class="auth-header">
            <h2>{isLogin ? 'Se connecter' : 'Creer un compte'}</h2>
            <p class="auth-subtitle">
              {isLogin
                ? 'Accedez a vos CVs et a votre espace.'
                : 'Creez votre compte, puis confirmez votre email pour activer votre acces.'}
            </p>
          </div>

          <div class="auth-switch" role="tablist" aria-label="Choisir un mode">
            <button type="button" class:active={isLogin} aria-pressed={isLogin} on:click={() => setAuthMode(true)}>
              Se connecter
            </button>
            <button type="button" class:active={!isLogin} aria-pressed={!isLogin} on:click={() => setAuthMode(false)}>
              Creer un compte
            </button>
          </div>

          {#if authNotice}
            <div class="auth-alert auth-alert--success" role="status">{authNotice}</div>
          {/if}
          {#if authError}
            <div class="auth-alert auth-alert--error" role="alert">{authError}</div>
          {/if}

          <form on:submit|preventDefault={isLogin ? login : signup}>
            <div class="form-group">
              <label for="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="nom@domaine.com"
                bind:value={email}
                required
                autocomplete="email"
              />
              {#if !isLogin}
                <p class="field-hint">Utilisez un email actif pour recevoir le lien de confirmation.</p>
              {/if}
            </div>
            <div class="form-group">
              <label for="auth-password">Mot de passe</label>
              <div class="input-with-action">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="6 caracteres minimum"
                  bind:value={password}
                  required
                  autocomplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button type="button" class="input-action" on:click={() => (showPassword = !showPassword)}>
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {#if !isLogin}
                <p class="field-hint">Minimum 6 caracteres.</p>
              {/if}
            </div>

            {#if !isLogin}
              <div class="form-group">
                <label for="auth-confirm">Confirmer le mot de passe</label>
                <div class="input-with-action">
                  <input
                    id="auth-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repetez le mot de passe"
                    bind:value={confirmPassword}
                    required
                    autocomplete="new-password"
                  />
                  <button type="button" class="input-action" on:click={() => (showConfirmPassword = !showConfirmPassword)}>
                    {showConfirmPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
            {/if}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Chargement...' : isLogin ? 'Se connecter' : 'Creer mon compte'}
            </button>
          </form>

          {#if pendingEmail}
            <div class="auth-resend">
              <span>Pas recu l'email ?</span>
              <button
                type="button"
                class="link-button"
                on:click={resendConfirmation}
                disabled={resendCooldown > 0 || isSubmitting}
              >
                {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : "Renvoyer l'email"}
              </button>
            </div>
          {/if}
        </section>
      </div>
    </div>
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
  .mini-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 14px 18px;
    border-radius: calc(var(--radius-lg) + 4px);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 236, 225, 0.75)),
      #ffffff;
    border: 1px solid rgba(255, 153, 109, 0.35);
    box-shadow: 0 20px 50px rgba(21, 24, 36, 0.12);
    backdrop-filter: blur(8px);
  }

  .mini-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mini-logo {
    width: 44px;
    height: 44px;
    object-fit: contain;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.18), rgba(14, 165, 233, 0.12));
    border: 1px solid rgba(255, 153, 109, 0.4);
    padding: 6px;
  }

  .mini-brand-text {
    display: grid;
    gap: 2px;
  }

  .mini-brand-name {
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-size: 0.72rem;
    color: rgba(90, 103, 122, 0.9);
  }

  .mini-brand-sub {
    font-weight: 700;
    font-size: 1.12rem;
    color: var(--brand-ink);
  }

  .mini-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .mini-auth {
    background: linear-gradient(135deg, #ff6b35, #ff4f2c);
    color: #ffffff;
    border: 1px solid rgba(255, 79, 44, 0.5);
    padding: 10px 18px;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.92rem;
    box-shadow: 0 14px 30px rgba(255, 107, 53, 0.35);
  }

  .mini-auth.ghost {
    background: rgba(255, 255, 255, 0.95);
    color: var(--brand-ink);
    border: 1px solid rgba(255, 153, 109, 0.35);
    box-shadow: none;
  }

  .btn-primary,
  .btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 18px;
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #ff6b35, #ff4f2c);
    color: #fffaf7;
    border: 1px solid rgba(255, 107, 53, 0.4);
    box-shadow: 0 12px 26px rgba(255, 107, 53, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(37, 99, 235, 0.3);
  }

  .btn-ghost {
    border: 1px solid rgba(255, 153, 109, 0.35);
    color: var(--brand-ink);
    background: rgba(255, 255, 255, 0.95);
  }

  .btn-ghost:hover {
    transform: translateY(-1px);
  }

  .auth-modal {
    position: fixed;
    inset: 0;
    background:
      radial-gradient(800px 420px at 20% 10%, rgba(255, 107, 53, 0.28), transparent 60%),
      radial-gradient(800px 420px at 80% 20%, rgba(14, 165, 233, 0.22), transparent 60%),
      rgba(15, 23, 42, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1200;
    backdrop-filter: blur(8px);
  }

  .auth-modal-card {
    position: relative;
    width: min(520px, 100%);
  }

  .auth-modal-card .auth-container {
    margin: 0;
    max-width: none;
  }

  .auth-modal-close {
    position: absolute;
    top: -12px;
    right: -12px;
    background: #ffffff;
    border: 1px solid var(--brand-border);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-soft);
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

  .auth-header {
    display: grid;
    gap: 8px;
  }

  .auth-subtitle {
    margin: 0;
    color: var(--brand-muted);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .auth-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: var(--brand-surface-strong);
    border: 1px solid var(--brand-border);
  }

  .auth-switch button {
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--brand-ink-muted);
    font-weight: 600;
    box-shadow: none;
  }

  .auth-switch button.active {
    background: #ffffff;
    color: var(--brand-ink);
    border-color: var(--brand-border);
    box-shadow: var(--shadow-soft);
  }

  .auth-alert {
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .auth-alert--success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
  }

  .auth-alert--error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }

  .field-hint {
    margin: 6px 0 0;
    font-size: 0.82rem;
    color: var(--brand-muted);
  }

  .input-with-action {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .input-with-action input {
    flex: 1;
  }

  .input-action {
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid var(--brand-border);
    color: var(--brand-ink);
    border-radius: 10px;
    font-size: 0.85rem;
    box-shadow: none;
  }

  .auth-resend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: var(--brand-muted);
  }

  .link-button {
    padding: 0;
    background: transparent;
    border: none;
    color: var(--brand-accent);
    font-weight: 600;
    box-shadow: none;
  }

  .link-button:disabled {
    color: var(--brand-muted);
    cursor: not-allowed;
  }

  .auth-switch button:hover,
  .input-action:hover,
  .link-button:hover {
    transform: none;
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
    background: rgba(255, 255, 255, 0.98);
    padding: 32px;
    border-radius: calc(var(--radius-lg) + 2px);
    border: 1px solid rgba(255, 153, 109, 0.25);
    box-shadow: 0 28px 70px rgba(21, 24, 36, 0.12);
    position: relative;
  }

  .form-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    border-radius: inherit;
    background: linear-gradient(90deg, #ff6b35, #0ea5e9);
  }

  .form-section h2 {
    margin-top: 0;
    font-size: 1.7rem;
    color: var(--brand-ink);
    border-bottom: 2px solid var(--brand-border);
    padding-bottom: 10px;
  }

  .auth-callout {
    margin: 12px 0 16px;
    padding: 14px 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(14, 165, 233, 0.08));
    border: 1px solid rgba(255, 153, 109, 0.35);
    display: grid;
    gap: 6px;
  }

  .auth-callout-title {
    font-weight: 700;
    color: var(--brand-ink);
  }

  .auth-callout-text {
    font-size: 0.92rem;
    color: var(--brand-muted);
  }

  .auth-callout-link {
    color: var(--brand-accent);
    font-weight: 600;
    text-decoration: none;
    width: fit-content;
  }

  .auth-callout-link:hover {
    text-decoration: underline;
  }

  .builder-actions {
    margin: 10px 0 18px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .builder-actions .btn-ghost {
    background: rgba(148, 163, 184, 0.12);
    color: var(--brand-ink);
    border-color: var(--brand-border);
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
    padding: 10px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 241, 235, 0.85));
    border-radius: calc(var(--radius-md) + 4px);
    border: 1px solid rgba(255, 153, 109, 0.25);
    box-shadow: 0 26px 70px rgba(21, 24, 36, 0.14);
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
    background: rgba(255, 255, 255, 0.98);
    border-radius: calc(var(--radius-lg) + 2px);
    border: 1px solid rgba(255, 153, 109, 0.25);
    padding: 24px;
    box-shadow: 0 22px 60px rgba(21, 24, 36, 0.12);
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

  @media (max-width: 720px) {
    .mini-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .mini-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
