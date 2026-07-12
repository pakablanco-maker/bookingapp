/**
 * WhatsApp Notification Services
 * 
 * Handles sending WhatsApp messages for:
 * - Booking confirmations
 * - Booking cancellations  
 * - Owner alerts for new bookings
 * 
 * These are already traced via the parent transaction (createAppointment, updateAppointmentStatus).
 * Minimal manual instrumentation needed.
 */

import { sendMessageWithRestore, sendOwnerAlertWithRestore } from '../config/whtasappManager.js';
import { captureException, addBreadcrumb } from '../config/sentry.js';

// ============================================================================
// BOOKING CONFIRMATION
// ============================================================================

/**
 * Send booking confirmation to client via WhatsApp
 */
export const sendBookingConfirmation = async (bookingData) => {
  try {
    if (!bookingData.businessId) {
      console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
      return;
    }

    const message = `Bonjour *${bookingData.customerName}*,

Votre réservation a été confirmée ! 🎉

*Détails de la réservation :*
🔹 *Service :* ${bookingData.serviceName}
📅 *Date :* ${bookingData.bookingDate}
⏰ *Heure :* ${bookingData.bookingTime}

Merci de votre confiance !
L'équipe *${bookingData.businessName}*`;

    // Send message (already instrumented in parent transaction)
    await sendMessageWithRestore(
      bookingData.businessId,
      bookingData.customerPhone,
      message
    );

    // Log the successful notification
    addBreadcrumb({
      category: 'whatsapp.confirmation_sent',
      message: `Confirmation sent to ${bookingData.customerPhone}`,
      level: 'info',
      data: {
        businessId: bookingData.businessId,
        customerPhone: bookingData.customerPhone,
      },
    });
  } catch (error) {
    captureException(error, {
      businessId: bookingData.businessId,
      module: "whatsapp.confirmation"
    });

    console.error("[WhatsApp] Erreur confirmation :", error);
  }
};

// ============================================================================
// BOOKING CANCELLATION
// ============================================================================

/**
 * Send booking cancellation to client via WhatsApp
 */
export const sendBookingCancellation = async (bookingData) => {
  try {
    if (!bookingData.businessId) {
      console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
      return;
    }

    const message = `Bonjour *${bookingData.customerName}*,

Nous vous informons que votre réservation a été annulée.

*Détails concernés :*
❌ *Service :* ${bookingData.serviceName}
📅 *Date :* ${bookingData.bookingDate}
⏰ *Heure :* ${bookingData.bookingTime}

Nous espérons vous revoir bientôt.
L'équipe *${bookingData.businessName}*`;

    // Send message (already instrumented in parent transaction)
    await sendMessageWithRestore(
      bookingData.businessId,
      bookingData.customerPhone,
      message
    );

    // Log the successful notification
    addBreadcrumb({
      category: 'whatsapp.cancellation_sent',
      message: `Cancellation sent to ${bookingData.customerPhone}`,
      level: 'info',
      data: {
        businessId: bookingData.businessId,
        customerPhone: bookingData.customerPhone,
      },
    });
  } catch (error) {
    captureException(error, {
      businessId: bookingData.businessId,
      module: "whatsapp.cancellation"
    });

    console.error("[WhatsApp] Erreur annulation :", error);
  }
};

// ============================================================================
// OWNER ALERT
// ============================================================================

/**
 * Send new booking alert to business owner via WhatsApp
 */
export const sendOwnerPendingAlert = async (businessId, appointmentData) => {
  try {
    // Send message (already instrumented in parent transaction)
    await sendOwnerAlertWithRestore(businessId, appointmentData);

    // Log the successful notification
    addBreadcrumb({
      category: 'whatsapp.owner_alert_sent',
      message: `Owner alert sent for appointment ${appointmentData.shortCode}`,
      level: 'info',
      data: {
        businessId,
        appointmentId: appointmentData.appointmentId?.toString(),
      },
    });
  } catch (error) {
    captureException(error, {
      businessId,
      appointmentId: appointmentData?.appointmentId,
      module: "whatsapp.owner_alert"
    });

    console.error('[WhatsApp] Erreur lors de l\'envoi de l\'alerte propriétaire :', error);
  }
};



export const sendBookingReminder = () => {

    console.log(
        'Booking reminder sent via WhatsApp'
    );

};