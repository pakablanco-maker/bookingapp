/**
 * Sentry Instrumentation (Modern 2026/v10 API)
 * 
 * Initialize Sentry as early as possible.
 * This file must be imported at the very top of server.js before any other code.
 */

import "dotenv/config";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Define environment
const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

// Initialize Sentry with modern best practices
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  release: process.env.RELEASE_VERSION || "unknown",

  // Default integrations (HTTP, Express, etc.) are automatically handled by Sentry v10.
  // We only add profiling integration in production.
  integrations: [
    ...(isProduction ? [nodeProfilingIntegration()] : []),
  ],

  // Performance sample rates (optimized)
  tracesSampleRate: isProduction ? 0.1 : 0.25,
  profilesSampleRate: isProduction ? 0.05 : 0.01,

  // Ignore noisy/unactionable client-side or generic errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],

  // Filter sensitive data and transient system noise
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error) {
      const code = error.code;
      const message = error.message || "";
      // Exclude common transient connection/DNS/timeout issues
      if (
        ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "EPIPE"].includes(code) || 
        message.includes("ECONNREFUSED") || 
        message.includes("timeout")
      ) {
        return null;
      }
    }
    
    // Sanitize sensitive info in breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(bc => {
        const url = bc.data?.url;
        if (url && (url.includes("password") || url.includes("token") || url.includes("secret"))) {
          return false;
        }
        return true;
      });
    }
    return event;
  },

  beforeBreadcrumb(breadcrumb) {
    // Filter out health checks to avoid noise
    if (breadcrumb.category === "http.client" && breadcrumb.data?.url?.includes("health")) {
      return null;
    }
    return breadcrumb;
  }
});

// Log initialization status in development mode
if (isDevelopment) {
  console.log("✅ Sentry v10 initialized (development mode)");
  console.log(`   DSN: ${process.env.SENTRY_DSN ? "✓ Configured" : "✗ Missing"}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Trace Sample Rate: ${(Sentry.getClient()?.getOptions?.().tracesSampleRate ?? 0) * 100}%`);
}