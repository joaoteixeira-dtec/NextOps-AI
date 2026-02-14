import type { ProductKey, CompanyProfile, ProposalItem } from "./types";

/* ═══════════════════════ Product Catalog ═══════════════════════ */

export type ProductInfo = {
  key: ProductKey;
  title: string;
  description: string;
  basePrice: number;          // 0 = gratuito
  sprintsBase: number;        // semanas estimadas base
  icon: string;               // lucide icon name
  highlight?: boolean;
};

export const PRODUCTS: ProductInfo[] = [
  {
    key: "diagnostico",
    title: "Diagnóstico Operacional",
    description: "Mapa de ganhos rápidos, identificação de 3 gargalos e 3 automações prioritárias. Proposta de sprint incluída.",
    basePrice: 0,
    sprintsBase: 1,
    icon: "Search",
    highlight: true,
  },
  {
    key: "erp_core",
    title: "ERP Core",
    description: "Módulos essenciais a funcionar, equipa alinhada. Permissões, auditoria, dashboards e exports.",
    basePrice: 4500,
    sprintsBase: 3,
    icon: "Boxes",
  },
  {
    key: "erp_ia",
    title: "ERP + IA",
    description: "Automação real com inteligência artificial. Leitura de documentos, assistente interno, triagem e resumos automáticos.",
    basePrice: 7500,
    sprintsBase: 4,
    icon: "Wand2",
  },
  {
    key: "modulo_avulso",
    title: "Módulo Avulso",
    description: "Módulo individual para necessidades específicas: pipeline, stock, encomendas, rotas, suporte ou dashboards.",
    basePrice: 1500,
    sprintsBase: 1,
    icon: "Puzzle",
  },
];

/* ═══════════════════════ Available Modules ═══════════════════════ */

export type ModuleInfo = {
  key: string;
  title: string;
  price: number;
  sprints: number;
  sectors: string[];       // setores onde é mais relevante
  interests: string[];     // interesses que este módulo resolve
};

export const MODULES: ModuleInfo[] = [
  { key: "pipeline",    title: "Pipeline & Tarefas",     price: 1200, sprints: 1, sectors: ["servicos", "tecnologia", "consultoria"], interests: ["automatizar_processos", "visibilidade"] },
  { key: "stock",       title: "Produtos & Stock",       price: 1400, sprints: 1, sectors: ["retalho", "industria", "logistica", "alimentar"], interests: ["reduzir_custos", "automatizar_processos"] },
  { key: "encomendas",  title: "Encomendas",             price: 1300, sprints: 1, sectors: ["retalho", "logistica", "industria", "alimentar"], interests: ["automatizar_processos", "crescimento"] },
  { key: "clientes",    title: "Clientes & Equipas",     price: 900,  sprints: 1, sectors: ["servicos", "retalho", "saude", "tecnologia", "consultoria"], interests: ["visibilidade", "conformidade"] },
  { key: "rotas",       title: "Rotas & Operações",      price: 1500, sprints: 1, sectors: ["logistica", "transportes", "alimentar"], interests: ["reduzir_custos", "automatizar_processos"] },
  { key: "suporte",     title: "Suporte & Tickets",      price: 1100, sprints: 1, sectors: ["tecnologia", "servicos", "saude"], interests: ["automatizar_processos", "visibilidade"] },
  { key: "dashboards",  title: "Dashboards & KPIs",      price: 800,  sprints: 1, sectors: ["servicos", "retalho", "industria", "saude", "tecnologia", "logistica", "consultoria", "alimentar", "construcao", "educacao"], interests: ["visibilidade", "crescimento"] },
  { key: "integracoes", title: "Integrações (APIs)",      price: 1600, sprints: 1, sectors: ["tecnologia", "logistica", "industria"], interests: ["automatizar_processos", "crescimento"] },
  { key: "ia_docs",     title: "IA — Leitura de Docs",   price: 2000, sprints: 1, sectors: ["servicos", "saude", "consultoria", "juridico"], interests: ["automatizar_processos", "reduzir_custos"] },
  { key: "ia_assist",   title: "IA — Assistente Interno", price: 2200, sprints: 1, sectors: ["servicos", "tecnologia", "consultoria", "saude"], interests: ["automatizar_processos", "visibilidade"] },
  { key: "ia_triagem",  title: "IA — Triagem & Resumos", price: 1800, sprints: 1, sectors: ["saude", "servicos", "consultoria", "juridico"], interests: ["automatizar_processos", "reduzir_custos"] },
  { key: "financeiro",  title: "Módulo Financeiro",      price: 1400, sprints: 1, sectors: ["servicos", "retalho", "industria", "consultoria"], interests: ["visibilidade", "conformidade", "reduzir_custos"] },
  { key: "rh",          title: "Recursos Humanos",       price: 1200, sprints: 1, sectors: ["servicos", "industria", "saude", "educacao"], interests: ["conformidade", "visibilidade"] },
];

/* ═══════════════════════ Sectors ═══════════════════════ */

export const SECTORS = [
  { value: "retalho", label: "Retalho" },
  { value: "logistica", label: "Logística" },
  { value: "transportes", label: "Transportes" },
  { value: "industria", label: "Indústria" },
  { value: "servicos", label: "Serviços" },
  { value: "saude", label: "Saúde" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "consultoria", label: "Consultoria" },
  { value: "juridico", label: "Jurídico" },
  { value: "alimentar", label: "Alimentar" },
  { value: "construcao", label: "Construção" },
  { value: "educacao", label: "Educação" },
  { value: "outro", label: "Outro" },
];

