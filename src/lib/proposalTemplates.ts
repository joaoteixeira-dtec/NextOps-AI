import type { ProductKey, CompanyProfile, ProposalItem } from "./types";
import { PRODUCTS, MODULES, SECTORS } from "./pricingEngine";

/* ═══════════════════════ Proposal Text Templates ═══════════════════════ */

function getSectorLabel(value: string): string {
  return SECTORS.find((s) => s.value === value)?.label ?? value;
}

function getModuleTitles(keys: string[]): string[] {
  return keys.map((k) => MODULES.find((m) => m.key === k)?.title ?? k);
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
}

/* ───────── Full Document Sections ───────── */

export function buildProposalDocument(opts: {
  product: ProductKey;
  profile: CompanyProfile;
  modules: string[];
  items: ProposalItem[];
  total: number;
  sprints: number;
  validUntil: string;
  paymentTermsLabel: string;
  notes?: string;
}) {
  const { product, profile, modules, items, total, sprints, validUntil, paymentTermsLabel, notes } = opts;
  const productInfo = PRODUCTS.find((p) => p.key === product)!;
  const sectorLabel = getSectorLabel(profile.sector);
  const moduleTitles = getModuleTitles(modules);

  const header = {
    title: `Proposta Comercial — ${productInfo.title}`,
    subtitle: `Preparada para ${profile.companyName}`,
    date: formatDate(new Date().toISOString()),
    refNif: profile.nif,
  };

  const intro = buildIntro(profile, sectorLabel, productInfo.title);
  const context = buildContext(profile, sectorLabel);
  const solution = buildSolution(product, productInfo.title, moduleTitles, sprints);
  const pricing = buildPricingSection(items, total, paymentTermsLabel);
  const conditions = buildConditions(validUntil, sprints);
  const closing = buildClosing(profile.companyName, notes);

  return { header, intro, context, solution, pricing, conditions, closing };
}

function buildIntro(profile: CompanyProfile, sector: string, productTitle: string): string {
  return `Exmo(a) Senhor(a),

Temos o prazer de apresentar a presente proposta comercial à empresa ${profile.companyName}, NIF ${profile.nif}, que atua no setor de ${sector}.

Após análise das necessidades identificadas, propomos a implementação da solução ${productTitle}, desenhada especificamente para responder aos desafios operacionais da vossa organização e potenciar a eficiência dos processos internos.`;
}

function buildContext(profile: CompanyProfile, sector: string): string {
  const depts = profile.departments.length > 0
    ? `Os departamentos com maior necessidade de intervenção são: ${profile.departments.join(", ")}.`
    : "";

  const specifics = profile.specificities
    ? `\n\nForam identificadas as seguintes especificidades: ${profile.specificities}`
    : "";

  return `CONTEXTO & DIAGNÓSTICO

A ${profile.companyName} é uma empresa do setor de ${sector} com ${profile.employees} colaboradores. ${depts}

O interesse principal identificado é: ${profile.mainInterest.replace(/_/g, " ")}.${specifics}`;
}

function buildSolution(product: ProductKey, productTitle: string, moduleTitles: string[], sprints: number): string {
  if (product === "diagnostico") {
    return `SOLUÇÃO PROPOSTA

Propomos a realização de um Diagnóstico Operacional completo, que inclui:
• Mapeamento de processos atuais
• Identificação de 3 gargalos operacionais
• Proposta de 3 automações prioritárias
• Plano de ação detalhado com estimativa de ROI

Este diagnóstico é realizado sem qualquer custo e permite à vossa equipa ter uma visão clara das oportunidades de melhoria.`;
  }

  const modulesList = moduleTitles.map((m) => `• ${m}`).join("\n");

  return `SOLUÇÃO PROPOSTA

Propomos a implementação da solução ${productTitle}, organizada por sprints de implementação progressiva. A solução inclui:

${modulesList}

A implementação está estimada em ${sprints} sprint(s), com acompanhamento contínuo e formação da equipa ao longo de todo o processo. Cada sprint inclui configuração, testes e validação antes de avançar para o próximo.`;
}

function buildPricingSection(items: ProposalItem[], total: number, paymentTermsLabel: string): string {
  const lines = items.map((it) =>
    `• ${it.description}: ${it.quantity}x ${formatCurrency(it.unitPrice)} = ${formatCurrency(it.total)}`
  ).join("\n");

  return `INVESTIMENTO

${lines}

TOTAL: ${formatCurrency(total)}

Condições de pagamento: ${paymentTermsLabel}`;
}

