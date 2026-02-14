import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { healthRoutes } from "./routes/health.js";
import { leadRoutes } from "./routes/leads.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.route("/", healthRoutes);
app.route("/leads", leadRoutes);

const port = Number(process.env.PORT) || 3001;

console.log(`[NextOps API] Starting on port ${port}`);

serve({ fetch: app.fetch, port });
