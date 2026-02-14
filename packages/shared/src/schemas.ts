import { z } from "zod";

export const leadPayloadSchema = z.object({
  company: z.string().min(1, "Company is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  employees: z.string().optional(),
  industry: z.string().optional(),
  message: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  source: z.literal("website"),
  timestamp: z.string(),
});

export type LeadPayloadInput = z.infer<typeof leadPayloadSchema>;
