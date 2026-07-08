import { sendMessageWithRestore, sendOwnerAlertWithRestore } from '../config/whtasappManager.js';

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

        await sendMessageWithRestore(bookingData.businessId, bookingData.customerPhone, message);
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

        await sendMessageWithRestore(bookingData.businessId, bookingData.customerPhone, message);
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
        await sendOwnerAlertWithRestore(businessId, appointmentData);
    } catch (error) {
        console.error('[WhatsApp] Erreur lors de l\'envoi de l\'alerte propriétaire :', error);
    }
};

export const sendBookingReminder = () => {
    // Logic to send booking reminder via WhatsApp
    console.log('Booking reminder sent via WhatsApp');
};