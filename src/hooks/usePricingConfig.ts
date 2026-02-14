import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  PRODUCTS as DEFAULT_PRODUCTS,
  MODULES as DEFAULT_MODULES,
  EMPLOYEE_RANGES as DEFAULT_EMP,
  REVENUE_RANGES as DEFAULT_REV,
  PAYMENT_OPTIONS as DEFAULT_PAY,
  type ProductInfo,
  type ModuleInfo,
} from "../lib/pricingEngine";
import type { PricingConfig } from "../backoffice/pages/PricingSettingsPage";
import type { ProductKey, CompanyProfile, ProposalItem } from "../lib/types";

export type LivePricingData = {
  products: ProductInfo[];
  modules: ModuleInfo[];
  employeeRanges: typeof DEFAULT_EMP;
  revenueRanges: typeof DEFAULT_REV;
  paymentOptions: typeof DEFAULT_PAY;
  loading: boolean;
  calculatePrice: (
    product: ProductKey,
    selectedModules: string[],
    employees: string,
    revenue: string,
    paymentTerms: "100_upfront" | "50_50" | "3_parcelas"
  ) => { items: ProposalItem[]; total: number; sprints: number };
  getRecommendedModules: (product: ProductKey, profile: CompanyProfile) => string[];
};

export function usePricingConfig(): LivePricingData {
  const [products, setProducts] = useState<ProductInfo[]>(DEFAULT_PRODUCTS);
  const [modules, setModules] = useState<ModuleInfo[]>(DEFAULT_MODULES);
  const [employeeRanges, setEmployeeRanges] = useState(DEFAULT_EMP);
  const [revenueRanges, setRevenueRanges] = useState(DEFAULT_REV);
  const [paymentOptions, setPaymentOptions] = useState(DEFAULT_PAY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "settings", "pricing"));
        if (!snap.exists()) { setLoading(false); return; }
        const cfg = snap.data() as PricingConfig;

        // Merge products
        if (cfg.products) {
          setProducts(DEFAULT_PRODUCTS.map((dp) => {
            const override = cfg.products.find((p) => p.key === dp.key);
            if (!override) return dp;
            return { ...dp, basePrice: override.basePrice, sprintsBase: override.sprintsBase };
          }));
        }

        // Merge modules
        if (cfg.modules) {
          setModules(DEFAULT_MODULES.map((dm) => {
            const override = cfg.modules.find((m) => m.key === dm.key);
            if (!override) return dm;
            return { ...dm, price: override.price, sprints: override.sprints };
          }));
        }

        // Merge multipliers
        if (cfg.employeeMultipliers) {
          setEmployeeRanges(DEFAULT_EMP.map((de) => {
            const override = cfg.employeeMultipliers.find((e) => e.value === de.value);
            return override ? { ...de, multiplier: override.multiplier } : de;
          }));
        }
        if (cfg.revenueMultipliers) {
          setRevenueRanges(DEFAULT_REV.map((dr) => {
            const override = cfg.revenueMultipliers.find((r) => r.value === dr.value);
            return override ? { ...dr, multiplier: override.multiplier } : dr;
          }));
        }
        if (cfg.paymentOptions) {
          setPaymentOptions(DEFAULT_PAY.map((dp) => {
            const override = cfg.paymentOptions.find((p) => p.value === dp.value);
            return override ? { ...dp, discount: override.discount } : dp;
          }));
        }
      } catch (err) {
        console.error("Erro ao carregar pricing config:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const calculatePriceFn = (
    product: ProductKey,
    selectedModules: string[],
    employees: string,
    revenue: string,
    paymentTerms: "100_upfront" | "50_50" | "3_parcelas"
  ): { items: ProposalItem[]; total: number; sprints: number } => {
    const productInfo = products.find((p) => p.key === product)!;

    if (product === "diagnostico") {
      return {
        items: [{ description: "Diagnóstico Operacional (Gratuito)", quantity: 1, unitPrice: 0, total: 0 }],
        total: 0,
        sprints: 1,
      };
    }

    const empMultiplier = employeeRanges.find((e) => e.value === employees)?.multiplier ?? 1;
    const revMultiplier = revenueRanges.find((r) => r.value === revenue)?.multiplier ?? 1;
    const paymentDiscount = paymentOptions.find((p) => p.value === paymentTerms)?.discount ?? 0;

    const items: ProposalItem[] = [];
    let totalSprints = productInfo.sprintsBase;

    // Base product
    items.push({
      description: `${productInfo.title} — Setup & Configuração`,
      quantity: 1,
      unitPrice: Math.round(productInfo.basePrice * empMultiplier * revMultiplier),
      total: Math.round(productInfo.basePrice * empMultiplier * revMultiplier),
    });

    // Modules
    for (const modKey of selectedModules) {
      const mod = modules.find((m) => m.key === modKey);
      if (!mod) continue;
      const price = Math.round(mod.price * empMultiplier * revMultiplier);
      items.push({ description: mod.title, quantity: 1, unitPrice: price, total: price });
      totalSprints += mod.sprints;
    }

    let subtotal = items.reduce((s, it) => s + it.total, 0);

    if (paymentDiscount !== 0) {
      const adjustment = Math.round(subtotal * paymentDiscount);
      const label = paymentDiscount > 0 ? "Desconto pagamento antecipado" : "Acréscimo parcelamento";
      items.push({ description: label, quantity: 1, unitPrice: -adjustment, total: -adjustment });
      subtotal -= adjustment;
    }

    return { items, total: subtotal, sprints: totalSprints };
  };

  const getRecommendedModulesFn = (product: ProductKey, profile: CompanyProfile): string[] => {
    if (product === "diagnostico") return [];

    const sector = profile.sector;
    const interest = profile.mainInterest;

    const scored = modules
      .filter((m) => {
        if (product === "erp_core" && m.key.startsWith("ia_")) return false;
        return true;
      })
      .map((m) => {
        let score = 0;
        if (m.sectors.includes(sector)) score += 2;
        if (m.interests.includes(interest)) score += 3;
        if (profile.departments.some((d) => m.key.includes(d))) score += 1;
        return { key: m.key, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    if (product === "modulo_avulso") return scored.slice(0, 2).map((m) => m.key);
    if (product === "erp_core") return scored.slice(0, 4).map((m) => m.key);
    return scored.slice(0, 6).map((m) => m.key);
  };

  return {
    products,
    modules,
    employeeRanges,
    revenueRanges,
    paymentOptions,
    loading,
    calculatePrice: calculatePriceFn,
    getRecommendedModules: getRecommendedModulesFn,
  };
}