function buildConditions(validUntil: string, sprints: number): string {
  return `CONDIÇÕES GERAIS

• Esta proposta é válida até ${formatDate(validUntil)}.
• O prazo estimado de implementação é de ${sprints} sprint(s) (semanas).
• Inclui suporte técnico durante 30 dias após conclusão.
• Formação de utilizadores incluída.
• Todas as configurações são realizadas de acordo com as melhores práticas de segurança e RGPD.
• Os valores apresentados não incluem IVA à taxa legal em vigor (23%).`;
}

function buildClosing(companyName: string, notes?: string): string {
  const notesBlock = notes ? `\nNotas adicionais: ${notes}\n` : "";

  return `${notesBlock}
Ficamos inteiramente ao dispor para esclarecer qualquer questão e agendar uma reunião de apresentação detalhada.

Agradecemos a confiança depositada na NextOps e estamos empenhados em contribuir para o sucesso operacional da ${companyName}.

Com os melhores cumprimentos,
Equipa NextOps
info@nextops.pt | www.nextops.pt`;
}

/* ═══════════════════════ PDF Generation ═══════════════════════ */

export async function generateProposalPDF(opts: Parameters<typeof buildProposalDocument>[0]): Promise<Blob> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const data = buildProposalDocument(opts);

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // ── Header Bar ──
  doc.setFillColor(15, 23, 42); // ink-900 equivalent
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFillColor(79, 70, 229); // accent blue bar
  doc.rect(0, 45, pageWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("NEXTOPS", margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Automação & Inteligência Operacional", margin, 25);

  doc.setFontSize(9);
  doc.text(`Data: ${data.header.date}`, pageWidth - margin, 18, { align: "right" });
  doc.text(`NIF Cliente: ${data.header.refNif}`, pageWidth - margin, 25, { align: "right" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(data.header.title, margin, 37);

  y = 55;
  doc.setTextColor(30, 41, 59);

  // ── Intro ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const introLines = doc.splitTextToSize(data.intro, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 8;

  // ── Context ──
  y = addSection(doc, data.context, margin, y, contentWidth);

  // ── Solution ──
  y = addSection(doc, data.solution, margin, y, contentWidth);

  // ── Pricing Table ──
  if (y > 200) { doc.addPage(); y = 20; }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("INVESTIMENTO", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Descrição", "Qtd", "Preço Unit.", "Total"]],
    body: opts.items.map((it) => [
      it.description,
      it.quantity.toString(),
      formatCurrency(it.unitPrice),
      formatCurrency(it.total),
    ]),
    foot: [["", "", "TOTAL", formatCurrency(opts.total)]],
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    theme: "grid",
    styles: { cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.3 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text(`Condições de pagamento: ${opts.paymentTermsLabel}`, margin, y);
  y += 10;

  // ── Conditions ──
  if (y > 230) { doc.addPage(); y = 20; }
  y = addSection(doc, data.conditions, margin, y, contentWidth);

  // ── Closing ──
  if (y > 220) { doc.addPage(); y = 20; }
  y = addSection(doc, data.closing, margin, y, contentWidth);

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `NextOps — Proposta Comercial | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
    // Bottom accent line
    doc.setFillColor(79, 70, 229);
    doc.rect(0, doc.internal.pageSize.getHeight() - 3, pageWidth, 3, "F");
  }

  return doc.output("blob");
}

function addSection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  text: string,
  margin: number,
  startY: number,
  contentWidth: number
): number {
  let y = startY;
  const lines = text.split("\n");

  for (const line of lines) {
    if (y > 270) { doc.addPage(); y = 20; }

    const isHeader = line === line.toUpperCase() && line.trim().length > 3 && !line.startsWith("•");
    const isBullet = line.trim().startsWith("•");

    if (isHeader) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      y += 3;
    } else if (isBullet) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
    }

    const wrapped = doc.splitTextToSize(line, isBullet ? contentWidth - 5 : contentWidth);
    doc.text(wrapped, isBullet ? margin + 3 : margin, y);
    y += wrapped.length * 4.5;

    if (isHeader) y += 2;
  }

  return y + 4;
}
