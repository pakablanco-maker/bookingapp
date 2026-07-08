import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { io } from '../server.js'; // On importe l'instance socket
import winston from 'winston'; // Logger pour des logs détaillés
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import AppointmentMessage from '../models/AppointmentMessage.js';

const sessions = new Map(); // Stockage des instances actives
const sessionStatuses = new Map(); // businessId -> { status: 'idle'|'loading'|'qr'|'ready'|'failed', qr: string|null }
const messageQueues = new Map(); // businessId -> Array of { customerPhone, message }
const ownerAlertQueues = new Map(); // businessId -> Array of { appointmentId, shortCode, clientName, clientPhone, serviceName, bookingDate, bookingTime }

// Configuration du logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/whatsappManager.log' })
    ]
});

export const initializeWhatsApp = (businessId) => {
    if (sessions.has(businessId)) {
        logger.info(`Session existante récupérée pour le business: ${businessId}`);
        return sessions.get(businessId);
    }

    sessionStatuses.set(businessId, { status: 'loading', qr: null });

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: businessId }),
        puppeteer: {
            headless: true,
            executablePath: puppeteer.executablePath(),
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--disable-gpu",
                "--disable-extensions",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-shared-workers",
                "--autoplay-policy=no-user-gesture-required",
            ],
            timeout: 60000,
        },
    });

    // Envoyer le QR code au frontend spécifique via Socket.io
    client.on('qr', (qr) => {
        logger.info(`QR généré pour le business: ${businessId}`);
        sessionStatuses.set(businessId, { status: 'qr', qr });
        io.to(businessId).emit('whatsapp-qr', { qr });
    });

    client.on('ready', async () => {
        logger.info(`WhatsApp prêt pour: ${businessId}`);
        sessionStatuses.set(businessId, { status: 'ready', qr: null });
        io.to(businessId).emit('whatsapp-status', { status: 'ready' });

        // Envoyer les messages en file d'attente
        if (messageQueues.has(businessId) && messageQueues.get(businessId).length > 0) {
            const queuedMessages = messageQueues.get(businessId);
            for (const queued of queuedMessages) {
                try {
                    await client.sendMessage(queued.customerPhone, queued.message);
                    logger.info(`Message en file d'attente envoyé pour ${businessId} à ${queued.customerPhone}`);
                } catch (err) {
                    logger.error(`Erreur envoi message en file pour ${businessId}: ${err.message}`);
                }
            }
            messageQueues.set(businessId, []);
        }

        // Envoyer les alertes propriétaire en file d'attente
        if (ownerAlertQueues.has(businessId) && ownerAlertQueues.get(businessId).length > 0) {
            const queuedAlerts = ownerAlertQueues.get(businessId);
            for (const alertData of queuedAlerts) {
                try {
                    await sendOwnerAlertWithRestore(businessId, alertData);
                } catch (err) {
                    logger.error(`Erreur envoi alerte propriétaire depuis la file pour ${businessId}: ${err.message}`);
                }
            }
            ownerAlertQueues.set(businessId, []);
        }
    });

    // Initialise le client avec retries pour gérer les cas où
    // un navigateur est déjà lancé pour le même dossier de session.

    client.on('authenticated', () => {
        logger.info(`Authentification réussie pour: ${businessId}`);
        sessionStatuses.set(businessId, { status: 'ready', qr: null });
        io.to(businessId).emit('whatsapp-status', { status: 'authenticated' });
    });

    client.on('auth_failure', (error) => {
        logger.error(`Échec d'authentification pour ${businessId}: ${error}`);
        sessionStatuses.set(businessId, { status: 'failed', qr: null });
        io.to(businessId).emit('whatsapp-status', { status: 'failed' });
    });

    client.on('disconnected', async (reason) => {
        logger.warn(`Client déconnecté pour ${businessId}: ${reason}`);

        // Retirer la session immédiatement pour éviter la réutilisation
        sessions.delete(businessId);
        sessionStatuses.set(businessId, { status: 'idle', qr: null });
        io.to(businessId).emit('whatsapp-status', { status: 'disconnected' });

        // Délai pour laisser Chromium fermer ses handles avant que LocalAuth
        // tente de supprimer le lockfile (évite EBUSY sur Windows)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await client.destroy();
            logger.info(`Client détruit proprement pour: ${businessId}`);
        } catch (destroyErr) {
            // Ignorer les erreurs EBUSY résiduelles lors du nettoyage
            if (destroyErr?.message?.includes('EBUSY') || destroyErr?.message?.includes('ENOENT')) {
                logger.warn(`Erreur ignorée lors de la destruction (${businessId}): ${destroyErr.message}`);
            } else {
                logger.error(`Erreur lors de la destruction (${businessId}): ${destroyErr.message}`);
            }
        }
    });

    // Déduplication : Set circulaire des 200 derniers IDs de messages traités
    const processedMsgIds = new Set();

    // Parser de commandes de propriétaire réutilisable
    const processIncomingOwnerMessage = async (msg, source) => {
        try {
            // ── Filtre de déduplication ──
            const msgId = msg.id?._serialized || msg.id?.id || null;
            if (msgId) {
                if (processedMsgIds.has(msgId)) return; // déjà traité
                processedMsgIds.add(msgId);
                if (processedMsgIds.size > 200) {
                    const first = processedMsgIds.values().next().value;
                    processedMsgIds.delete(first);
                }
            }

            const rawText = msg.body?.trim() || '';
            const text = rawText.toLowerCase();
            const from = msg.from || '';
            const fromMe = Boolean(msg.fromMe);
            const ownerJid = client.info?.wid?._serialized || client.info?.me?._serialized;
            const normalizeJid = (jid) => jid?.toString()?.replace(/@s\.whatsapp\.net$|@c\.us$/i, '') || '';
            const fromNormalized = normalizeJid(from);
            const ownerNormalized = normalizeJid(ownerJid);
            const authorNormalized = normalizeJid(msg.author);
            const isGroup = from.includes('@g.us');
            const isBroadcast = from.includes('@broadcast');
            const isOwner = fromNormalized === ownerNormalized || authorNormalized === ownerNormalized;

            // Ignorer les groupes, les broadcasts, et les non-propriétaires
            if (isGroup || isBroadcast) return;
            if (!isOwner) return;
            // Autoriser les messages self-chat du propriétaire via message_create,
            // mais ignorer les autres messages sortants du client.
            if (fromMe && source !== 'message_create') return;

            const applyAction = async (appointment, action) => {
                if (!appointment) {
                    await client.sendMessage(msg.from, '❌ Rendez-vous introuvable ou déjà traité.');
                    return;
                }
                if (appointment.status !== 'pending') {
                    await client.sendMessage(msg.from,
                        `⚠️ Ce rendez-vous (${appointment.shortCode}) est déjà *${appointment.status}*. Aucune modification.`);
                    return;
                }

                const populated = await Appointment.findByIdAndUpdate(
                    appointment._id,
                    { status: action },
                    { new: true }
                ).populate('serviceId', 'name').populate('businessId', 'name');

                const { sendBookingConfirmation, sendBookingCancellation } = await import('../utils/whatsappService.js');

                if (action === 'confirmed') {
                    sendBookingConfirmation({
                        businessId: businessId,
                        customerPhone: populated.clientPhone,
                        customerName: populated.clientName,
                        serviceName: populated.serviceId?.name || 'Service',
                        bookingDate: populated.appointmentDate.toLocaleDateString('fr-FR'),
                        bookingTime: populated.startTime,
                        businessName: populated.businessId?.name || 'Notre établissement',
                    });
                    await client.sendMessage(msg.from,
                        `✅ *RDV ${appointment.shortCode} confirmé !*\n👤 ${appointment.clientName} a été notifié(e) sur WhatsApp.`);
                } else {
                    sendBookingCancellation({
                        businessId: businessId,
                        customerPhone: populated.clientPhone,
                        customerName: populated.clientName,
                        serviceName: populated.serviceId?.name || 'Service',
                        bookingDate: populated.appointmentDate.toLocaleDateString('fr-FR'),
                        bookingTime: populated.startTime,
                        businessName: populated.businessId?.name || 'Notre établissement',
                    });
                    await client.sendMessage(msg.from,
                        `❌ *RDV ${appointment.shortCode} annulé.*\n👤 ${appointment.clientName} a été notifié(e) sur WhatsApp.`);
                }

                await AppointmentMessage.deleteMany({ appointmentId: appointment._id });
            };

            if (msg.hasQuotedMsg) {
                const quoted = await msg.getQuotedMessage();
                const record = await AppointmentMessage.findOne({ messageId: quoted.id._serialized });
                if (record) {
                    const appointment = await Appointment.findById(record.appointmentId);
                    const action = (rawText === '1' || rawText.startsWith('oui') || rawText.startsWith('confirm'))
                        ? 'confirmed'
                        : (rawText === '0' || rawText.startsWith('non') || rawText.startsWith('annul'))
                        ? 'cancelled'
                        : null;

                    logger.info(`[WhatsApp] quoted reply detected rawText="${rawText}" action=${action} shortCode=${record.shortCode} source=${source}`);

                    if (action) {
                        await applyAction(appointment, action);
                        return;
                    }
                    await client.sendMessage(msg.from,
                        `⚠️ Répondez *1* pour confirmer ou *0* pour annuler le RDV *${record.shortCode}*.`);
                    return;
                }
            }

            const codeMatch = rawText.match(/^([+\-])([A-Z]\d{3,4})$/i);
            if (codeMatch) {
                const action = codeMatch[1] === '+' ? 'confirmed' : 'cancelled';
                const code = codeMatch[2].toUpperCase();
                logger.info(`[WhatsApp] code command detected rawText="${rawText}" action=${action} code=${code} source=${source}`);
                const appointment = await Appointment.findOne({ shortCode: code, businessId: new mongoose.Types.ObjectId(businessId) });
                await applyAction(appointment, action);
                return;
            }

            if (rawText === '1' || rawText === '0') {
                logger.info(`[WhatsApp] simple command detected rawText="${rawText}" source=${source}`);
                const pending = await Appointment.find({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    status: 'pending'
                }).sort({ createdAt: 1 });

                if (pending.length === 0) {
                    await client.sendMessage(msg.from, 'ℹ️ Aucun rendez-vous en attente de validation.');
                } else if (pending.length === 1) {
                    const action = rawText === '1' ? 'confirmed' : 'cancelled';
                    await applyAction(pending[0], action);
                } else {
                    let listText = `⚠️ Vous avez *${pending.length} rendez-vous* en attente. Utilisez le code court pour préciser :\n\n`;
                    pending.forEach(rdv => {
                        const d = rdv.appointmentDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                        listText += `*+${rdv.shortCode}* ${rdv.clientName} — ${d} ${rdv.startTime}\n`;
                    });
                    listText += '\nEx : *+A472* pour confirmer, *-A472* pour annuler.';
                    await client.sendMessage(msg.from, listText);
                }
                return;
            }

            if (text === 'pending' || text === 'liste' || text === 'list') {
                logger.info(`[WhatsApp] pending/list command detected rawText="${rawText}" source=${source}`);
                const pending = await Appointment.find({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    status: 'pending'
                }).sort({ appointmentDate: 1, startTime: 1 });

                if (pending.length === 0) {
                    await client.sendMessage(msg.from, '✅ Aucun rendez-vous en attente.');
                } else {
                    let reply = `📋 *Rendez-vous en attente (${pending.length})*\n${'─'.repeat(20)}\n`;
                    pending.forEach(rdv => {
                        const d = rdv.appointmentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
                        reply += `\n🆔 *${rdv.shortCode}* — ${rdv.clientName}\n📅 ${d} à ${rdv.startTime}\n📞 ${rdv.clientPhone}\n`;
                    });
                    reply += `\n*+CODE* pour confirmer, *-CODE* pour annuler`;
                    await client.sendMessage(msg.from, reply);
                }
                return;
            }

            if (text === 'today' || text === "aujourd'hui" || text === 'auj') {
                logger.info(`[WhatsApp] today command detected rawText="${rawText}" source=${source}`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todayAppts = await Appointment.find({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    appointmentDate: { $gte: today, $lt: tomorrow },
                    status: { $in: ['pending', 'confirmed'] }
                }).sort({ startTime: 1 });

                if (todayAppts.length === 0) {
                    await client.sendMessage(msg.from, '📅 Aucun rendez-vous prévu aujourd\'hui.');
                } else {
                    let reply = `📅 *Planning du jour (${todayAppts.length} RDV)*\n${'─'.repeat(20)}\n`;
                    todayAppts.forEach(rdv => {
                        const icon = rdv.status === 'confirmed' ? '✅' : '⏳';
                        reply += `\n${icon} *${rdv.startTime}* — ${rdv.clientName} (${rdv.shortCode || '-'})\n`;
                    });
                    await client.sendMessage(msg.from, reply);
                }
                return;
            }

            if (text === 'confirmed' || text === 'confirmé' || text === 'confirmes') {
                logger.info(`[WhatsApp] confirmed command detected rawText="${rawText}" source=${source}`);
                const confirmed = await Appointment.find({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    status: 'confirmed'
                }).sort({ appointmentDate: 1 }).limit(10);

                if (confirmed.length === 0) {
                    await client.sendMessage(msg.from, 'ℹ️ Aucun rendez-vous confirmé en ce moment.');
                } else {
                    let reply = `✅ *Confirmés (${confirmed.length})*\n`;
                    confirmed.forEach(rdv => {
                        const d = rdv.appointmentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                        reply += `\n• ${rdv.clientName} — ${d} ${rdv.startTime}`;
                    });
                    await client.sendMessage(msg.from, reply);
                }
                return;
            }

            if (text === 'cancelled' || text === 'annulé' || text === 'annules') {
                logger.info(`[WhatsApp] cancelled command detected rawText="${rawText}" source=${source}`);
                const cancelled = await Appointment.find({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    status: 'cancelled'
                }).sort({ updatedAt: -1 }).limit(10);

                if (cancelled.length === 0) {
                    await client.sendMessage(msg.from, 'ℹ️ Aucune annulation récente.');
                } else {
                    let reply = `❌ *Annulés récents (${cancelled.length})*\n`;
                    cancelled.forEach(rdv => {
                        const d = rdv.appointmentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                        reply += `\n• ${rdv.clientName} — ${d} ${rdv.startTime}`;
                    });
                    await client.sendMessage(msg.from, reply);
                }
                return;
            }

            if (text === 'help' || text === 'aide' || text === '?') {
                logger.info(`[WhatsApp] help command detected rawText="${rawText}" source=${source}`);
                const helpMsg =
`🤖 *Commandes disponibles*
${'─'.repeat(25)}

*Voir les RDV :*
▸ *pending* ou *liste* → RDV en attente
▸ *today* → Planning du jour
▸ *confirmed* → RDV confirmés
▸ *cancelled* → Annulations récentes

*Gérer les RDV :*
▸ *+CODE* → Confirmer le RDV
▸ *-CODE* → Annuler le RDV
▸ *1* → Confirmer (si 1 seul en attente)
▸ *0* → Annuler (si 1 seul en attente)

*Autre :*
▸ *help* / *aide* / *?* → Afficher cette aide
${'─'.repeat(25)}`;
                await client.sendMessage(msg.from, helpMsg);
                return;
            }

            logger.info(`[WhatsApp] command non reconnu rawText="${rawText}" source=${source}`);
            await client.sendMessage(msg.from, '⚠️ Commande non reconnue. Envoyez *help* pour la liste des commandes.');
        } catch (err) {
            logger.error(`[Parser WhatsApp] Erreur pour ${businessId}: ${err.message}`);
        }
    };

    client.on('message', async (msg) => processIncomingOwnerMessage(msg, 'message'));
    client.on('message_create', async (msg) => processIncomingOwnerMessage(msg, 'message_create'));
    (async () => {
        const maxAttempts = 4;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await client.initialize();
                break; // succès
            } catch (err) {
                logger.error(`Erreur initialisation (tentative ${attempt}) pour ${businessId}: ${err.message}`);

                const isRetryable = err?.message && (
                    err.message.includes('already running') ||
                    err.message.includes('EBUSY') ||
                    err.message.toLowerCase().includes('lockfile')
                );

                if (attempt < maxAttempts && isRetryable) {
                    const waitMs = 2000 * attempt;
                    logger.warn(`Attente ${waitMs}ms avant nouvelle tentative pour ${businessId}...`);
                    await new Promise(r => setTimeout(r, waitMs));
                    continue;
                }

                // Échec final — signaler et nettoyer
                sessions.delete(businessId);
                sessionStatuses.set(businessId, { status: 'failed', qr: null });
                io.to(businessId).emit('whatsapp-status', { status: 'failed', reason: err.message });
                try {
                    await client.destroy();
                } catch (e) {
                    // Ignorer les erreurs de destruction
                }
                return;
            }
        }
    })();

    sessions.set(businessId, client);
    logger.info(`Nouvelle session initialisée pour le business: ${businessId}`);

    return client;
};

