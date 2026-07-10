import * as Sentry from '@sentry/node';

/**
 * Helper functions for manual error/warning/info capture
 * Sentry is initialized in instrument.js and must be imported at the top of server.js
 */

/**
 * Capturer une exception manuellement
 */
const isSentryEnabled = () => Boolean(process.env.SENTRY_DSN && Sentry.getClient());

export const captureException = (error, context = {}) => {
    if (!isSentryEnabled()) {
        console.warn('[Sentry] Exception not sent because Sentry is not initialized.');
        return;
    }
    Sentry.captureException(error, { extra: context });
};

/**
 * Capturer un message de warning
 */
export const captureWarning = (message, context = {}) => {
    if (!isSentryEnabled()) {
        console.warn('[Sentry] Warning not sent because Sentry is not initialized.');
        return;
    }
    Sentry.captureMessage(message, 'warning', { extra: context });
};

/**
 * Capturer un message d'info
 */
export const captureInfo = (message, context = {}) => {
    if (!isSentryEnabled()) {
        console.warn('[Sentry] Info not sent because Sentry is not initialized.');
        return;
    }
    Sentry.captureMessage(message, 'info', { extra: context });
};

export default Sentry;
