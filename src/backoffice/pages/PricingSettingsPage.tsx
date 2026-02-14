import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../lib/permissions";
import { TopBar } from "../components/TopBar";
import { cn } from "../../lib/cn";
import { Save, RotateCcw, AlertTriangle } from "lucide-react";
import {
  PRODUCTS as DEFAULT_PRODUCTS,
  MODULES as DEFAULT_MODULES,
  EMPLOYEE_RANGES as DEFAULT_EMP,
  REVENUE_RANGES as DEFAULT_REV,
  PAYMENT_OPTIONS as DEFAULT_PAY,
  type ProductInfo,
  type ModuleInfo,
} from "../../lib/pricingEngine";

/* ══════════════════ Firestore config shape ══════════════════ */
export type PricingConfig = {
  products: { key: string; basePrice: number; sprintsBase: number }[];
  modules: { key: string; price: number; sprints: number }[];
  employeeMultipliers: { value: string; multiplier: number }[];
  revenueMultipliers: { value: string; multiplier: number }[];
  paymentOptions: { value: string; discount: number }[];
  updatedAt?: string;
  updatedBy?: string;
};

const CONFIG_DOC = "pricing";
const CONFIG_COLLECTION = "settings";

function buildDefaultConfig(): PricingConfig {
  return {
    products: DEFAULT_PRODUCTS.map((p) => ({ key: p.key, basePrice: p.basePrice, sprintsBase: p.sprintsBase })),
    modules: DEFAULT_MODULES.map((m) => ({ key: m.key, price: m.price, sprints: m.sprints })),
    employeeMultipliers: DEFAULT_EMP.map((e) => ({ value: e.value, multiplier: e.multiplier })),
    revenueMultipliers: DEFAULT_REV.map((r) => ({ value: r.value, multiplier: r.multiplier })),
    paymentOptions: DEFAULT_PAY.map((p) => ({ value: p.value, discount: p.discount })),
  };
}