export const getSession = (businessId) => {
    const session = sessions.get(businessId);
    if (session) {
        logger.info(`Session récupérée pour le business: ${businessId}`);
    } else {
        logger.warn(`Aucune session trouvée pour le business: ${businessId}`);
    }
    return session;
};

export const getSessionStatus = (businessId) => {
    const currentStatus = sessionStatuses.get(businessId);
    
    // Double check si le navigateur est toujours vivant
    if (currentStatus && currentStatus.status === 'ready') {
        const client = sessions.get(businessId);
        if (!client || !client.pupBrowser || !client.pupPage || client.pupPage.isClosed()) {
            logger.warn(`La session de ${businessId} est marquée comme active mais le navigateur est injoignable ou fermé. Nettoyage...`);
            sessions.delete(businessId);
            sessionStatuses.delete(businessId);
            return { status: 'idle', qr: null };
        }
    }

    // Si aucun statut n'est en mémoire (ex: redémarrage serveur ou première visite)
    // ET qu'il existe un dossier de session locale sur le disque, on la restaure automatiquement.
    if (!currentStatus) {
        const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
        if (fs.existsSync(sessionPath)) {
            logger.info(`Session sauvegardée détectée pour le business ${businessId}. Restauration automatique en cours...`);
            initializeWhatsApp(businessId);
            return { status: 'loading', qr: null };
        }
    }
    
    return currentStatus || { status: 'idle', qr: null };
};

