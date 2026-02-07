import { Check, Loader2 } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { submitLead } from "../lib/leads";
import type { LeadPayload } from "../lib/types";
import { cn } from "../lib/cn";

type Status = "idle" | "loading" | "success" | "error";

const employeesOptions = ["1–5", "6–15", "16–30", "31–80", "81–200", "200+"];

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [values, setValues] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    employees: "",
    industry: "",
    currentTools: "",
    pain: "",
    message: "",
    consent: true,
  });

  const disabled = status === "loading" || status === "success";

  const canSubmit = useMemo(() => {
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
    return (
      values.company.trim().length >= 2 &&
      values.name.trim().length >= 2 &&
      okEmail &&
      values.consent
    );
  }, [values]);

  const onChange = (k: keyof typeof values) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Preencha empresa, nome e email (válido).");
      return;
    }

    setStatus("loading");

    const payload: LeadPayload = {
      company: values.company.trim(),
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || undefined,
      role: values.role.trim() || undefined,
      employees: values.employees || undefined,
      industry: values.industry.trim() || undefined,
      currentTools: values.currentTools.trim() || undefined,
      pain: values.pain.trim() || undefined,
      message: values.message.trim() || undefined,
      consent: Boolean(values.consent),
      source: "website",
      timestamp: new Date().toISOString(),
    };

    try {
      await submitLead(payload);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo falhou. Tenta novamente.");
    }
  }

  return (
    <div className="gradient-border rounded-3xl bg-white/5 p-1 shadow-glow">
      <div className="rounded-[1.35rem] bg-ink-900/55 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Diagnóstico + Mapa (48h)</div>
            <p className="mt-1 text-sm text-white/70">
              Diz-nos o teu contexto. Nós respondemos com 3 ganhos rápidos + proposta de sprint.
            </p>
          </div>
          <span className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 sm:inline">
            B2B
          </span>
        </div>

        <form className="mt-5 grid gap-3" onSubmit={onSubmit} aria-label="Formulário de lead">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Empresa*" placeholder="Ex: Visão Consultores" value={values.company} onChange={onChange("company")} disabled={disabled} />
            <Field label="Nome*" placeholder="O teu nome" value={values.name} onChange={onChange("name")} disabled={disabled} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email*" type="email" placeholder="email@empresa.pt" value={values.email} onChange={onChange("email")} disabled={disabled} />
            <Field label="Telefone" placeholder="+351 ..." value={values.phone} onChange={onChange("phone")} disabled={disabled} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Cargo" placeholder="Ex: Gerente / Operações" value={values.role} onChange={onChange("role")} disabled={disabled} />
            <SelectField
              label="Colaboradores"
              value={values.employees}
              onChange={onChange("employees")}
              disabled={disabled}
              options={employeesOptions}
              placeholder="Selecionar"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Setor" placeholder="Ex: Distribuição / Serviços" value={values.industry} onChange={onChange("industry")} disabled={disabled} />
            <Field label="Ferramentas atuais" placeholder="Ex: Excel, WhatsApp, software X" value={values.currentTools} onChange={onChange("currentTools")} disabled={disabled} />
          </div>

          <TextArea
            label="Principal dor (opcional)"
            placeholder="Ex: erros de stock, falta de visibilidade, demasiado tempo a confirmar coisas..."
            value={values.pain}
            onChange={onChange("pain")}
            disabled={disabled}
          />

          <TextArea
            label="Mensagem (opcional)"
            placeholder="Se quiseres, descreve o teu fluxo atual em 2–3 linhas."
            value={values.message}
            onChange={onChange("message")}
            disabled={disabled}
          />

          <label className={cn("mt-1 flex items-start gap-2 text-xs text-white/70", disabled && "opacity-70")}>
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
              disabled={disabled}
              className="mt-[2px] h-4 w-4 rounded border-white/15 bg-white/10"
            />
            Autorizo o contacto da NextOps AI para análise e proposta (sem spam).
          </label>

          {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={disabled}
            className={cn(
              "mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-ink-950 transition hover:bg-white/90 disabled:opacity-60",
              !canSubmit && status === "idle" && "opacity-90"
            )}
          >
            {status === "loading" && <Loader2 className="animate-spin" size={18} />}
            {status === "success" && <Check size={18} />}
            {status === "success" ? "Pedido enviado" : "Receber Mapa de Ganhos (48h)"}
          </button>

          <p className="text-xs text-white/55">
            Resposta em até 48h úteis. Implementação por sprints (rápido e claro).
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-white/70">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/35 outline-none ring-0 transition focus:border-white/20 focus:bg-white/8"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-white/70">
      <span>{label}</span>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20"
      >
        <option value="" className="bg-ink-900">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-white/70">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="min-h-[90px] resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/20 focus:bg-white/8"
      />
    </label>
  );
}
