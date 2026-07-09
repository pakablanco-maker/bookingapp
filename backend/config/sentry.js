import * as Sentry from '@sentry/node';

/**
 * Helper functions for manual error/warning/info capture
 * Sentry is initialized in instrument.js and must be imported at the top of server.js
 */

/**
 * Capturer une exception manuellement
 */
export const captureException = (error, context = {}) => {
    Sentry.captureException(error, { extra: context });
};

/**
 * Capturer un message de warning
 */
export const captureWarning = (message, context = {}) => {
    Sentry.captureMessage(message, 'warning', { extra: context });
};

/**
 * Capturer un message d'info
 */
export const captureInfo = (message, context = {}) => {
    Sentry.captureMessage(message, 'info', { extra: context });
};

export default Sentry;
