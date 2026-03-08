<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Define a proper type for cvData (replace 'any' for better type safety)
  interface CvData {
    prenom: string;
    nom: string;
    metier: string;
    email?: string;
    tel?: string;
    adresse?: string;
    ville?: string;
    linkedin?: string;
    portfolio?: string;
    presentation?: string;
    competences?: string[];
    experiences?: Array<{
      poste: string;
      debut: string;
      fin: string;
      entreprise: string;
      description?: string;
    }>;
    formations?: Array<{
      diplome: string;
      debut: string;
      fin: string;
      etablissement: string;
    }>;
    langues?: string;
    permis?: string;
  }

  export let cvData: CvData;
  const dispatch = createEventDispatcher<{ close: void }>();  // Type the dispatched event

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      dispatch('close');
    }
  }
</script>

<div 
  class="modal-overlay" 
  role="button" 
  aria-label="Fermer la modal" 
  tabindex="0" 
  on:click={() => dispatch('close')} 
  on:keydown={handleKeydown}
>
  <div class="modal-content" on:click|stopPropagation on:keydown={() => {}} role="dialog" aria-modal="true" tabindex="-1">
    <button class="close-btn" on:click={() => dispatch('close')} aria-label="Fermer la modal">&times;</button>
    
    <div class="cv-preview">
      <div class="cv-header">
        <h2>{(cvData.prenom || cvData.nom) ? `${cvData.prenom} ${cvData.nom}`.trim() : 'CV'}</h2>
        {#if cvData.metier}
          <div class="cv-metier">{cvData.metier}</div>
        {/if}
      </div>

      <div class="cv-body">
        <div class="cv-sidebar-bg" aria-hidden="true"></div>
        <div class="cv-divider" aria-hidden="true"></div>
        <div class="cv-layout">
        <aside class="cv-sidebar">
          {#if cvData.email || cvData.tel || cvData.adresse || cvData.ville || cvData.linkedin || cvData.portfolio}
            <div class="cv-section cv-section--sidebar">
              <h3>Contact</h3>
              <div class="cv-contact-list">
                {#if cvData.email}
                  <div class="cv-contact-item">
                    <span class="cv-dot"></span>
                    <span class="cv-label">Email</span>
                    <span class="cv-value">{cvData.email}</span>
                  </div>
                {/if}
                {#if cvData.tel}
                  <div class="cv-contact-item">
                    <span class="cv-dot"></span>
                    <span class="cv-label">Tel</span>
                    <span class="cv-value">{cvData.tel}</span>
                  </div>
                {/if}
                {#if cvData.adresse || cvData.ville}
                  <div class="cv-contact-item">
                    <span class="cv-dot"></span>
                    <span class="cv-label">Adresse</span>
                    <span class="cv-value">{cvData.adresse} {cvData.ville}</span>
                  </div>
                {/if}
                {#if cvData.linkedin}
                  <div class="cv-contact-item">
                    <span class="cv-dot"></span>
                    <span class="cv-label">LinkedIn</span>
                    <span class="cv-value">{cvData.linkedin}</span>
                  </div>
                {/if}
                {#if cvData.portfolio}
                  <div class="cv-contact-item">
                    <span class="cv-dot"></span>
                    <span class="cv-label">Portfolio</span>
                    <span class="cv-value">{cvData.portfolio}</span>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          {#if cvData.competences && cvData.competences.length > 0}
            <div class="cv-section cv-section--sidebar">
              <h3>Competences</h3>
              <div class="cv-competences">
                {#each cvData.competences as comp}
                  <div class="cv-competence-tag">{comp}</div>
                {/each}
              </div>
            </div>
          {/if}

          {#if cvData.langues || cvData.permis}
            <div class="cv-section cv-section--sidebar">
              <h3>Infos</h3>
              {#if cvData.langues}
                <div class="cv-contact-item">
                  <span class="cv-dot"></span>
                  <span class="cv-label">Langues</span>
                  <span class="cv-value">{cvData.langues}</span>
                </div>
              {/if}
              {#if cvData.permis}
                <div class="cv-contact-item">
                  <span class="cv-dot"></span>
                  <span class="cv-label">Permis</span>
                  <span class="cv-value">{cvData.permis}</span>
                </div>
              {/if}
            </div>
          {/if}
        </aside>

        <section class="cv-main">
          {#if cvData.presentation}
            <div class="cv-section">
              <h3>A propos</h3>
              <div class="cv-presentation">{cvData.presentation}</div>
            </div>
          {/if}

          {#if cvData.experiences && cvData.experiences.length > 0}
            <div class="cv-section">
              <h3>Experiences professionnelles</h3>
              {#each cvData.experiences as exp}
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

          {#if cvData.formations && cvData.formations.length > 0}
            <div class="cv-section">
              <h3>Formations</h3>
              {#each cvData.formations as form}
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

<style>
  @import './cv-preview.css';

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(1200px circle at 15% 10%, rgba(37, 99, 235, 0.35), transparent 58%),
      radial-gradient(900px circle at 90% 20%, rgba(14, 165, 233, 0.3), transparent 60%),
      rgba(6, 10, 22, 0.82);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
    border-radius: 24px;
    max-width: 960px;
    width: 95%;
    max-height: 94vh;
    overflow: auto;
    box-shadow: 0 24px 70px rgba(2, 6, 23, 0.45);
    position: relative;
    padding: 18px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    animation: slideUp 0.3s ease-out;
  }

  .modal-content .cv-preview {
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.45);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    color: #0f172a;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
  }

  .close-btn:hover {
    background: #ffffff;
    transform: translateY(-1px) rotate(90deg);
  }

  /* Scrollbar personnalisee */
  .modal-content::-webkit-scrollbar {
    width: 10px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: #2563eb;
    border-radius: 10px;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: #1d4ed8;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .close-btn {
      top: 10px;
      right: 10px;
      width: 35px;
      height: 35px;
      font-size: 1.2rem;
    }
  }
</style>






