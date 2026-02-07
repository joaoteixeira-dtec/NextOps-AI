import type { LeadPayload } from "./types";

const LS_KEY = "nextopsai_leads";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export async function submitLead(payload: LeadPayload) {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT as string | undefined;

  if (!endpoint) {
    // Fallback: store locally to keep UX complete during development
    const current = safeJsonParse<LeadPayload[]>(localStorage.getItem(LS_KEY)) ?? [];
    current.unshift(payload);
    localStorage.setItem(LS_KEY, JSON.stringify(current));
    // Also log for convenience
    // eslint-disable-next-line no-console
    console.log("[NextOps AI] Lead captured (localStorage):", payload);
    await new Promise((r) => setTimeout(r, 650));
    return { ok: true as const, mode: "local" as const };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar lead (${res.status}). ${text}`.trim());
  }

  return { ok: true as const, mode: "remote" as const };
}
