/**
 * Sentry Helpers (Modern 2026 API)
 * 
 * Simplified, maintainable utilities for error tracking and performance monitoring.
 * Follow Sentry 2026 best practices:
 * - Use automatic transaction tracing via middleware
 * - Minimize manual span creation
 * - Use callback pattern for async spans
 * - Filter noise at source
 * - Keep helpers lightweight
 * 
 * https://docs.sentry.io/platforms/javascript/
 */

import * as Sentry from '@sentry/node';

// ============================================================================
// CORE CHECK
// ============================================================================

/**
 * Check if Sentry is initialized and ready
 */
export const isSentryEnabled = () => {
  return Boolean(process.env.SENTRY_DSN && Sentry.getClient());
};

// ============================================================================
// EVENT CAPTURE
// ============================================================================

/**
 * Capture an error/exception
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export const captureException = (error, context = {}) => {
  if (!isSentryEnabled()) return;

  Sentry.captureException(error, {
    level: 'error',
    extra: context,
  });
};

/**
 * Capture a warning message (non-error event)
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
export const captureWarning = (message, context = {}) => {
  if (!isSentryEnabled()) return;

  Sentry.captureMessage(message, {
    level: 'warning',
    extra: context,
  });
};

/**
 * Capture an info message
 * @param {string} message - Info message
 * @param {Object} context - Additional context
 */
export const captureInfo = (message, context = {}) => {
  if (!isSentryEnabled()) return;

  Sentry.captureMessage(message, {
    level: 'info',
    extra: context,
  });
};

// ============================================================================
// SPAN/TRANSACTION TRACING (Modern Sentry v10 OpenTelemetry APIs)
// ============================================================================

/**
 * Get the currently active span from the async context
 */
export const getActiveSpan = () => Sentry.getActiveSpan();

/**
 * Start a span with automatic error handling (RECOMMENDED)
 * 
 * Modern Sentry v10 pattern - use this for all long-running operations.
 * The span automatically captures errors and closes when the callback completes.
 * 
 * @param {Object} options - Span options { name, op, description }
 * @param {Function} callback - Async function to execute within the span
 * @returns {Promise} Result of callback
 */
export const startSpan = (options, callback) => {
  if (!isSentryEnabled()) {
    return callback?.(null);
  }

  return Sentry.startSpan(
    {
      name: options.name || options.description || 'Span',
      op: options.op,
      attributes: {
        description: options.description,
        ...options.data,
      },
    },
    callback
  );
};

/**
 * Backward compatibility wrapper for startActiveSpan
 */
export const startActiveSpan = (options, callback) => {
  return startSpan(options, callback);
};

/**
 * Create a manual child span (for granular monitoring)
 * 
 * In Sentry v10, startInactiveSpan creates a span that is automatically
 * parented to the active span, but is not active. It must be manually ended.
 * 
 * @param {Object} config - { name, op, description, data }
 * @returns {Object|null} Span object (must call finishSpan(span) or span.end())
 */
export const createSpan = (config) => {
  if (!isSentryEnabled()) return null;

  return Sentry.startInactiveSpan({
    name: config.name || config.description || 'Operation',
    op: config.op,
    attributes: {
      description: config.description,
      ...config.data,
    },
  });
};

/**
 * Finish/end a manually created span
 * @param {Object} span - Span object to finish
 */
export const finishSpan = (span) => {
  if (span && typeof span.end === 'function') {
    span.end();
  }
};

/**
 * Add data/attributes to the current active span
 * 
 * @param {string} key - Attribute key
 * @param {*} value - Attribute value
 */
export const addSpanData = (key, value) => {
  const span = getActiveSpan();
  if (!span) return;

  try {
    span.setAttribute(key, value);
  } catch (e) {
    // Silently fail
  }
};

// ============================================================================
// CONTEXT & DEBUGGING
// ============================================================================

/**
 * Add a breadcrumb (navigation history for debugging)
 * 
 * @param {Object} breadcrumb - { message, category, data, level }
 */
export const addBreadcrumb = (breadcrumb) => {
  if (!isSentryEnabled()) return;

  Sentry.addBreadcrumb({
    level: breadcrumb.level || 'info',
    timestamp: Math.floor(Date.now() / 1000),
    ...breadcrumb,
  });
};

/**
 * Set the current user context
 * 
 * @param {Object} user - { id, email, username }
 */
export const setUser = (user) => {
  if (!isSentryEnabled()) return;
  Sentry.setUser(user);
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (!isSentryEnabled()) return;
  Sentry.setUser(null);
};

/**
 * Set custom tags for filtering/grouping in Sentry dashboard
 * 
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const setTag = (key, value) => {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default Sentry;
