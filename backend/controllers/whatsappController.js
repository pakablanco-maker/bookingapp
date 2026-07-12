import { captureException, startActiveSpan, addBreadcrumb } from '../config/sentry.js';
import { initializeWhatsApp, getSessionStatus, forceCleanSession } from "../config/whtasappManager.js";

const setupWhatsAppForBusiness = async (req, res) => {
  return await startActiveSpan(
    {
      name: 'WhatsApp Setup',
      op: 'whatsapp.setup',
      description: 'Initialize WhatsApp for business',
    },
    async (span) => {
      try {
        const businessId = req.userId;

        if (!businessId) {
          return res.status(401).json({ success: false, message: "Non autorisé." });
        }

        // Track the setup attempt
        if (span) {
          span.setAttribute('business.id', businessId);
        }

        addBreadcrumb({
          category: 'whatsapp.setup',
          message: 'WhatsApp initialization started',
          level: 'info',
          data: { businessId },
        });

        initializeWhatsApp(businessId);

        return res.status(200).json({
          success: true,
          message: "Initialisation lancée. Surveillez le socket pour le QR code.",
        });
      } catch (error) {
        captureException(error, { module: 'whatsapp.controller.setup' });
        console.error(`Erreur WhatsApp Controller:`, error);
        res.status(500).json({ success: false, message: error.message });
      }
    }
  );
};

const getWhatsAppStatus = async (req, res) => {
  return await startActiveSpan(
    {
      name: 'WhatsApp Status',
      op: 'whatsapp.status',
      description: 'Get WhatsApp session status',
    },
    async (span) => {
      try {
        const businessId = req.userId;

        if (!businessId) {
          return res.status(401).json({ success: false, message: "Non autorisé." });
        }

        // Track the status check
        if (span) {
          span.setAttribute('business.id', businessId);
        }

        const { status, qr } = getSessionStatus(businessId);

        if (span) {
          span.setAttribute('whatsapp.status', status);
          span.setAttribute('whatsapp.qr_available', Boolean(qr));
        }

        addBreadcrumb({
          category: 'whatsapp.status',
          message: `WhatsApp status check: ${status}`,
          level: 'info',
          data: { businessId, status },
        });

        return res.status(200).json({
          success: true,
          status,
          qr,
        });
      } catch (error) {
        captureException(error, { module: 'whatsapp.controller.status' });
        console.error(`Erreur WhatsApp Status Controller:`, error);
        res.status(500).json({ success: false, message: error.message });
      }
    }
  );
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