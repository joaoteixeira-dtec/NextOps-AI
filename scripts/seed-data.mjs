// Seed script — generates 10 clients + 10 leads in Firestore
// Run: node scripts/seed-data.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqilpdA1TaziiZKCxmKz8AWUe-yKuU5es",
  authDomain: "no2026.firebaseapp.com",
  projectId: "no2026",
  storageBucket: "no2026.firebasestorage.app",
  messagingSenderId: "708067485166",
  appId: "1:708067485166:web:6172959df1dc8fcca85aff",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = new Date().toISOString();

/* ══════════════════ 10 Clients ══════════════════ */
const clients = [
  {
    company: "TechVision Solutions, Lda.",
    nif: "510234567",
    address: "Rua Augusta 45, 3º Dto, 1100-048 Lisboa",
    contacts: [
      { name: "Ricardo Mendes", email: "ricardo.mendes@techvision.pt", phone: "+351 912 345 678", role: "CEO", primary: true },
      { name: "Sofia Almeida", email: "sofia.almeida@techvision.pt", phone: "+351 913 456 789", role: "CTO", primary: false },
    ],
    industry: "tecnologia",
    notes: "Empresa focada em desenvolvimento de software. Interesse em automação de processos internos.",
    createdAt: "2025-11-10T09:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "Oliveira & Filhos — Construções, S.A.",
    nif: "503876543",
    address: "Av. da Liberdade 220, 4000-322 Porto",
    contacts: [
      { name: "Manuel Oliveira", email: "manuel@oliveiraconstrucoes.pt", phone: "+351 931 222 333", role: "Diretor Geral", primary: true },
      { name: "Ana Oliveira", email: "ana@oliveiraconstrucoes.pt", phone: "+351 931 222 444", role: "Financeira", primary: false },
    ],
    industry: "construcao",
    notes: "Empresa familiar com 30 anos. Gestão ainda muito manual, sem ERP.",
    createdAt: "2025-12-01T10:30:00.000Z",
    updatedAt: now,
  },
  {
    company: "FreshFood Distribuição, Lda.",
    nif: "514567890",
    address: "Zona Industrial de Ovar, Lote 14, 3880-100 Ovar",
    contacts: [
      { name: "Carla Santos", email: "carla.santos@freshfood.pt", phone: "+351 927 111 222", role: "Diretora de Operações", primary: true },
    ],
    industry: "alimentar",
    notes: "Distribuidora de frescos para grande distribuição. Problemas com controlo de stock e rastreabilidade.",
    createdAt: "2025-12-15T14:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "MedCenter — Clínica Médica, S.A.",
    nif: "509123456",
    address: "Rua Dr. António Bernardino de Almeida 550, 4200-072 Porto",
    contacts: [
      { name: "Dr. Pedro Ferreira", email: "pedro.ferreira@medcenter.pt", phone: "+351 916 777 888", role: "Diretor Clínico", primary: true },
      { name: "Joana Ribeiro", email: "joana.ribeiro@medcenter.pt", phone: "+351 916 777 999", role: "Administrativa", primary: false },
    ],
    industry: "saude",
    notes: "Clínica com 5 especialidades. Necessita de digitalização de processos de agendamento e faturação.",
    createdAt: "2026-01-05T11:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "AutoLuso — Comércio Automóvel, Lda.",
    nif: "507654321",
    address: "EN1, Km 234, 2300-000 Tomar",
    contacts: [
      { name: "Bruno Costa", email: "bruno.costa@autoluso.pt", phone: "+351 924 555 666", role: "Gerente", primary: true },
    ],
    industry: "comercio",
    notes: "Stand automóvel com oficina. Gestão de stock de viaturas e peças desorganizada.",
    createdAt: "2026-01-10T16:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "SolEnergy, Unipessoal Lda.",
    nif: "516789012",
    address: "Parque Empresarial de Loulé, Lote 7, 8100-000 Loulé",
    contacts: [
      { name: "Tiago Neves", email: "tiago@solenergy.pt", phone: "+351 965 333 444", role: "Fundador & CEO", primary: true },
      { name: "Marta Lopes", email: "marta@solenergy.pt", phone: "+351 965 333 555", role: "Diretora Comercial", primary: false },
    ],
    industry: "energia",
    notes: "Instalação de painéis solares. Equipa de 25 pessoas, crescimento rápido mas processos desorganizados.",
    createdAt: "2026-01-18T08:30:00.000Z",
    updatedAt: now,
  },
  {
    company: "LegalPro — Sociedade de Advogados, SP, RL",
    nif: "502345678",
    address: "Praça Marquês de Pombal 12, 1250-162 Lisboa",
    contacts: [
      { name: "Dr.ª Inês Machado", email: "ines.machado@legalpro.pt", phone: "+351 918 432 100", role: "Sócia-Gerente", primary: true },
    ],
    industry: "servicos",
    notes: "Escritório de advogados com 12 colaboradores. Precisa de gestão de processos judiciais e faturação integrada.",
    createdAt: "2026-01-22T13:15:00.000Z",
    updatedAt: now,
  },
  {
    company: "PortoWine Exports, S.A.",
    nif: "508901234",
    address: "Cais de Gaia 88, 4400-111 Vila Nova de Gaia",
    contacts: [
      { name: "Henrique Sousa", email: "henrique@portowine.pt", phone: "+351 939 101 202", role: "Diretor de Exportação", primary: true },
      { name: "Clara Duarte", email: "clara@portowine.pt", phone: "+351 939 101 303", role: "Logística", primary: false },
    ],
    industry: "alimentar",
    notes: "Exportadora de vinho do Porto para 15 mercados. Necessita controlo de encomendas e logística internacional.",
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "EduFuturo — Centro de Formação, Lda.",
    nif: "511234567",
    address: "Rua de Santa Catarina 340, 4000-441 Porto",
    contacts: [
      { name: "Filipa Gonçalves", email: "filipa@edufuturo.pt", phone: "+351 925 888 999", role: "Diretora Pedagógica", primary: true },
    ],
    industry: "educacao",
    notes: "Centro de formação profissional. Gestão de turmas, formadores e certificações toda em Excel.",
    createdAt: "2026-02-02T09:45:00.000Z",
    updatedAt: now,
  },
  {
    company: "InovaPack — Embalagens Industriais, S.A.",
    nif: "505678901",
    address: "Zona Industrial de Aveiro, Nave 22, 3800-000 Aveiro",
    contacts: [
      { name: "Rui Teixeira", email: "rui.teixeira@inovapack.pt", phone: "+351 934 666 777", role: "Diretor Industrial", primary: true },
      { name: "Patrícia Vieira", email: "patricia@inovapack.pt", phone: "+351 934 666 888", role: "Qualidade", primary: false },
    ],
    industry: "industria",
    notes: "Produção de embalagens para indústria alimentar. 80 funcionários, precisa de ERP completo com módulo de produção.",
    createdAt: "2026-02-08T15:30:00.000Z",
    updatedAt: now,
  },
];

