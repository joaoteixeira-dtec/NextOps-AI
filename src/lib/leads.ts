import type { LeadPayload } from "./types";
import { collection, addDoc } from "firebase/firestore";

const LS_KEY = "nextopsai_leads";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export async function submitLead(payload: LeadPayload) {
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT as string | undefined;

  // Try to save to Firestore as a new lead
  try {
    const { db } = await import("./firebase");
    await addDoc(collection(db, "leads"), {
      company: payload.company,
      contactName: payload.name,
      email: payload.email,
      phone: payload.phone || undefined,
      employees: payload.employees || undefined,
      industry: payload.industry || undefined,
      message: payload.message || undefined,
      status: "novo",
      notes: [],
      source: "website",
      createdAt: payload.timestamp,
      updatedAt: payload.timestamp,
    });
  } catch {
    // Firestore not configured — fall through to localStorage
  }

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
