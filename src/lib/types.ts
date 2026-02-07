export type LeadPayload = {
  company: string;
  name: string;
  email: string;
  phone?: string;
  employees?: string;
  industry?: string;
  message?: string;
  consent: boolean;
  source: "website";
  timestamp: string;
};
