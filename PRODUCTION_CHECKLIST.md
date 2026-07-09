# 🚀 Pre-Production Checklist - BookingApp

## ✅ Déjà Complété
- [x] WhatsApp Manager (parsing commands, auto-restore)
- [x] Persistent Alert Queue (MongoDB-backed)
- [x] GitHub Actions CI (frontend + backend checks)
- [x] Sentry Monitoring & Alerting
- [x] Enhanced Health Check (`/api/health`)

---

## 🔒 Sécurité (CRITIQUE)

### 1. **Rate Limiting**
```javascript
// ❌ À FAIRE: Ajouter express-rate-limit
npm install express-rate-limit
```

**Ajouter au `server.js`:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite 100 requêtes par IP
});
app.use(limiter);

// Limiter plus strictement les endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // Max 5 tentatives
});
app.use('/api/auth/login', authLimiter);
```

### 2. **CORS Configuration**
```javascript
// ❌ À VÉRIFIER: Remplacer "*" par l'URL frontend exacte
const cors = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### 3. **HTTPS en Production**
```bash
# ❌ À FAIRE: Utiliser SSL/TLS
# Via Nginx ou Let's Encrypt
# À configurer dans votre déploiement (AWS/Heroku/Digital Ocean)
```

### 4. **Variables d'environnement**
```bash
# ✅ Créer .env.production (NE PAS COMMITTER)
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/booking
JWT_SECRET=your-very-long-secret-key-here
SENTRY_DSN=https://...@sentry.io/...
FRONTEND_URL=https://yourdomain.com
PORT=5000
```

### 5. **Headers de sécurité**
```javascript
// ❌ À AJOUTER: npm install helmet
import helmet from 'helmet';
app.use(helmet());
```

---

## 🗄️ Base de Données

### MongoDB Atlas (recommandé)
```bash
1. Créer compte: https://www.mongodb.com/cloud/atlas
2. Créer cluster gratuit
3. Récupérer connection string:
   mongodb+srv://username:password@cluster.mongodb.net/dbname
4. Ajouter à .env:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking
```

### Backups
```bash
# ❌ À FAIRE: Configurer backups automatiques
# MongoDB Atlas: Settings > Backup > Enable Backup
# Fréquence: quotidienne minimum
```

---

## 🐳 Déploiement (Options)

### Option 1: Heroku (Plus simple pour commencer)
```bash
# 1. Créer compte: https://www.heroku.com
# 2. Installer Heroku CLI
# 3. Connecter le repo GitHub
# 4. Ajouter variables d'environnement dans Heroku Dashboard
# 5. Deploy automatique via GitHub

heroku login
heroku create booking-app-backend
git push heroku main
```

### Option 2: Docker + AWS/Azure/DigitalOcean
```dockerfile
# ❌ À CRÉER: Dockerfile (Backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Option 3: Railway/Render (Recommandé - Free tier)
```bash
# Push code, connecter GitHub, déployer
# Environment variables via dashboard
# Déploiement automatique à chaque push
```

---

## 🔐 Secrets & Credentials

### ✅ Ne PAS committer:
```bash
# Créer .gitignore (vérifier qu'il existe)
.env
.env.production
.env.local
node_modules/
logs/
.wwebjs_auth/
```

### ✅ Ajouter les secrets via:
- **Heroku**: Config Vars
- **AWS**: Secrets Manager
- **DigitalOcean**: App Platform Secrets
- **Docker**: Environment files (.env)

---

## 📊 Monitoring Production

### 1. **Sentry**
- [ ] Créer projet Sentry: https://sentry.io
- [ ] Ajouter `SENTRY_DSN` au `.env.production`
- [ ] Configurer Slack alerts dans Sentry
- [ ] Créer équipe Sentry pour notifications

### 2. **Health Check**
```bash
# Monitorer toutes les 5 minutes
curl https://yourdomain.com/api/health
# Doit retourner: { status: 'OK', services: {...} }
```

### 3. **Uptime Monitoring**
- [ ] https://uptimerobot.com (gratuit)
- [ ] Configurer alerte si DOWN

### 4. **Logs**
```bash
# Heroku: heroku logs --tail
# AWS CloudWatch: Checked automatiquement
# DigitalOcean: Dashboard Logs
```

---

## 🔄 CI/CD Pipeline (Déjà en place)

### ✅ Validé:
- GitHub Actions: `.github/workflows/ci.yml`
- Tests backend: `npm run check`
- Lint frontend: TODO (à ajouter)

### ❌ À AJOUTER:
```yaml
# Dans ci.yml: Test lint frontend
- name: Frontend Lint
  run: cd frontend && npm run lint
```

---

## 📝 Checklist Final

### Avant chaque déploiement:
```bash
# 1. Vérifier les secrets
[ ] SENTRY_DSN configuré
[ ] MONGODB_URI correct (production cluster)
[ ] JWT_SECRET changé (long et complexe)
[ ] FRONTEND_URL correct

# 2. Tests
[ ] npm test (backend)
[ ] npm run lint (frontend)
[ ] Health check: /api/health

# 3. Documentation
[ ] README mis à jour
[ ] API_DOCUMENTATION.md à jour
[ ] SETUP_GUIDE.md avec .env example

# 4. Sécurité
[ ] Rate limiting activé
[ ] CORS restrictif
[ ] HTTPS en production
[ ] Helmet.js activé
[ ] Rate limiter sur /api/auth

# 5. Monitoring
[ ] Sentry DSN validé
[ ] Alertes Slack configurées
[ ] UptimeRobot monitoring
[ ] Backups MongoDB activés
```

---

## 🚀 Démarrage Production (Étapes)

### **1. Préparer l'environnement**
```bash
# Cloner le repo
git clone https://github.com/pakablanco-maker/bookingapp.git
cd bookingapp/backend

# Installer dépendances
npm install

# Créer .env.production avec secrets
cp .env.example .env.production
# ⚠️ Éditer avec valeurs réelles
```

### **2. Déployer via Heroku (Simple)**
```bash
heroku login
heroku create booking-app-backend
heroku config:set SENTRY_DSN=...
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
```

### **3. Vérifier le statut**
```bash
heroku logs --tail
curl https://booking-app-backend.herokuapp.com/api/health
```

### **4. Configurer Frontend**
```bash
# Dans frontend/.env.production
REACT_APP_API_URL=https://booking-app-backend.herokuapp.com
```

### **5. Déployer Frontend (Vercel/Netlify)**
```bash
# Vercel (recommandé pour React)
npm install -g vercel
vercel --prod

# Ou Netlify
netlify deploy --prod
```

---

## 📞 Support Déploiement

| Provider | Gratuité | Complexité | Support |
|----------|----------|-----------|---------|
| **Heroku** | Non (payant) | ⭐ Facile | Bon |
| **Railway** | Gratuit ($ crédit) | ⭐ Très facile | Très bon |
| **Render** | Gratuit | ⭐ Très facile | Bon |
| **DigitalOcean** | $6/mois | ⭐⭐ Moyen | Excellent |
| **AWS** | Gratuit 1 an | ⭐⭐⭐ Complexe | Support payant |

**Recommandation pour commencer**: **Railway** ou **Render** (plus simple que Heroku)

---

## ✅ Statut Prêt Production

- ✅ Backend: PRÊT
- ✅ Monitoring: PRÊT
- ✅ CI/CD: PRÊT
- ⚠️ Sécurité: À finaliser (rate-limiting, helmet)
- ⚠️ Déploiement: À choisir (Heroku/Railway/Render)
- ⚠️ Secrets: À configurer

**Prochaine étape**: Ajouter rate-limiting + helmet.js, puis déployer !
