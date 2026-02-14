import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

const connection = { url: redisUrl };

export const emailQueue = new Queue("email-sequence", { connection });

type EmailSequenceJob = {
  leadId: string;
  email: string;
  name: string;
  company: string;
};

export async function enqueueEmailSequence(data: EmailSequenceJob) {
  // Step 1: Welcome email — sent immediately
  await emailQueue.add("welcome", data, { delay: 0 });

  // Step 2: Value email — sent after 2 days
  await emailQueue.add("value", data, { delay: 2 * 24 * 60 * 60 * 1000 });

  // Step 3: Case study — sent after 5 days
  await emailQueue.add("case-study", data, { delay: 5 * 24 * 60 * 60 * 1000 });

  // Step 4: CTA — sent after 7 days
  await emailQueue.add("cta", data, { delay: 7 * 24 * 60 * 60 * 1000 });
}
