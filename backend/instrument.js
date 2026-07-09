import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",

  integrations: [
    nodeProfilingIntegration(),
  ],

  tracesSampleRate:
    process.env.NODE_ENV === "production" ? 0.1 : 1,

  profileSessionSampleRate: 1,
  profileLifecycle: "trace",

  enableLogs: true,
});

console.log("Sentry DSN:", process.env.SENTRY_DSN ? "OK" : "MISSING");
console.log("Node Environment:", process.env.NODE_ENV ?? "development");

console.log("✅ Sentry initialized");