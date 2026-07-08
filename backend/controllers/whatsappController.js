import { initializeWhatsApp, getSessionStatus, forceCleanSession } from "../config/whtasappManager.js";

const setupWhatsAppForBusiness = async (req, res) => {
    try {
        const businessId = req.userId; // Récupéré de ton middleware authenticate.js

        if (!businessId) {
            return res.status(401).json({ success: false, message: "Non autorisé." });
        }

        // On lance l'initialisation (le QR code sera envoyé via Socket)
        initializeWhatsApp(businessId);

        // RÉPONSE CRUCIALE pour éviter la 404/Timeout
        return res.status(200).json({ 
            success: true, 
            message: "Initialisation lancée. Surveillez le socket pour le QR code." 
        });
        
    } catch (error) {
        console.error(`Erreur WhatsApp Controller:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWhatsAppStatus = async (req, res) => {
    try {
        const businessId = req.userId;

        if (!businessId) {
            return res.status(401).json({ success: false, message: "Non autorisé." });
        }

        const { status, qr } = getSessionStatus(businessId);

        return res.status(200).json({
            success: true,
            status,
            qr
        });
    } catch (error) {
        console.error(`Erreur WhatsApp Status Controller:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { setupWhatsAppForBusiness, getWhatsAppStatus };

const restartSession = async (req, res) => {
    try {
        // Allow business to restart their own session; admins may pass businessId in body
        const requesterRole = req.user?.role;
        let targetBusinessId = req.userId;

        if (requesterRole === 'admin' && req.body?.businessId) {
            targetBusinessId = req.body.businessId;
        }

        const ok = await forceCleanSession(targetBusinessId);
        if (ok) {
            return res.status(200).json({ success: true, message: 'Session forcée nettoyée.' });
        }
        return res.status(500).json({ success: false, message: 'Impossible de nettoyer la session.' });
    } catch (error) {
        console.error(`Erreur restartSession:`, error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { restartSession };