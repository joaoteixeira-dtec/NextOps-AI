import { Hono } from "hono";
import { leadPayloadSchema } from "@nextops/shared";
import { supabase } from "../lib/supabase.js";
import { enqueueEmailSequence } from "../lib/queue.js";

export const leadRoutes = new Hono();

leadRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const result = leadPayloadSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: "Validation failed", details: result.error.flatten() }, 400);
  }

  const payload = result.data;

  // Insert lead into Supabase
  const { data, error } = await supabase.from("leads").insert({
    company: payload.company,
    contact_name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    employees: payload.employees ?? null,
    industry: payload.industry ?? null,
    message: payload.message ?? null,
    status: "novo",
    source: "website",
    created_at: payload.timestamp,
    updated_at: payload.timestamp,
  }).select("id").single();

  if (error) {
    console.error("[leads] Supabase insert error:", error);
    return c.json({ error: "Failed to save lead" }, 500);
  }

  // Enqueue welcome email sequence
  try {
    await enqueueEmailSequence({
      leadId: data.id,
      email: payload.email,
      name: payload.name,
      company: payload.company,
    });
  } catch (err) {
    // Don't fail the request if email queue is unavailable
    console.error("[leads] Failed to enqueue email sequence:", err);
  }

  return c.json({ ok: true, id: data.id }, 201);
});
