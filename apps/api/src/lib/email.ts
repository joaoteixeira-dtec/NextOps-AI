import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("[email] RESEND_API_KEY not set. Email sending will fail.");
}

export const resend = new Resend(apiKey ?? "");

export const FROM_EMAIL = process.env.FROM_EMAIL ?? "NextOps AI <noreply@nextops-ai.com>";
