# 🚀 Quick Start Production Deployment

## **Avant de déployer: 5 étapes rapides**

### 1️⃣ **Préparer les variables d'environnement**

```bash
# Créer .env.production dans le backend
cp backend/.env.example backend/.env.production

# Éditer et remplir:
# SENTRY_DSN=https://your-key@sentry.io/...
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/...
# JWT_SECRET=<long-random-string>
# FRONTEND_URL=https://yourdomain.com
```

### 2️⃣ **Vérifier que tout compile**

```bash
cd backend
npm test
# ✅ Doit passer sans erreur
```

### 3️⃣ **Choisir une plateforme de déploiement**

| Plateforme | Prix | Setup | Recommandé |
|-----------|------|-------|-----------|
| **Railway** | Gratuit (~$5/mois) | ⭐ Très facile | ✅ Meilleur pour commencer |
| **Render** | Gratuit | ⭐ Très facile | ✅ Bonne alternative |
| **Heroku** | $7-50/mois | ⭐ Facile | ⚠️ Payant mais stable |
| **DigitalOcean** | $6/mois | ⭐⭐ Moyen | ✅ Excellent rapport qualité/prix |

---

## 🚀 **Déploiement via Railway** (Recommandé)

### **Étape 1: Créer le projet Railway**
1. Aller sur https://railway.app
2. Cliquer "Create Project"
3. Cliquer "Deploy from GitHub"
4. Connecter votre compte GitHub
5. Sélectionner le repo `bookingapp`

### **Étape 2: Ajouter les variables d'environnement**
```
Dans Railway Dashboard → Project Settings → Variables:

SENTRY_DSN=https://your-key@sentry.io/...
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/booking
JWT_SECRET=<long-random-string>
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
PORT=5000
```

### **Étape 3: Configurer le serveur**
- Railway devrait détecter `package.json` automatiquement
- Si erreur, ajouter:
  ```json
  "engines": {
    "node": "18.x"
  }
  ```

### **Étape 4: Déployer**
```bash
git push origin main
# Railway se redéploie automatiquement
```

### **Étape 5: Vérifier le déploiement**
```bash
curl https://your-railway-url/api/health
# Doit retourner: { status: 'OK', services: {...} }
```

---

## 🌐 **Déploiement Frontend (Vercel)** 

### **Étape 1: Déployer sur Vercel**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### **Étape 2: Configurer les variables**
```
REACT_APP_API_URL=https://your-railway-backend.railway.app
```

### **Étape 3: Redéployer**
```bash
vercel --prod
```

---

## ✅ **Checklist Déploiement Final**

```bash
☐ SENTRY_DSN configuré
☐ MONGODB_URI en production
☐ JWT_SECRET changé (min 32 caractères)
☐ FRONTEND_URL correct
☐ Backend: npm test ✅
☐ /api/health retourne 200
☐ Sentry reçoit les erreurs
☐ Rate limiter fonctionne (5 tentatives login max)
☐ Helmet.js active (headers de sécurité)
☐ CORS restrictif (pas "*")
☐ MongoDB backups activés
```

---

## 🔍 **Tester la production localement**

### **Simuler l'environnement production**
```bash
cd backend
NODE_ENV=production npm start

# Accéder à:
# http://localhost:5000/api/health
# http://localhost:5000/api/auth/register
# http://localhost:5000/api/auth/login
```

---

## 📊 **Monitoring en Production**

### **Vérifier les logs**
```bash
# Railway
railway logs

# Ou via Sentry Dashboard
https://sentry.io → Project → Issues

# Vérifier la santé du service
curl https://your-api-url/api/health
```

### **Configurer Slack alerts**
1. Dans Sentry: Settings → Integrations → Slack
2. Créer règle: Error level >= error
3. Notifier un channel Slack

### **UptimeRobot (gratuit)**
1. Aller sur https://uptimerobot.com
2. Ajouter moniteur: https://your-api-url/api/health
3. Intervalle: 5 minutes
4. Alerte si DOWN

---

## 🆘 **Dépannage**

### **Erreur: "ENOENT: no such file or directory, open '.env'"**
```bash
# Le .env n'existe pas. Créer à partir du .env.example
cp backend/.env.example backend/.env
```

### **Erreur: "MongoDB connection failed"**
```bash
# Vérifier que MONGODB_URI est correct:
- Format: mongodb+srv://username:password@cluster.mongodb.net/dbname
- IP whitelist dans MongoDB Atlas
- Credentials are correct
```

### **Erreur: "Cannot find module '@sentry/node'"**
```bash
cd backend
npm install
```

### **Erreur: "CORS error"**
```bash
# Vérifier que FRONTEND_URL dans .env.production
# Doit correspondre exactement à l'URL du frontend
# Ex: https://yourdomain.com (pas de slash final)
```

---

## 📞 **Support & Documentation**

- [Railway Docs](https://docs.railway.app)
- [Sentry Setup](https://docs.sentry.io/platforms/node/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## 🎯 **Prochaines étapes (après déploiement)**

1. Configurer le domaine personnalisé (godaddy.com, namecheap.com)
2. Activer HTTPS/SSL (gratuit via Let's Encrypt)
3. Configurer les backups automatiques MongoDB
4. Créer un plan de disaster recovery
5. Monitorer les performances (New Relic, Datadog)
6. Implémenter les tests E2E

---

**🎉 Vous êtes prêt pour la production !**
