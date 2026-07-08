import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http'; // 1. Importer createServer
import { Server } from 'socket.io';   // 2. Importer Server
import connectDB from './config/db.js';
import { getSessionStatus } from './config/whtasappManager.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import whatsappRoute from './routes/whatsappRoute.js';

// --- INITIALISATION ---
const app = express();
const httpServer = createServer(app); // 3. Créer le serveur HTTP avec Express

// 4. Configurer Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // En dev tu peux mettre "*", en prod mets l'URL de ton frontend
    methods: ["GET", "POST"],
    credential: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// --- GESTION DES SOCKETS ---
io.on('connection', (socket) => {
  console.log(`📡 Nouveau socket connecté : ${socket.id}`);

  // Le business rejoint sa "room" personnelle via son ID
  socket.on('join-business-room', (businessId) => {
    socket.join(businessId);
    console.log(`🏢 Business ${businessId} a rejoint sa salle privée.`);
    try {
      const { status, qr } = getSessionStatus(businessId) || { status: 'idle', qr: null };
      // Envoyer le statut courant et le QR (si disponible) directement au socket qui vient de rejoindre
      socket.emit('whatsapp-status', { status });
      if (qr) socket.emit('whatsapp-qr', { qr });
    } catch (err) {
      console.warn('Impossible de récupérer le statut WhatsApp pour émission immédiate:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Utilisateur déconnecté du socket');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/whatsapp', whatsappRoute);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 5000;

// 5. CRITIQUE : Utiliser httpServer.listen au lieu de app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 6. Exporter 'io' pour l'utiliser dans tes autres fichiers (Manager WhatsApp)
export { io };