export const queueMessage = (businessId, customerPhone, message) => {
    if (!messageQueues.has(businessId)) {
        messageQueues.set(businessId, []);
    }
    messageQueues.get(businessId).push({ customerPhone, message });
    logger.info(`Message mis en file d'attente pour ${businessId} (tél: ${customerPhone})`);
};

export const formatPhoneToJid = async (client, rawPhone) => {
    // 1. Nettoyer le numéro (garder uniquement les chiffres)
    let cleaned = rawPhone.replace(/\D/g, '');

    // 2. Si le numéro commence par 00, enlever le préfixe 00
    if (cleaned.startsWith('00')) {
        cleaned = cleaned.substring(2);
    }

    try {
        // 3. Tenter de résoudre le numéro directement (si l'indicatif pays est déjà inclus)
        const numberId = await client.getNumberId(cleaned);
        if (numberId) {
            return numberId._serialized;
        }

        // 4. Si non résolu, essayer de deviner le préfixe pays à partir du numéro du business (le client WhatsApp connecté)
        if (client.info && client.info.wid) {
            const businessPhone = client.info.wid.user; // ex: "22890123456"
            
            // Extraire un indicatif plausible (par exemple, 228 pour le Togo, 33 pour la France)
            let prefix = '';
            if (businessPhone.startsWith('228')) {
                prefix = '228';
            } else if (businessPhone.startsWith('33')) {
                prefix = '33';
            } else if (businessPhone.startsWith('229')) {
                prefix = '229';
            } else if (businessPhone.startsWith('225')) {
                prefix = '225';
            } else {
                // Fallback : on prend les 3 premiers chiffres du numéro du business
                prefix = businessPhone.substring(0, 3);
            }
            
            const trialNumber = prefix + cleaned;
            const trialNumberId = await client.getNumberId(trialNumber);
            if (trialNumberId) {
                return trialNumberId._serialized;
            }
            
            return `${trialNumber}@c.us`;
        }
    } catch (err) {
        logger.warn(`Erreur lors de la résolution de l'ID WhatsApp pour ${cleaned}: ${err.message}`);
    }

    // Fallback par défaut si impossible de faire mieux
    return `${cleaned}@c.us`;
};

