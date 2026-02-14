import type { LeadPayload } from "./types";

const LS_KEY = "nextopsai_leads";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export async function submitLead(payload: LeadPayload) {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

  // If API is configured, send to backend
  if (apiUrl) {
    const res = await fetch(`${apiUrl}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Falha ao enviar lead (${res.status}). ${text}`.trim());
    }

    return { ok: true as const, mode: "api" as const };
  }

  // Fallback: try Firestore directly
  try {
    const { db } = await import("./firebase");
    const { collection, addDoc } = await import("firebase/firestore");
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
    return { ok: true as const, mode: "firestore" as const };
  } catch {
    // Firestore not configured — fall through to localStorage
  }

  // Last resort: localStorage for dev
  const current = safeJsonParse<LeadPayload[]>(localStorage.getItem(LS_KEY)) ?? [];
  current.unshift(payload);
  localStorage.setItem(LS_KEY, JSON.stringify(current));
  // eslint-disable-next-line no-console
  console.log("[NextOps AI] Lead captured (localStorage):", payload);
  await new Promise((r) => setTimeout(r, 650));
  return { ok: true as const, mode: "local" as const };
}
