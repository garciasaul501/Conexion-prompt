import { jsPDF } from 'jspdf';
import { Prompt, OptimizedPromptResponse } from '../types';

/**
 * Cleans text for standard PDF fonts (WinAnsi / Latin-1 compatible)
 * Preserves Spanish accents (á, é, í, ó, ú, ñ, ü, ¿, ¡) while removing unsupported emojis.
 */
function cleanPdfText(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[•]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x00-\xFF]/g, '')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Generates and downloads a single Prompt (and optional AI execution result) as a PDF file.
 */
export function downloadPromptAsPdf(
  prompt: Prompt,
  compiledPromptText?: string,
  executionOutput?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
  };

  // Top Header Banner
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('CONEXION PROMPTS - BIBLIOTECA PROFESIONAL IA', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text(
    cleanPdfText(`Modelo recomendado: ${prompt.recommendedModel}  |  Autor: ${prompt.authorName}  |  Fecha: ${prompt.createdAt}`),
    margin + 6,
    y + 16
  );

  y += 30;

  // Prompt Title
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  const titleLines = doc.splitTextToSize(cleanPdfText(prompt.title), contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6.5 + 2;

  // Tags & Metadata
  if (prompt.tags && prompt.tags.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber-700
    const tagsLine = prompt.tags.map((t) => `#${cleanPdfText(t)}`).join('   ');
    doc.text(tagsLine, margin, y);
    y += 6;
  }

  // Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate-600
  const descLines = doc.splitTextToSize(cleanPdfText(prompt.description), contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 6;

  // Variables Section
  if (prompt.variables && prompt.variables.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`VARIABLES DINAMICAS (${prompt.variables.length})`, margin + 4, y + 5.5);
    y += 13;

    prompt.variables.forEach((v) => {
      const varText = `• {{${cleanPdfText(v.name)}}} (${cleanPdfText(v.label)}): ${cleanPdfText(v.defaultValue || v.placeholder || 'Personalizable')}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const varLines = doc.splitTextToSize(varText, contentWidth - 4);
      checkPageBreak(varLines.length * 4.5 + 3);
      doc.text(varLines, margin + 2, y);
      y += varLines.length * 4.5 + 2;
    });

    y += 4;
  }

  // Prompt Template Box
  const promptBody = cleanPdfText(compiledPromptText || prompt.templateContent);
  const bodyLines = doc.splitTextToSize(promptBody, contentWidth - 8);

  checkPageBreak(16);
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(251, 191, 36); // Amber-400
  doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(146, 64, 14);
  doc.text(
    compiledPromptText ? 'PROMPT ENSAMBLADO LISTO PARA USAR' : 'PLANTILLA COMPLETA DEL PROMPT',
    margin + 4,
    y + 5.5
  );
  y += 12;

  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  bodyLines.forEach((line: string) => {
    checkPageBreak(5.5);
    doc.text(line, margin + 4, y);
    y += 4.8;
  });

  y += 6;

  // Optional AI Execution Output
  if (executionOutput) {
    checkPageBreak(20);
    doc.setFillColor(209, 250, 229); // Emerald-100
    doc.setDrawColor(52, 211, 153); // Emerald-400
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 95, 70);
    doc.text('RESPUESTA GENERADA POR IA', margin + 4, y + 5.5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const outLines = doc.splitTextToSize(cleanPdfText(executionOutput), contentWidth - 6);
    outLines.forEach((line: string) => {
      checkPageBreak(5.5);
      doc.text(line, margin + 3, y);
      y += 5;
    });
  }

  // Page Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Conexion Prompts IA - whop.com/woop-conexion/  |  Pagina ${i} de ${totalPages}`,
      margin,
      pageHeight - 8
    );
  }

  const filename = `prompt-${slugify(prompt.title || 'ia')}.pdf`;
  doc.save(filename);
}

/**
 * Generates and downloads a complete Catalog of Prompts as a PDF file.
 */
export function downloadPromptsCatalogPdf(
  prompts: Prompt[],
  catalogTitle = 'Catalogo Completo de Prompts Profesionales con IA'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  // Cover / Header Banner
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CONEXION PROMPTS - CATALOGO OFICIAL PDF', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(224, 231, 255);
  doc.text(
    cleanPdfText(`${catalogTitle} (${prompts.length} Prompts Incluidos)`),
    margin + 6,
    y + 18
  );

  y += 34;

  prompts.forEach((prompt, index) => {
    checkPageBreak(45);

    // Prompt Header Bar
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const headerTitle = `${index + 1}. ${cleanPdfText(prompt.title)}`;
    const headerLines = doc.splitTextToSize(headerTitle, contentWidth - 8);
    doc.text(headerLines[0], margin + 4, y + 6.5);
    y += 14;

    // Description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const descLines = doc.splitTextToSize(cleanPdfText(prompt.description), contentWidth - 4);
    doc.text(descLines, margin + 2, y);
    y += descLines.length * 4.5 + 3;

    // Variables summary
    if (prompt.variables.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      const varsInline =
        'Variables: ' +
        prompt.variables.map((v) => `{{${cleanPdfText(v.name)}}}`).join(', ');
      const varLines = doc.splitTextToSize(varsInline, contentWidth - 4);
      checkPageBreak(varLines.length * 4.5 + 2);
      doc.text(varLines, margin + 2, y);
      y += varLines.length * 4.5 + 3;
    }

    // Template Content
    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const templateLines = doc.splitTextToSize(
      cleanPdfText(prompt.templateContent),
      contentWidth - 6
    );

    templateLines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin + 3, y);
      y += 4.3;
    });

    y += 8;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Conexion Prompts IA - Catalogo PDF  |  Pagina ${i} de ${totalPages}`,
      margin,
      pageHeight - 8
    );
  }

  doc.save('catalogo-prompts-ia-conexion.pdf');
}

/**
 * Downloads an optimized prompt from the Optimizer page as a PDF.
 */
export function downloadOptimizedPromptAsPdf(result: OptimizedPromptResponse): void {
  const tempPrompt: Prompt = {
    id: `opt-${Date.now()}`,
    title: result.title,
    description: result.description,
    templateContent: result.optimizedPrompt,
    variables: result.variables,
    isPremium: false,
    categoryId: result.categorySuggested,
    recommendedModel: 'gemini-3.7-flash',
    authorName: 'Optimizador IA - Conexion Prompts',
    authorAvatar: '',
    usesCount: 1,
    rating: 5.0,
    tags: result.tags,
    createdAt: new Date().toISOString().split('T')[0],
  };

  downloadPromptAsPdf(tempPrompt);
}
