import PDFDocument from 'pdfkit';

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

const palette = {
  ink: '#0f172a',
  accent: '#c89b3c',
  textDark: '#0f172a',
  text: '#1f2937',
  muted: '#6b6458',
  light: '#e5e2dc',
  chipBg: '#f2e8d0',
  chipBorder: '#e2d3ae',
  chipText: '#7a5b1b',
  sidebarBg: '#f7f5f1'
};

const fonts = {
  body: 'Helvetica',
  bodyBold: 'Helvetica-Bold',
  sans: 'Helvetica',
  sansBold: 'Helvetica-Bold'
};

function sectionTitle(doc: PDFDocument, title: string, x: number, y: number, width: number) {
  doc
    .font(fonts.sansBold)
    .fontSize(10.8)
    .fillColor(palette.ink)
    .text(title.toUpperCase(), x, y, {
      width,
      characterSpacing: 1.2
    });

  const lineY = doc.y + 4;
  const accentWidth = 32;
  doc
    .moveTo(x, lineY)
    .lineTo(x + accentWidth, lineY)
    .lineWidth(1)
    .strokeColor(palette.accent)
    .stroke();

  doc
    .moveTo(x + accentWidth + 4, lineY)
    .lineTo(x + width, lineY)
    .lineWidth(1)
    .strokeColor(palette.light)
    .stroke();

  return lineY + 8;
}

function sidebarLine(
  doc: PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  const dotX = x + 2;
  const textX = x + 10;
  const labelWidth = 58;

  doc
    .font(fonts.sansBold)
    .fontSize(8.4)
    .fillColor(palette.ink);

  const lineHeight = doc.currentLineHeight();
  const dotY = y + lineHeight / 2 - 0.4;
  doc.circle(dotX, dotY, 1.6).fillColor(palette.accent).fill();

  doc.text(`${label.toUpperCase()}:`, textX, y, { width: labelWidth });
  doc
    .font(fonts.body)
    .fontSize(9.6)
    .fillColor(palette.muted)
    .text(value, textX + labelWidth, y, { width: width - labelWidth - 10, lineGap: 3.2 });

  return doc.y + 4;
}

function bulletLines(doc: PDFDocument, text: string, x: number, y: number, width: number) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletIndent = 12;
  doc.font(fonts.body).fontSize(10.4).fillColor(palette.text);
  lines.forEach((line, idx) => {
    if (idx === 0) {
      doc.text('•', x, y, { lineBreak: false });
      doc.text(line, x + bulletIndent, y, { width: width - bulletIndent, lineGap: 3.2 });
    } else {
      doc.text(line, x + bulletIndent, y, { width: width - bulletIndent, lineGap: 3.2 });
    }
    y = doc.y + 2;
  });

  return y + 6;
}


function paragraph(
  doc: PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  size = 11,
  color = palette.text
) {
  doc.font(fonts.body).fontSize(size).fillColor(color).text(text, x, y, { width, lineGap: 3.2 });
  return doc.y + 6;
}

function mutedLines(doc: PDFDocument, lines: string[], x: number, y: number, width: number) {
  doc.font(fonts.body).fontSize(9).fillColor(palette.muted);
  lines.forEach((line) => {
    doc.text(line, x, y, { width, lineGap: 2.5 });
    y = doc.y + 1.5;
  });
  return y + 3;
}

function drawChips(doc: PDFDocument, items: string[], x: number, y: number, width: number) {
  const paddingX = 8;
  const paddingY = 3;
  const chipHeight = 18;
  const gap = 6;
  let cursorX = x;
  let cursorY = y;

  doc.font(fonts.sansBold).fontSize(8.6);
  items.forEach((item) => {
    const textWidth = doc.widthOfString(item);
    const chipWidth = textWidth + paddingX * 2;

    if (cursorX + chipWidth > x + width) {
      cursorX = x;
      cursorY += chipHeight + gap;
    }

    doc
      .roundedRect(cursorX, cursorY, chipWidth, chipHeight, 7)
      .fillColor(palette.chipBg)
      .fill();

    doc
      .roundedRect(cursorX, cursorY, chipWidth, chipHeight, 7)
      .lineWidth(0.5)
      .strokeColor(palette.chipBorder)
      .stroke();

    doc
      .fillColor(palette.chipText)
      .fontSize(8.5)
      .text(item, cursorX + paddingX, cursorY + paddingY, { lineBreak: false });

    cursorX += chipWidth + gap;
  });

  return cursorY + chipHeight + 8;
}