/* ══════════════════ Page Component ══════════════════ */
export function PricingSettingsPage() {
  const { profile } = useAuth();
  const canEdit = hasPermission(profile?.role, "settings:edit");
  const [config, setConfig] = useState<PricingConfig>(buildDefaultConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC));
        if (snap.exists()) {
          const data = snap.data() as PricingConfig;
          // Merge with defaults to handle new fields
          const merged = buildDefaultConfig();
          if (data.products) {
            for (const dp of data.products) {
              const idx = merged.products.findIndex((p) => p.key === dp.key);
              if (idx >= 0) merged.products[idx] = dp;
            }
          }
          if (data.modules) {
            for (const dm of data.modules) {
              const idx = merged.modules.findIndex((m) => m.key === dm.key);
              if (idx >= 0) merged.modules[idx] = dm;
            }
          }
          if (data.employeeMultipliers) merged.employeeMultipliers = data.employeeMultipliers;
          if (data.revenueMultipliers) merged.revenueMultipliers = data.revenueMultipliers;
          if (data.paymentOptions) merged.paymentOptions = data.paymentOptions;
          setConfig(merged);
        }
      } catch (err) {
        console.error("Erro ao carregar config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!canEdit || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(db, CONFIG_COLLECTION, CONFIG_DOC),
        {
          ...config,
          updatedAt: new Date().toISOString(),
          updatedBy: profile?.uid,
        },
        { merge: true }
      );
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Erro ao guardar config:", err);
      const msg = err?.code === "permission-denied"
        ? "Sem permissão no Firestore. Verifique as Security Rules para a coleção 'settings'."
        : err?.message ?? "Erro desconhecido ao guardar.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(buildDefaultConfig());
    setHasChanges(true);
  };

  const updateProduct = (key: string, field: "basePrice" | "sprintsBase", value: number) => {
    setConfig((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.key === key ? { ...p, [field]: value } : p)),
    }));
    setHasChanges(true);
  };

  const updateModule = (key: string, field: "price" | "sprints", value: number) => {
    setConfig((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.key === key ? { ...m, [field]: value } : m)),
    }));
    setHasChanges(true);
  };

  const updateEmpMultiplier = (value: string, multiplier: number) => {
    setConfig((prev) => ({
      ...prev,
      employeeMultipliers: prev.employeeMultipliers.map((e) => (e.value === value ? { ...e, multiplier } : e)),
    }));
    setHasChanges(true);
  };

  const updateRevMultiplier = (value: string, multiplier: number) => {
    setConfig((prev) => ({
      ...prev,
      revenueMultipliers: prev.revenueMultipliers.map((r) => (r.value === value ? { ...r, multiplier } : r)),
    }));
    setHasChanges(true);
  };

  const updatePayment = (value: string, discount: number) => {
    setConfig((prev) => ({
      ...prev,
      paymentOptions: prev.paymentOptions.map((p) => (p.value === value ? { ...p, discount } : p)),
    }));
    setHasChanges(true);
  };

  const inputCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white text-right focus:border-accent-blue/50 focus:outline-none transition-colors";
  const labelCls = "text-xs text-white/50";

  if (!hasPermission(profile?.role, "settings:view")) {
    return (
      <>
        <TopBar title="Definições" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white/30 text-sm">Sem permissão para aceder a esta página.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Definições — Pricing" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white"><span className="text-sm">✕</span></button>
          </div>
        )}

        {/* Save bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-white/60">
              Ajuste os valores base das propostas. As alterações afetam todas as novas propostas.
            </h2>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
              >
                <RotateCcw size={13} /> Repor padrão
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors",
                  saved ? "bg-accent-emerald" : "bg-accent-blue hover:bg-accent-blue/90",
                  (!hasChanges || saving) && "opacity-40 cursor-not-allowed"
                )}
              >
                <Save size={14} /> {saving ? "A guardar..." : saved ? "Guardado!" : "Guardar"}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-blue" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Products ── */}
            <Section title="Produtos" subtitle="Preço base e sprints estimados por produto.">
              <div className="grid gap-3">
                {config.products.map((p) => {
                  const info = DEFAULT_PRODUCTS.find((dp) => dp.key === p.key);
                  return (
                    <div key={p.key} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{info?.title ?? p.key}</div>
                        <div className="text-[10px] text-white/30 truncate">{info?.description?.slice(0, 60)}...</div>
                      </div>
                      <div className="w-28">
                        <label className={labelCls}>Preço base (€)</label>
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={p.basePrice}
                          onChange={(e) => updateProduct(p.key, "basePrice", Number(e.target.value))}
                          className={inputCls}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="w-20">
                        <label className={labelCls}>Sprints</label>
                        <input
                          type="number"
                          min={1}
                          max={52}
                          value={p.sprintsBase}
                          onChange={(e) => updateProduct(p.key, "sprintsBase", Number(e.target.value))}
                          className={inputCls}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* ── Modules ── */}
            <Section title="Módulos" subtitle="Preço unitário e sprints por módulo.">
              <div className="grid gap-2 sm:grid-cols-2">
                {config.modules.map((m) => {
                  const info = DEFAULT_MODULES.find((dm) => dm.key === m.key);
                  return (
                    <div key={m.key} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">{info?.title ?? m.key}</div>
                      </div>
                      <div className="w-24">
                        <label className={labelCls}>Preço (€)</label>
                        <input
                          type="number"
                          min={0}
                          step={50}
                          value={m.price}
                          onChange={(e) => updateModule(m.key, "price", Number(e.target.value))}
                          className={inputCls}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="w-16">
                        <label className={labelCls}>Sprints</label>
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={m.sprints}
                          onChange={(e) => updateModule(m.key, "sprints", Number(e.target.value))}
                          className={inputCls}
                          disabled={!canEdit}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* ── Employee Multipliers ── */}
            <Section title="Multiplicadores — Funcionários" subtitle="Multiplicador aplicado ao preço com base no nº de funcionários.">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {config.employeeMultipliers.map((e) => {
                  const info = DEFAULT_EMP.find((de) => de.value === e.value);
                  return (
                    <div key={e.value} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="text-xs font-medium mb-2">{info?.label ?? e.value}</div>
                      <input
                        type="number"
                        min={0.5}
                        max={5}
                        step={0.05}
                        value={e.multiplier}
                        onChange={(ev) => updateEmpMultiplier(e.value, Number(ev.target.value))}
                        className={inputCls}
                        disabled={!canEdit}
                      />
                      <div className="text-[10px] text-white/25 mt-1 text-right">×{e.multiplier.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* ── Revenue Multipliers ── */}
            <Section title="Multiplicadores — Volume de Negócio" subtitle="Multiplicador aplicado com base no volume de negócio anual.">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {config.revenueMultipliers.map((r) => {
                  const info = DEFAULT_REV.find((dr) => dr.value === r.value);
                  return (
                    <div key={r.value} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="text-xs font-medium mb-2">{info?.label ?? r.value}</div>
                      <input
                        type="number"
                        min={0.5}
                        max={5}
                        step={0.05}
                        value={r.multiplier}
                        onChange={(ev) => updateRevMultiplier(r.value, Number(ev.target.value))}
                        className={inputCls}
                        disabled={!canEdit}
                      />
                      <div className="text-[10px] text-white/25 mt-1 text-right">×{r.multiplier.toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* ── Payment Options ── */}
            <Section title="Condições de Pagamento" subtitle="Desconto (positivo) ou acréscimo (negativo) por modalidade de pagamento.">
              <div className="grid gap-2 sm:grid-cols-3">
                {config.paymentOptions.map((p) => {
                  const info = DEFAULT_PAY.find((dp) => dp.value === p.value);
                  return (
                    <div key={p.value} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <div className="text-xs font-medium mb-2">{info?.label ?? p.value}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={-0.5}
                          max={0.5}
                          step={0.01}
                          value={p.discount}
                          onChange={(ev) => updatePayment(p.value, Number(ev.target.value))}
                          className={inputCls}
                          disabled={!canEdit}
                        />
                      </div>
                      <div className="text-[10px] text-white/25 mt-1 text-right">
                        {p.discount > 0 ? `${(p.discount * 100).toFixed(0)}% desconto` : p.discount < 0 ? `+${(Math.abs(p.discount) * 100).toFixed(0)}% acréscimo` : "Sem ajuste"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

            {/* Info */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-white/50 leading-relaxed">
                <strong className="text-amber-400">Nota:</strong> Estas configurações são aplicadas automaticamente a todas as novas propostas.
                Propostas já criadas mantêm os valores com que foram geradas.
                A fórmula de cálculo é: <code className="text-white/60">preçoBase × multiplicadorFuncionários × multiplicadorReceita + módulos</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Section Component ── */
function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
