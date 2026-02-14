import { Worker } from "bullmq";
import { resend, FROM_EMAIL } from "../lib/email.js";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const templates: Record<string, (name: string, company: string) => { subject: string; html: string }> = {
  welcome: (name, company) => ({
    subject: `Bem-vindo à NextOps AI, ${name}!`,
    html: `
      <h1>Olá ${name},</h1>
      <p>Obrigado pelo interesse da <strong>${company}</strong> na NextOps AI.</p>
      <p>Vamos ajudá-lo a transformar os seus processos operacionais.</p>
      <p>Em breve entraremos em contacto consigo.</p>
    `,
  }),

  value: (name, _company) => ({
    subject: "Como empresas como a sua usam a NextOps AI",
    html: `
      <h1>Olá ${name},</h1>
      <p>Empresas do seu setor estão a usar a NextOps AI para:</p>
      <ul>
        <li>Automatizar processos manuais</li>
        <li>Obter visibilidade em tempo real</li>
        <li>Reduzir erros operacionais em 60%</li>
      </ul>
    `,
  }),

  "case-study": (name, _company) => ({
    subject: "Como a empresa X reduziu 40% do tempo operacional",
    html: `
      <h1>Olá ${name},</h1>
      <p>Veja como um dos nossos clientes conseguiu resultados impressionantes com a NextOps AI.</p>
      <p>Redução de 40% no tempo de operações e aumento de 25% na produtividade da equipa.</p>
    `,
  }),

  cta: (name, _company) => ({
    subject: "Agende uma demo personalizada da NextOps AI",
    html: `
      <h1>Olá ${name},</h1>
      <p>Gostaria de ver a NextOps AI em ação?</p>
      <p>Agende uma demonstração gratuita e descubra como podemos ajudar a sua empresa.</p>
      <p><a href="https://nextops-ai.com/#contacto">Agendar Demo</a></p>
    `,
  }),
};

const worker = new Worker(
  "email-sequence",
  async (job) => {
    const { email, name, company } = job.data;
    const templateFn = templates[job.name];

    if (!templateFn) {
      console.error(`[email-worker] Unknown template: ${job.name}`);
      return;
    }

    const { subject, html } = templateFn(name, company);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    console.log(`[email-worker] Sent "${job.name}" to ${email}:`, result);
  },
  { connection: { url: redisUrl } }
);

worker.on("failed", (job, err) => {
  console.error(`[email-worker] Job ${job?.id} failed:`, err);
});

worker.on("completed", (job) => {
  console.log(`[email-worker] Job ${job.id} completed: ${job.name}`);
});

export { worker };
