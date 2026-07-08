import Appointment from '../models/Appointment.js';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // pas I/O pour éviter confusion visuelle

/**
 * Génère un code court unique de type "A472".
 * Vérifie l'unicité en base avant de retourner.
 * Récursif en cas de collision (très rare).
 */
export const generateShortCode = async () => {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const number = Math.floor(100 + Math.random() * 900); // 3 chiffres : 100–999
    const code = `${letter}${number}`;

    const exists = await Appointment.findOne({ shortCode: code });
    return exists ? generateShortCode() : code;
};
