import mongoose from 'mongoose';

/**
 * Lie un message WhatsApp envoyé au propriétaire à un rendez-vous précis.
 * Sert à retrouver le RDV lors d'une réponse quotée (hasQuotedMsg).
 * TTL de 24h : auto-suppression pour ne pas polluer la base.
 */
const appointmentMessageSchema = new mongoose.Schema(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true,
        },
        // ID sérialisé du message WhatsApp envoyé au propriétaire
        messageId: {
            type: String,
            required: true,
            unique: true,
        },
        // Code court humain (ex: "A472") — redondant pour débogage rapide
        shortCode: {
            type: String,
            required: true,
        },
        // TTL : le document sera automatiquement supprimé 24h après sa création
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 86400, // 24 heures en secondes
        },
    }
);

appointmentMessageSchema.index({ messageId: 1 });
appointmentMessageSchema.index({ businessId: 1 });

export default mongoose.model('AppointmentMessage', appointmentMessageSchema);