export const EMPLOYEE_RANGES = [
  { value: "1-10", label: "1 – 10", multiplier: 1.0 },
  { value: "11-50", label: "11 – 50", multiplier: 1.15 },
  { value: "51-200", label: "51 – 200", multiplier: 1.3 },
  { value: "201-500", label: "201 – 500", multiplier: 1.5 },
  { value: "500+", label: "500+", multiplier: 1.8 },
];

export const REVENUE_RANGES = [
  { value: "ate_100k", label: "Até 100 000 €", multiplier: 1.0 },
  { value: "100k_500k", label: "100 000 – 500 000 €", multiplier: 1.05 },
  { value: "500k_1m", label: "500 000 – 1 000 000 €", multiplier: 1.1 },
  { value: "1m_5m", label: "1 000 000 – 5 000 000 €", multiplier: 1.2 },
  { value: "5m_plus", label: "5 000 000+ €", multiplier: 1.35 },
];

export const INTERESTS = [
  { value: "reduzir_custos", label: "Reduzir custos operacionais" },
  { value: "automatizar_processos", label: "Automatizar processos" },
  { value: "visibilidade", label: "Visibilidade / Dashboards" },
  { value: "conformidade", label: "Conformidade / Compliance" },
  { value: "crescimento", label: "Suportar crescimento" },
];

export const DEPARTMENTS = [
  { value: "financeiro", label: "Financeiro" },
  { value: "comercial", label: "Comercial" },
  { value: "operacoes", label: "Operações" },
  { value: "rh", label: "Recursos Humanos" },
  { value: "logistica", label: "Logística" },
  { value: "it", label: "IT / Tecnologia" },
  { value: "producao", label: "Produção" },
  { value: "qualidade", label: "Qualidade" },
];

export const PAYMENT_OPTIONS = [
  { value: "100_upfront" as const, label: "100% antecipado", discount: 0.05 },
  { value: "50_50" as const, label: "50% início / 50% entrega", discount: 0 },
  { value: "3_parcelas" as const, label: "3 parcelas mensais", discount: -0.03 },
];

/* ═══════════════════════ Pricing Logic ═══════════════════════ */

export function getRecommendedModules(product: ProductKey, profile: CompanyProfile): string[] {
  if (product === "diagnostico") return [];

  const sector = profile.sector;
  const interest = profile.mainInterest;

  const scored = MODULES
    .filter((m) => {
      // For erp_core, skip IA modules
      if (product === "erp_core" && m.key.startsWith("ia_")) return false;
      // For modulo_avulso, include all
      return true;
    })
    .map((m) => {
      let score = 0;
      if (m.sectors.includes(sector)) score += 2;
      if (m.interests.includes(interest)) score += 3;
      // Boost if department matches
      if (profile.departments.some((d) => m.key.includes(d))) score += 1;
      return { key: m.key, score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  if (product === "modulo_avulso") return scored.slice(0, 2).map((m) => m.key);
  if (product === "erp_core") return scored.slice(0, 4).map((m) => m.key);
  // erp_ia — include more and allow IA modules
  return scored.slice(0, 6).map((m) => m.key);
}

export function calculatePrice(
  product: ProductKey,
  selectedModules: string[],
  employees: string,
  revenue: string,
  paymentTerms: "100_upfront" | "50_50" | "3_parcelas"
): { items: ProposalItem[]; total: number; sprints: number } {
  const productInfo = PRODUCTS.find((p) => p.key === product)!;

  if (product === "diagnostico") {
    return {
      items: [{ description: "Diagnóstico Operacional (Gratuito)", quantity: 1, unitPrice: 0, total: 0 }],
      total: 0,
      sprints: 1,
    };
  }

  const empMultiplier = EMPLOYEE_RANGES.find((e) => e.value === employees)?.multiplier ?? 1;
  const revMultiplier = REVENUE_RANGES.find((r) => r.value === revenue)?.multiplier ?? 1;
  const paymentDiscount = PAYMENT_OPTIONS.find((p) => p.value === paymentTerms)?.discount ?? 0;

  const items: ProposalItem[] = [];
  let totalSprints = productInfo.sprintsBase;

  // Base product setup
  items.push({
    description: `${productInfo.title} — Setup & Configuração`,
    quantity: 1,
    unitPrice: Math.round(productInfo.basePrice * empMultiplier * revMultiplier),
    total: Math.round(productInfo.basePrice * empMultiplier * revMultiplier),
  });

  // Modules
  for (const modKey of selectedModules) {
    const mod = MODULES.find((m) => m.key === modKey);
    if (!mod) continue;
    const price = Math.round(mod.price * empMultiplier * revMultiplier);
    items.push({
      description: mod.title,
      quantity: 1,
      unitPrice: price,
      total: price,
    });
    totalSprints += mod.sprints;
  }

  let subtotal = items.reduce((s, it) => s + it.total, 0);

  // Apply payment terms adjustment
  if (paymentDiscount !== 0) {
    const adjustment = Math.round(subtotal * paymentDiscount);
    const label = paymentDiscount > 0 ? "Desconto pagamento antecipado" : "Acréscimo parcelamento";
    items.push({
      description: label,
      quantity: 1,
      unitPrice: -adjustment,
      total: -adjustment,
    });
    subtotal -= adjustment;
  }

  return { items, total: subtotal, sprints: totalSprints };
}
