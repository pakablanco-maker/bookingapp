import { sendMessageWithRestore, sendOwnerAlertWithRestore } from '../config/whtasappManager.js';
import * as Sentry from '@sentry/node';
import { captureException } from '../config/sentry.js';

// Envoyer une notification de confirmation de réservation
export const sendBookingConfirmation = async (bookingData) => {
    try {
        if (!bookingData.businessId) {
            console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
            return;
        }

        // Message de confirmation formaté
        const message = 
`Bonjour *${bookingData.customerName}*,

Votre réservation a été confirmée ! 🎉

*Détails de la réservation :*
🔹 *Service :* ${bookingData.serviceName}
📅 *Date :* ${bookingData.bookingDate}
⏰ *Heure :* ${bookingData.bookingTime}

Merci de votre confiance !
L'équipe *${bookingData.businessName}*`;

        // Instrument send with Sentry transaction
        const tx = Sentry.startTransaction({ op: 'notify.client', name: 'Send Booking Confirmation' });
        try {
            Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(tx));
            await sendMessageWithRestore(bookingData.businessId, bookingData.customerPhone, message);
        } catch (err) {
            captureException(err, { businessId: bookingData.businessId });
            throw err;
        } finally {
            tx.finish();
        }
    } catch (error) {
        console.error('[WhatsApp] Erreur lors de l\'envoi de la confirmation :', error);
    }
};

// Envoyer une notification d'annulation de réservation
export const sendBookingCancellation = async (bookingData) => {
    try {
        if (!bookingData.businessId) {
            console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
            return;
        }

        // Message d'annulation formaté
        const message = 
`Bonjour *${bookingData.customerName}*,

Nous vous informons que votre réservation a été annulée.

*Détails concernés :*
❌ *Service :* ${bookingData.serviceName}
📅 *Date :* ${bookingData.bookingDate}
⏰ *Heure :* ${bookingData.bookingTime}

Nous espérons vous revoir bientôt.
L'équipe *${bookingData.businessName}*`;

        const tx = Sentry.startTransaction({ op: 'notify.client', name: 'Send Booking Cancellation' });
        try {
            Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(tx));
            await sendMessageWithRestore(bookingData.businessId, bookingData.customerPhone, message);
        } catch (err) {
            captureException(err, { businessId: bookingData.businessId });
            throw err;
        } finally {
            tx.finish();
        }
    } catch (error) {
        console.error('[WhatsApp] Erreur lors de l\'envoi de l\'annulation :', error);
    }
};

/**
 * Envoie une alerte au PROPRIÉTAIRE de l'entreprise sur son propre numéro WhatsApp connecté
 * lorsqu'un client soumet une nouvelle demande de réservation.
 * Gère l'auto-restauration et la mise en file d'attente via sendOwnerAlertWithRestore.
 */
export const sendOwnerPendingAlert = async (businessId, appointmentData) => {
    try {
        const tx = Sentry.startTransaction({ op: 'notify.owner', name: 'Send Owner Pending Alert' });
        try {
            Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(tx));
            await sendOwnerAlertWithRestore(businessId, appointmentData);
        } catch (err) {
            captureException(err, { businessId, appointmentId: appointmentData?.appointmentId });
            throw err;
        } finally {
            tx.finish();
        }
    } catch (error) {
        console.error('[WhatsApp] Erreur lors de l\'envoi de l\'alerte propriétaire :', error);
    }
};

export const sendBookingReminder = () => {
    // Logic to send booking reminder via WhatsApp
    console.log('Booking reminder sent via WhatsApp');
};