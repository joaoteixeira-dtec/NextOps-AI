export type LeadPayload = {
  company: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  employees?: string;
  industry?: string;
  currentTools?: string;
  pain?: string;
  message?: string;
  consent: boolean;
  source: "website";
  timestamp: string;
};