/* ══════════════════ 10 Leads ══════════════════ */
const leads = [
  {
    company: "SmartRetail Portugal, Lda.",
    contactName: "André Silva",
    email: "andre.silva@smartretail.pt",
    phone: "+351 912 444 555",
    employees: "11-50",
    industry: "comercio",
    message: "Temos 8 lojas e precisamos de um sistema central para gerir inventário e vendas. Atualmente usamos Excel.",
    status: "novo",
    notes: [],
    source: "website",
    value: 12000,
    createdAt: "2026-02-10T08:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "GreenGarden — Paisagismo, Lda.",
    contactName: "Luísa Martins",
    email: "luisa@greengarden.pt",
    phone: "+351 926 222 111",
    employees: "1-10",
    industry: "servicos",
    message: "Precisamos de ajuda para organizar orçamentos e agendamento de equipas no terreno.",
    status: "contactado",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Contactada por telefone. Interessada em diagnóstico gratuito.", createdAt: "2026-02-11T10:00:00.000Z" },
    ],
    source: "website",
    value: 4500,
    createdAt: "2026-02-09T14:30:00.000Z",
    updatedAt: now,
  },
  {
    company: "Construtora Atlântico, S.A.",
    contactName: "Carlos Pereira",
    email: "carlos.pereira@atlantico.pt",
    phone: "+351 937 888 777",
    employees: "51-200",
    industry: "construcao",
    message: "Procuramos ERP para gestão de obras, subempreiteiros e controlo financeiro.",
    status: "qualificado",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Reunião agendada para 20/02. Empresa com 120 funcionários e 6 obras ativas.", createdAt: "2026-02-12T11:00:00.000Z" },
    ],
    source: "referral",
    value: 25000,
    createdAt: "2026-02-05T09:15:00.000Z",
    updatedAt: now,
  },
  {
    company: "BioFarma — Parafarmácia, Lda.",
    contactName: "Diana Rocha",
    email: "diana@biofarma.pt",
    phone: "+351 915 333 222",
    employees: "11-50",
    industry: "saude",
    message: "Queremos automatizar encomendas a fornecedores e controlo de validades de produtos.",
    status: "proposta",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Diagnóstico concluído. Proposta ERP Core em preparação.", createdAt: "2026-02-13T16:00:00.000Z" },
    ],
    source: "website",
    value: 8500,
    createdAt: "2026-01-28T10:45:00.000Z",
    updatedAt: now,
  },
  {
    company: "TransLog Express, S.A.",
    contactName: "Nuno Faria",
    email: "nuno.faria@translog.pt",
    phone: "+351 938 111 000",
    employees: "51-200",
    industry: "logistica",
    message: "Precisamos de sistema para tracking de frotas, gestão de entregas e faturação automática.",
    status: "negociacao",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Proposta ERP + IA enviada. A negociar condições de pagamento.", createdAt: "2026-02-13T14:30:00.000Z" },
    ],
    source: "manual",
    value: 18000,
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "CréditoFácil — Consultoria Financeira",
    contactName: "Mariana Coelho",
    email: "mariana@creditofacil.pt",
    phone: "+351 961 700 800",
    employees: "1-10",
    industry: "servicos",
    message: "Somos 6 consultores e precisamos de CRM e gestão de processos de crédito.",
    status: "novo",
    notes: [],
    source: "website",
    value: 5000,
    createdAt: "2026-02-13T22:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "AquaPura — Tratamento de Águas, Lda.",
    contactName: "Fernando Barros",
    email: "fernando@aquapura.pt",
    phone: "+351 924 999 888",
    employees: "11-50",
    industry: "industria",
    message: "Precisamos de controlo de manutenções preventivas e gestão de contratos com clientes.",
    status: "contactado",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Enviado email com apresentação da NextOps. Aguardar resposta.", createdAt: "2026-02-14T09:00:00.000Z" },
    ],
    source: "website",
    value: 9000,
    createdAt: "2026-02-12T17:20:00.000Z",
    updatedAt: now,
  },
  {
    company: "DesignStudio — Agência Criativa, Lda.",
    contactName: "Leonor Pinto",
    email: "leonor@designstudio.pt",
    phone: "+351 919 555 444",
    employees: "1-10",
    industry: "servicos",
    message: "Queremos gerir projetos, timesheets e faturação num só sistema. Usamos 5 ferramentas diferentes.",
    status: "ganho",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Proposta aceite! Cliente a converter. Início previsto para março.", createdAt: "2026-02-14T10:00:00.000Z" },
    ],
    source: "referral",
    value: 6000,
    createdAt: "2025-12-20T11:00:00.000Z",
    updatedAt: now,
  },
  {
    company: "AgriSul — Cooperativa Agrícola",
    contactName: "José Matias",
    email: "jose.matias@agrisul.pt",
    phone: "+351 963 100 200",
    employees: "11-50",
    industry: "agricultura",
    message: "Cooperativa com 45 associados. Precisamos de sistema para gestão de entregas, pagamentos e relatórios.",
    status: "qualificado",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Contacto por telefone. Muito interesse, mas budget limitado. Propor diagnóstico gratuito primeiro.", createdAt: "2026-02-13T15:00:00.000Z" },
    ],
    source: "manual",
    value: 7500,
    createdAt: "2026-02-07T13:45:00.000Z",
    updatedAt: now,
  },
  {
    company: "HotelVista — Hotelaria e Turismo, S.A.",
    contactName: "Catarina Reis",
    email: "catarina@hotelvista.pt",
    phone: "+351 914 200 300",
    employees: "51-200",
    industry: "turismo",
    message: "Hotel com 3 unidades no Algarve. Gestão de reservas, housekeeping e F&B totalmente manual.",
    status: "perdido",
    notes: [
      { id: "n1", authorId: "system", authorName: "João Teixeira", content: "Optaram por solução internacional (Oracle Hospitality). Manter contacto para futuro.", createdAt: "2026-02-10T12:00:00.000Z" },
    ],
    source: "website",
    value: 30000,
    createdAt: "2025-11-25T09:00:00.000Z",
    updatedAt: now,
  },
];

/* ══════════════════ Seed ══════════════════ */
async function seed() {
  console.log("A criar 10 clientes...");
  for (const c of clients) {
    const ref = await addDoc(collection(db, "clients"), c);
    console.log(`  ✔ ${c.company} → ${ref.id}`);
  }

  console.log("\nA criar 10 leads...");
  for (const l of leads) {
    const ref = await addDoc(collection(db, "leads"), l);
    console.log(`  ✔ ${l.company} → ${ref.id}`);
  }

  console.log("\n✅ Seed completo! 10 clientes + 10 leads criados.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
