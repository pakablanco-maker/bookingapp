
import './instrument.js';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';
import connectDB from './config/db.js';
import { getSessionStatus } from './config/whtasappManager.js';
import { captureWarning, captureException, captureInfo, addBreadcrumb } from './config/sentry.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import whatsappRoute from './routes/whatsappRoute.js';

// --- INITIALISATION ---
const app = express();
const httpServer = createServer(app);
const configuredFrontendOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const configuredAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const allowedOrigins = [
  configuredFrontendOrigin,
  ...configuredAllowedOrigins,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app:\d+$/i.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// 4. Configure Socket.io with Sentry instrumentation
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by Socket.IO CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }
});

// Instrument Socket.io with Sentry (modern 2026 integration)
// This captures Socket.io events and errors within Sentry
try {
  if (Sentry.socketioIntegration) {
    io.use(Sentry.socketioIntegration());
  }
} catch (e) {
  console.log('⚠️  Socket.io Sentry integration not available in this version');
}

// Connect to MongoDB
connectDB();

// ========== MIDDLEWARE CHAIN (ORDER MATTERS FOR SENTRY) ==========

// 1. Security headers
app.use(helmet());



// 4. Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// 5. CORS and parsing
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

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

// Enhanced Health Check with monitoring metrics
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'OK',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        mongodb: 'checking',
        whatsapp: 'checking',
      },
    };

    // Check MongoDB
    try {
      const mongoStatus = require('mongoose').connection.readyState;
      health.services.mongodb = mongoStatus === 1 ? 'connected' : 'disconnected';
    } catch (err) {
      health.services.mongodb = 'error';
    }

    // Check WhatsApp sessions
    try {
      health.services.whatsapp = {
        activeSessions: 0,
        // Vous pouvez ajouter des stats WhatsApp ici
      };
    } catch (err) {
      health.services.whatsapp = 'error';
    }

    const allServicesOk = Object.values(health.services).every(
      s => typeof s === 'string' ? s !== 'error' : true
    );

    // Log health check
    addBreadcrumb({
      category: 'health.check',
      message: 'Health check performed',
      level: 'info',
      data: { status: health.status, services: health.services },
    });

    res.status(allServicesOk ? 200 : 503).json(health);
  } catch (error) {
    captureWarning('Health check error', { error: error.message });
    res.status(503).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test endpoint for Sentry - Send a test error to verify monitoring works
app.get('/debug-sentry', function mainHandler(req, res) {
  // Send a test message
  captureInfo('Test error endpoint triggered', {
    action: 'test_error_endpoint',
    userId: req.userId || 'unknown',
  });

  // Add breadcrumb for context
  addBreadcrumb({
    category: 'test.sentry',
    message: 'Debug Sentry endpoint called',
    level: 'info',
    data: { endpoint: '/debug-sentry' },
  });

  // Throw test error - will be captured by Sentry error handler
  throw new Error('This is a test error for Sentry monitoring');
});

// ========== ERROR HANDLING (MUST BE LAST) ==========

// Sentry error handler (MUST be before any other error handler)
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler for non-Sentry errors
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur"
  });
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 5000;

// 5. CRITIQUE : Utiliser httpServer.listen au lieu de app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 6. Exporter 'io' pour l'utiliser dans tes autres fichiers (Manager WhatsApp)
export { io };