import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Proposal, ProposalStatus } from "../../lib/types";
import { SECTORS, REVENUE_RANGES } from "../../lib/pricingEngine";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, Download, FileText } from "lucide-react";
import { generateProposalPDF } from "../../lib/proposalTemplates";
import { cn } from "../../lib/cn";

const STATUS_MAP: Record<ProposalStatus, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-white/10 text-white/50" },
  enviada: { label: "Enviada", color: "bg-blue-500/15 text-blue-400" },
  aceite: { label: "Aceite", color: "bg-emerald-500/15 text-emerald-400" },
  recusada: { label: "Recusada", color: "bg-red-500/15 text-red-400" },
};

export function PublicProposalPage() {
  const { token } = useParams<{ token: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) { setNotFound(true); setLoading(false); return; }
      try {
        const snap = await getDocs(query(collection(db, "proposals"), where("shareToken", "==", token)));
        if (snap.empty) {
          setNotFound(true);
        } else {
          setProposal({ id: snap.docs[0].id, ...snap.docs[0].data() } as Proposal);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleDownloadPDF = async () => {
    if (!proposal) return;
    setGenerating(true);
    try {
      const blob = await generateProposalPDF({
        product: proposal.product,
        profile: proposal.companyProfile,
        modules: proposal.modules ?? [],
        items: proposal.items,
        total: proposal.total,
        sprints: proposal.estimatedSprints ?? 1,
        validUntil: proposal.validUntil,
        paymentTermsLabel: "",
        notes: proposal.notes,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposta_${proposal.clientName.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  if (notFound || !proposal) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Proposta não encontrada</h1>
          <p className="text-sm text-white/50">O link pode ter expirado ou ser inválido.</p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(proposal.validUntil).getTime() < Date.now();
  const st = STATUS_MAP[proposal.status];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm">N</div>
            <span className="text-sm font-semibold text-white/60">NextOps</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", st.color)}>{st.label}</span>
            {isExpired && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/15 text-red-400 flex items-center gap-1">
                <Clock size={10} /> Expirada
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/40">
            <span>{proposal.companyProfile.companyName}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Válida até {new Date(proposal.validUntil).toLocaleDateString("pt-PT")}</span>
            {proposal.version && proposal.version > 1 && (
              <>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span>v{proposal.version}</span>
              </>
            )}
          </div>
        </div>

        {/* Company Info */}
        {proposal.companyProfile && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Dados da Empresa</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                ["Empresa", proposal.companyProfile.companyName],
                ["NIF", proposal.companyProfile.nif],
                ["Email", proposal.companyProfile.email],
                ["Setor", SECTORS.find((s) => s.value === proposal.companyProfile.sector)?.label ?? "—"],
                ["Funcionários", proposal.companyProfile.employees],
                ["Volume Negócio", REVENUE_RANGES.find((r) => r.value === proposal.companyProfile.annualRevenue)?.label ?? "—"],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
                  <div className="text-sm text-white/70 mt-0.5">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Investimento</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-white/40 text-xs">
                <th className="px-5 py-3 text-left font-medium">Descrição</th>
                <th className="px-5 py-3 text-center font-medium w-16">Qtd</th>
                <th className="px-5 py-3 text-right font-medium w-28">Preço Unit.</th>
                <th className="px-5 py-3 text-right font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items.map((it, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-5 py-3 text-white/60">{it.description}</td>
                  <td className="px-5 py-3 text-center text-white/40">{it.quantity}</td>
                  <td className="px-5 py-3 text-right text-white/40">{it.unitPrice.toLocaleString("pt-PT")} €</td>
                  <td className="px-5 py-3 text-right font-medium">{it.total.toLocaleString("pt-PT")} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10 bg-blue-500/5">
                <td colSpan={3} className="px-5 py-3 text-right font-bold">TOTAL (sem IVA)</td>
                <td className="px-5 py-3 text-right text-xl font-bold text-blue-400">{proposal.total.toLocaleString("pt-PT")} €</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
          {proposal.estimatedSprints && (
            <span className="flex items-center gap-1"><Clock size={12} /> {proposal.estimatedSprints} sprint(s) estimado(s)</span>
          )}
          <span className="flex items-center gap-1"><FileText size={12} /> Criada em {new Date(proposal.createdAt).toLocaleDateString("pt-PT")}</span>
        </div>

        {/* Download PDF */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-5 py-3 text-sm font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-colors"
          >
            <Download size={16} /> {generating ? "A gerar PDF..." : "Descarregar Proposta (PDF)"}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-white/20">
            Proposta gerada por NextOps • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