export const sendMessageWithRestore = async (businessId, customerPhone, message) => {
    let client = sessions.get(businessId);
    
    // Si pas de session active mais dossier existant sur disque → restauration automatique
    if (!client) {
        const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
        if (fs.existsSync(sessionPath)) {
            logger.info(`Restauration de la session pour ${businessId} pour l'envoi du message...`);
            client = initializeWhatsApp(businessId);
        }
    }

    if (!client) {
        logger.warn(`Aucune session active ou sauvegardée pour le business ${businessId}. Impossible d'envoyer.`);
        return false;
    }

    // Si le client est connecté/prêt, on envoie tout de suite
    const status = sessionStatuses.get(businessId)?.status;
    if (status === 'ready') {
        try {
            const jid = await formatPhoneToJid(client, customerPhone);
            await client.sendMessage(jid, message);
            logger.info(`Message envoyé directement pour ${businessId} à ${jid}`);
            return true;
        } catch (err) {
            logger.error(`Erreur envoi direct pour ${businessId}: ${err}`);
            return false;
        }
    } else {
        // Sinon, on met en file d'attente (le client est en cours de chargement/initialisation)
        queueMessage(businessId, customerPhone, message);
        return true;
    }
};

export const sendOwnerAlertWithRestore = async (businessId, alertData) => {
    let client = sessions.get(businessId);
    
    // Si pas de session active mais dossier existant sur disque → restauration automatique
    if (!client) {
        const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
        if (fs.existsSync(sessionPath)) {
            logger.info(`Restauration de la session pour ${businessId} pour l'alerte propriétaire...`);
            client = initializeWhatsApp(businessId);
        }
    }

    if (!client) {
        logger.warn(`Aucune session active ou sauvegardée pour le business ${businessId}. Impossible d'envoyer l'alerte.`);
        return false;
    }

    const status = sessionStatuses.get(businessId)?.status;
    if (status === 'ready') {
        try {
            const AppointmentMessage = (await import('../models/AppointmentMessage.js')).default;
            const ownerJid = client.info.wid._serialized;
            
            const message =
`━━━━━━━━━━━━━━━━━━
📥 *Nouvelle demande de RDV*

🆔 Code : *${alertData.shortCode}*

👤 Client : *${alertData.clientName}*
📞 Tél : ${alertData.clientPhone}
💇 Service : *${alertData.serviceName}*
📅 ${alertData.bookingDate}
🕑 ${alertData.bookingTime}

Répondez :
✅ *1*  —  ou  —  *+${alertData.shortCode}*  → Confirmer
❌ *0*  —  ou  —  *-${alertData.shortCode}*  → Annuler

_(Ou répondez directement à CE message)_
━━━━━━━━━━━━━━━━━━`;

            const sentMessage = await client.sendMessage(ownerJid, message);
            logger.info(`Alerte propriétaire envoyée directement pour RDV ${alertData.shortCode}`);
            
            if (sentMessage && sentMessage.id) {
                await AppointmentMessage.create({
                    businessId: new mongoose.Types.ObjectId(businessId),
                    appointmentId: alertData.appointmentId,
                    messageId: sentMessage.id._serialized,
                    shortCode: alertData.shortCode,
                });
                logger.info(`Lien message créé en base pour RDV ${alertData.shortCode}`);
            }
            return true;
        } catch (err) {
            logger.error(`Erreur envoi alerte propriétaire direct pour ${businessId}: ${err}`);
            return false;
        }
    } else {
        // Mettre en file d'attente
        if (!ownerAlertQueues.has(businessId)) {
            ownerAlertQueues.set(businessId, []);
        }
        ownerAlertQueues.get(businessId).push(alertData);
        logger.info(`Alerte propriétaire mise en file d'attente pour ${businessId} (RDV: ${alertData.shortCode})`);
        return true;
    }
};

