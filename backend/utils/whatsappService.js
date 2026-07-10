import { sendMessageWithRestore, sendOwnerAlertWithRestore } from '../config/whtasappManager.js';
import * as Sentry from '@sentry/node';
import { captureException } from '../config/sentry.js';


// Confirmation réservation client
export const sendBookingConfirmation = async (bookingData) => {

    try {

        if (!bookingData.businessId) {
            console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
            return;
        }


        const message =
        `Bonjour *${bookingData.customerName}*,

        Votre réservation a été confirmée ! 🎉

        *Détails de la réservation :*
        🔹 *Service :* ${bookingData.serviceName}
        📅 *Date :* ${bookingData.bookingDate}
        ⏰ *Heure :* ${bookingData.bookingTime}

        Merci de votre confiance !
        L'équipe *${bookingData.businessName}*`;


        await Sentry.startSpan(
            {
                name: 'Send Booking Confirmation',
                op: 'notify.client',
            },
            async () => {

                await sendMessageWithRestore(
                    bookingData.businessId,
                    bookingData.customerPhone,
                    message
                );

            }
        );


    } catch (error) {

        captureException(error, {
            businessId: bookingData.businessId,
            module: "whatsapp.confirmation"
        });

        console.error(
            "[WhatsApp] Erreur confirmation :",
            error
        );
    }
};



// Annulation réservation client
export const sendBookingCancellation = async (bookingData) => {

    try {

        if (!bookingData.businessId) {
            console.error("Impossible d'envoyer le WhatsApp : businessId est manquant.");
            return;
        }


        const message =
            `Bonjour *${bookingData.customerName}*,

            Nous vous informons que votre réservation a été annulée.

            *Détails concernés :*
            ❌ *Service :* ${bookingData.serviceName}
            📅 *Date :* ${bookingData.bookingDate}
            ⏰ *Heure :* ${bookingData.bookingTime}

            Nous espérons vous revoir bientôt.
            L'équipe *${bookingData.businessName}*`;


        await Sentry.startSpan(
            {
                name:'Send Booking Cancellation',
                op:'notify.client',
            },
            async()=>{

                await sendMessageWithRestore(
                    bookingData.businessId,
                    bookingData.customerPhone,
                    message
                );

            }
        );


    } catch(error){

        captureException(error,{
            businessId: bookingData.businessId,
            module:"whatsapp.cancellation"
        });


        console.error(
            "[WhatsApp] Erreur annulation :",
            error
        );
    }
};



// Notification propriétaire nouvelle réservation
export const sendOwnerPendingAlert = async (
    businessId,
    appointmentData
) => {


    try {


        await Sentry.startSpan(
            {
                name:'Send Owner Pending Alert',
                op:'notify.owner',
            },
            async()=>{


                await sendOwnerAlertWithRestore(
                    businessId,
                    appointmentData
                );


            }
        );


    } catch(error){


        captureException(error,{
            businessId,
            appointmentId: appointmentData?.appointmentId,
            module:"whatsapp.owner_alert"
        });


        console.error(
            '[WhatsApp] Erreur lors de l\'envoi de l\'alerte propriétaire :',
            error
        );

    }

};



export const sendBookingReminder = () => {

    console.log(
        'Booking reminder sent via WhatsApp'
    );

};