import { chromium as playwrightChromium } from 'playwright-core';
import cvPreviewCss from '$lib/assets/cv-preview.css?inline';

type Experience = {
  poste: string;
  entreprise: string;
  debut: string;
  fin: string;
  description?: string;
};

type Formation = {
  diplome: string;
  etablissement: string;
  debut: string;
  fin: string;
};

export type CvData = {
  nom?: string;
  prenom?: string;
  metier?: string;
  tel?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  linkedin?: string;
  portfolio?: string;
  presentation?: string;
  experiences?: Experience[];
  formations?: Formation[];
  competences?: string[];
  langues?: string;
  permis?: string;
};

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLines(text?: string) {
  if (!text) return '';
  return escapeHtml(text).replace(/\n/g, '<br />');
}

function renderLine(label: string, value?: string) {
  if (!value) return '';
  return `
    <div class="cv-contact-item">
      <span class="cv-dot"></span>
      <span class="cv-label">${escapeHtml(label)}</span>
      <span class="cv-value">${escapeHtml(value)}</span>
    </div>
  `;
}

function renderCompetences(competences: string[]) {
  if (competences.length === 0) return '';
  return `
    <div class="cv-section cv-section--sidebar">
      <h3>Competences</h3>
      <div class="cv-competences">
        ${competences.map((comp) => `<div class="cv-competence-tag">${escapeHtml(comp)}</div>`).join('')}
      </div>
    </div>
  `;
}

function renderExperiences(experiences: Experience[]) {
  const items = experiences.filter((exp) => exp.poste || exp.entreprise || exp.debut || exp.fin || exp.description);
  if (items.length === 0) return '';

  const itemsHtml = items
    .map((exp) => {
      const title = [exp.poste, exp.entreprise].filter(Boolean).join(' - ');
      const dates = [exp.debut, exp.fin].filter(Boolean).join(' - ');
      const descriptionLines = (exp.description || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const className = idx === 0 ? 'cv-exp-line--bullet' : 'cv-exp-subline';
          return `<div class="cv-exp-line ${className}">${escapeHtml(line)}</div>`;
        })
        .join('');

      return `
        <div class="cv-experience-item">
          ${
            title || dates
              ? `
            <div class="cv-exp-header">
              ${title ? `<div class="cv-exp-title">${escapeHtml(title)}</div>` : ''}
              ${dates ? `<div class="cv-exp-dates">${escapeHtml(dates)}</div>` : ''}
            </div>
          `
              : ''
          }
          ${descriptionLines ? `<div class="cv-exp-description">${descriptionLines}</div>` : ''}
        </div>
      `;
    })
    .join('');

  return `
    <div class="cv-section">
      <h3>Experiences professionnelles</h3>
      ${itemsHtml}
    </div>
  `;
}

function renderFormations(formations: Formation[]) {
  const items = formations.filter((form) => form.diplome || form.etablissement || form.debut || form.fin);
  if (items.length === 0) return '';

  const itemsHtml = items
    .map((form) => {
      const title = [form.diplome, form.etablissement].filter(Boolean).join(' - ');
      const dates = [form.debut, form.fin].filter(Boolean).join(' - ');
      return `
        <div class="cv-formation-item">
          <div class="cv-exp-header">
            ${title ? `<div class="cv-exp-title">${escapeHtml(title)}</div>` : ''}
            ${dates ? `<div class="cv-exp-dates">${escapeHtml(dates)}</div>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="cv-section">
      <h3>Formations</h3>
      ${itemsHtml}
    </div>
  `;
}

function renderCvHtml(cv: CvData) {
  const fullName = `${cv.prenom || ''} ${cv.nom || ''}`.trim() || 'CV';
  const hasContact =
    !!cv.email || !!cv.tel || !!cv.adresse || !!cv.ville || !!cv.linkedin || !!cv.portfolio;
  const competences = (cv.competences || []).filter(Boolean);
  const experiences = cv.experiences || [];
  const formations = cv.formations || [];

  const contactHtml = hasContact
    ? `
      <div class="cv-section cv-section--sidebar">
        <h3>Contact</h3>
        <div class="cv-contact-list">
          ${renderLine('Email', cv.email)}
          ${renderLine('Tel', cv.tel)}
          ${renderLine('Adresse', [cv.adresse, cv.ville].filter(Boolean).join(' ') || '')}
          ${renderLine('LinkedIn', cv.linkedin)}
          ${renderLine('Portfolio', cv.portfolio)}
        </div>
      </div>
    `
    : '';

  const infosHtml =
    cv.langues || cv.permis
      ? `
        <div class="cv-section cv-section--sidebar">
          <h3>Infos</h3>
          ${cv.langues ? renderLine('Langues', cv.langues) : ''}
          ${cv.permis ? renderLine('Permis', cv.permis) : ''}
        </div>
      `
      : '';

  const presentationHtml = cv.presentation
    ? `
      <div class="cv-section">
        <h3>A propos</h3>
        <div class="cv-presentation">${formatLines(cv.presentation)}</div>
      </div>
    `
    : '';

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>
          @page { size: A4; margin: 0; }
          html, body { margin: 0; padding: 0; background: #ffffff; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ${cvPreviewCss}
        </style>
      </head>
      <body>
        <div class="cv-preview">
          <div class="cv-header">
            <h2>${escapeHtml(fullName)}</h2>
            ${cv.metier ? `<div class="cv-metier">${escapeHtml(cv.metier)}</div>` : ''}
          </div>
          <div class="cv-body">
            <div class="cv-sidebar-bg" aria-hidden="true"></div>
            <div class="cv-divider" aria-hidden="true"></div>
            <div class="cv-layout">
              <aside class="cv-sidebar">
                ${contactHtml}
                ${renderCompetences(competences)}
                ${infosHtml}
              </aside>
              <section class="cv-main">
                ${presentationHtml}
                ${renderExperiences(experiences)}
                ${renderFormations(formations)}
              </section>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function generateCvPdf(cv: CvData): Promise<Buffer> {
  const html = renderCvHtml(cv);
  if (!process.env.AWS_EXECUTION_ENV && !process.env.AWS_LAMBDA_JS_RUNTIME) {
    process.env.AWS_LAMBDA_JS_RUNTIME = 'nodejs20.x';
  }
  process.env.FONTCONFIG_PATH ??= '/tmp/fonts';
  const lambdaLibPath = '/tmp/al2023/lib';
  const lambdaLibPathFallback = '/tmp/al2/lib';
  const libPaths = [lambdaLibPath, lambdaLibPathFallback, process.env.LD_LIBRARY_PATH]
    .filter(Boolean)
    .join(':');
  process.env.LD_LIBRARY_PATH = libPaths;

  const { default: chromium } = await import('@sparticuz/chromium');
  chromium.setHeadlessMode = true;
  const executablePath = (await chromium.executablePath()) || process.env.CHROME_EXECUTABLE_PATH;

  if (!executablePath) {
    throw new Error('Chrome executable path not found. Set CHROME_EXECUTABLE_PATH for local dev.');
  }

  const browser = await playwrightChromium.launch({
    args: chromium.args,
    executablePath,
    headless: true,
    env: {
      ...process.env,
      LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH,
      FONTCONFIG_PATH: process.env.FONTCONFIG_PATH
    }
  });

  try {
    const page = await browser.newPage({
      viewport: chromium.defaultViewport || { width: 1240, height: 1754 }
    });

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.documentElement.style.background = '#ffffff';
    });
    if ('emulateMediaType' in page) {
      await (page as any).emulateMediaType('screen');
    }
    await page.evaluateHandle('document.fonts?.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await page.close();
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