// Force clean a session: destroy client, remove saved session folder, reset status
export const forceCleanSession = async (businessId) => {
    try {
        const client = sessions.get(businessId);

        if (client) {
            try {
                await client.destroy();
                logger.info(`Client détruit via forceClean pour: ${businessId}`);
            } catch (err) {
                logger.warn(`Erreur lors de la destruction forcée (${businessId}): ${err.message}`);
            }
        }

        // Supprimer de la map
        sessions.delete(businessId);
        sessionStatuses.set(businessId, { status: 'idle', qr: null });

        // Supprimer le dossier de session sur le disque
        const sessionPath = path.join(process.cwd(), '.wwebjs_auth', `session-${businessId}`);
        if (fs.existsSync(sessionPath)) {
            try {
                // Node 14+ supporte rmSync
                if (fs.rmSync) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                } else {
                    // Fallback
                    const rimraf = (p) => {
                        // best-effort recursive delete
                        const entries = fs.readdirSync(p);
                        for (const entry of entries) {
                            const full = path.join(p, entry);
                            if (fs.lstatSync(full).isDirectory()) rimraf(full);
                            else fs.unlinkSync(full);
                        }
                        fs.rmdirSync(p);
                    };
                    rimraf(sessionPath);
                }
                logger.info(`Dossier de session supprimé pour: ${businessId}`);
            } catch (err) {
                logger.warn(`Impossible de supprimer le dossier de session (${businessId}): ${err.message}`);
            }
        }

        // Notifier frontend(s)
        try {
            io.to(businessId).emit('whatsapp-status', { status: 'idle', reason: 'force_clean' });
        } catch (e) {
            logger.warn(`Impossible d'émettre le status après forceClean pour ${businessId}: ${e.message}`);
        }

        return true;
    } catch (err) {
        logger.error(`forceCleanSession erreur pour ${businessId}: ${err.message}`);
        return false;
    }
};

// Nettoyage des sessions inactives après un délai
setInterval(() => {
    sessions.forEach((client, businessId) => {
        if (!client.pupPage || client.pupPage.isClosed()) {
            logger.info(`Suppression de la session inactive pour le business: ${businessId}`);
            sessions.delete(businessId);
            sessionStatuses.delete(businessId);
        }
    });
}, 3600000); // Vérification toutes les heures

// Garde-fou global : empêcher les erreurs EBUSY/lockfile de crasher le serveur
process.on('uncaughtException', (err) => {
    if (err?.message?.includes('EBUSY') || err?.message?.includes('lockfile')) {
        logger.warn(`[uncaughtException ignorée] Lockfile WhatsApp occupé: ${err.message}`);
    } else {
        // Pour toute autre erreur non gérée, on la re-logue mais on ne crashe pas
        logger.error(`[uncaughtException] ${err.message}`);
        logger.error(err.stack);
    }
});

process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || String(reason);
    if (msg.includes('EBUSY') || msg.includes('lockfile')) {
        logger.warn(`[unhandledRejection ignorée] Lockfile WhatsApp occupé: ${msg}`);
    } else {
        logger.error(`[unhandledRejection] ${msg}`);
    }
});