export async function generateCvPdf(cv: CvData): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 56 });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
  });

  const fullName = `${cv.prenom || ''} ${cv.nom || ''}`.trim() || 'CV';
  const metier = cv.metier || '';
  const metierLabel = metier ? metier.toUpperCase() : '';

  const headerHeight = 128;
  const accentBarWidth = 18;
  doc.rect(0, 0, accentBarWidth, doc.page.height).fillColor(palette.ink).fill();

  const nameFontSize = 23;
  const namePaddingX = 20;
  const nameBoxHeight = 36;
  doc.font(fonts.bodyBold).fontSize(nameFontSize);
  const nameWidth = doc.widthOfString(fullName);
  const maxBoxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const nameBoxWidth = Math.min(nameWidth + namePaddingX * 2, maxBoxWidth);
  const centeredX = (doc.page.width - nameBoxWidth) / 2;
  const minX = doc.page.margins.left;
  const maxX = doc.page.width - doc.page.margins.right - nameBoxWidth;
  const nameBoxX = Math.max(minX, Math.min(centeredX, maxX));
  const nameBoxY = 30;

  const nameOuterPadding = 2;
  doc
    .roundedRect(
      nameBoxX - nameOuterPadding,
      nameBoxY - nameOuterPadding,
      nameBoxWidth + nameOuterPadding * 2,
      nameBoxHeight + nameOuterPadding * 2,
      7
    )
    .lineWidth(1)
    .strokeColor(palette.accent)
    .stroke();

  doc
    .roundedRect(nameBoxX, nameBoxY, nameBoxWidth, nameBoxHeight, 6)
    .fillColor(palette.ink)
    .fill();

  doc
    .roundedRect(nameBoxX, nameBoxY, nameBoxWidth, nameBoxHeight, 6)
    .lineWidth(1)
    .strokeColor(palette.ink)
    .stroke();

  doc
    .font(fonts.bodyBold)
    .fontSize(nameFontSize)
    .fillColor('#ffffff')
    .text(fullName, nameBoxX, nameBoxY + 8, {
    width: nameBoxWidth,
    align: 'center'
  });

  if (metierLabel) {
    doc
      .font(fonts.sans)
      .fontSize(11.2)
      .fillColor(palette.accent)
      .text(metierLabel, 0, nameBoxY + nameBoxHeight + 10, {
        width: doc.page.width,
        align: 'center'
      });
  }

  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  doc
    .moveTo(doc.page.margins.left, headerHeight + 2)
    .lineTo(doc.page.width - doc.page.margins.right, headerHeight + 2)
    .lineWidth(2)
    .strokeColor(palette.accent)
    .stroke();

  doc
    .moveTo(doc.page.margins.left, headerHeight + 6)
    .lineTo(doc.page.width - doc.page.margins.right, headerHeight + 6)
    .lineWidth(1)
    .strokeColor(palette.light)
    .stroke();

  const contentTop = headerHeight + 18;
  const sidebarWidth = 180;
  const columnGap = 24;
  const sidebarX = marginLeft;
  const mainX = sidebarX + sidebarWidth + columnGap;
  const mainWidth = doc.page.width - marginRight - mainX;

  doc
    .rect(
      sidebarX,
      headerHeight + 10,
      sidebarWidth,
      doc.page.height - headerHeight - doc.page.margins.bottom - 10
    )
    .fillColor(palette.sidebarBg)
    .fill();

  const dividerX = sidebarX + sidebarWidth + columnGap / 2;
  doc
    .moveTo(dividerX, contentTop - 6)
    .lineTo(dividerX, doc.page.height - doc.page.margins.bottom)
    .lineWidth(1)
    .strokeColor(palette.light)
    .stroke();

  let sidebarY = contentTop;
  let mainY = contentTop;

  const hasContact =
    !!cv.email || !!cv.tel || !!cv.adresse || !!cv.ville || !!cv.linkedin || !!cv.portfolio;

  if (hasContact) {
    sidebarY = sectionTitle(doc, 'Contact', sidebarX, sidebarY, sidebarWidth);
    if (cv.email) {
      sidebarY = sidebarLine(doc, 'Email', cv.email, sidebarX, sidebarY, sidebarWidth);
    }
    if (cv.tel) {
      sidebarY = sidebarLine(doc, 'Tel', cv.tel, sidebarX, sidebarY, sidebarWidth);
    }
    if (cv.adresse || cv.ville) {
      const addressValue = `${cv.adresse || ''} ${cv.ville || ''}`.trim();
      sidebarY = sidebarLine(doc, 'Adresse', addressValue, sidebarX, sidebarY, sidebarWidth);
    }
    if (cv.linkedin) {
      sidebarY = sidebarLine(doc, 'LinkedIn', cv.linkedin, sidebarX, sidebarY, sidebarWidth);
    }
    if (cv.portfolio) {
      sidebarY = sidebarLine(doc, 'Portfolio', cv.portfolio, sidebarX, sidebarY, sidebarWidth);
    }
    sidebarY += 8;
  }

  if (cv.competences && cv.competences.length > 0) {
    sidebarY = sectionTitle(doc, 'Competences', sidebarX, sidebarY, sidebarWidth);
    sidebarY = drawChips(doc, cv.competences, sidebarX, sidebarY, sidebarWidth);
  }

  if (cv.langues || cv.permis) {
    sidebarY = sectionTitle(doc, 'Infos', sidebarX, sidebarY, sidebarWidth);
    if (cv.langues) {
      sidebarY = sidebarLine(doc, 'Langues', cv.langues, sidebarX, sidebarY, sidebarWidth);
    }
    if (cv.permis) {
      sidebarY = sidebarLine(doc, 'Permis', cv.permis, sidebarX, sidebarY, sidebarWidth);
    }
  }

  if (cv.presentation) {
    mainY = sectionTitle(doc, 'A propos', mainX, mainY, mainWidth);
    mainY = paragraph(doc, cv.presentation, mainX, mainY, mainWidth, 11.2, palette.text);
  }

  if (cv.experiences && cv.experiences.length > 0) {
    const experiences = cv.experiences.filter(
      (exp) => exp.poste || exp.entreprise || exp.debut || exp.fin || exp.description
    );
    if (experiences.length > 0) {
      mainY = sectionTitle(doc, 'Experiences professionnelles', mainX, mainY, mainWidth);
      experiences.forEach((exp, index) => {
        if (index > 0) mainY += 4;
        const titleLine = [exp.poste, exp.entreprise].filter(Boolean).join(' - ');
        const dateLine = [exp.debut, exp.fin].filter(Boolean).join(' - ');

        const dateColumnWidth = 90;
        const gap = 8;
        const titleColumnWidth = Math.max(mainWidth - dateColumnWidth - gap, 120);
        const dateX = mainX + titleColumnWidth + gap;
        const rowStartY = mainY;
        let afterTitleY = rowStartY;
        let afterDateY = rowStartY;

        if (titleLine || dateLine) {
          const markerSize = 4;
          doc
            .rect(mainX - 8, rowStartY + 2, markerSize, markerSize)
            .fillColor(palette.accent)
            .fill();
        }
        if (titleLine) {
          doc
            .font(fonts.sansBold)
            .fontSize(11)
            .fillColor(palette.textDark)
            .text(titleLine, mainX, rowStartY, { width: titleColumnWidth, lineGap: 3.2 });
          afterTitleY = doc.y;
        }
        if (dateLine) {
          doc
            .font(fonts.sans)
            .fontSize(9.2)
            .fillColor(palette.muted)
            .text(dateLine, dateX, rowStartY, { width: dateColumnWidth, align: 'right' });
          afterDateY = doc.y;
        }
        mainY = Math.max(afterTitleY, afterDateY) + 3;
        if (exp.description) {
          mainY = bulletLines(doc, exp.description, mainX, mainY, mainWidth);
        }
      });
    }
  }

  if (cv.formations && cv.formations.length > 0) {
    const formations = cv.formations.filter(
      (form) => form.diplome || form.etablissement || form.debut || form.fin
    );
    if (formations.length > 0) {
      mainY = sectionTitle(doc, 'Formations', mainX, mainY, mainWidth);
      formations.forEach((form, index) => {
        if (index > 0) mainY += 4;
        const titleLine = [form.diplome, form.etablissement].filter(Boolean).join(' - ');
        const dateLine = [form.debut, form.fin].filter(Boolean).join(' - ');

        const dateColumnWidth = 90;
        const gap = 8;
        const titleColumnWidth = Math.max(mainWidth - dateColumnWidth - gap, 120);
        const dateX = mainX + titleColumnWidth + gap;
        const rowStartY = mainY;
        let afterTitleY = rowStartY;
        let afterDateY = rowStartY;

        if (titleLine || dateLine) {
          const markerSize = 4;
          doc
            .rect(mainX - 8, rowStartY + 2, markerSize, markerSize)
            .fillColor(palette.accent)
            .fill();
        }
        if (titleLine) {
          doc
            .font(fonts.sansBold)
            .fontSize(11)
            .fillColor(palette.textDark)
            .text(titleLine, mainX, rowStartY, { width: titleColumnWidth, lineGap: 3.2 });
          afterTitleY = doc.y;
        }
        if (dateLine) {
          doc
            .font(fonts.sans)
            .fontSize(9.2)
            .fillColor(palette.muted)
            .text(dateLine, dateX, rowStartY, { width: dateColumnWidth, align: 'right' });
          afterDateY = doc.y;
        }
        mainY = Math.max(afterTitleY, afterDateY) + 3;
      });
    }
  }

  doc.end();
  return pdfPromise;
}
