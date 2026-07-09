# 📊 Monitoring et Alerting - BookingApp

## Configuration

### Sentry (Error Tracking & Alerts)

#### 1. **Créer un compte Sentry**
- Accédez à https://sentry.io
- Créez un projet "Node.js"
- Copiez le **DSN** (format: `https://...@sentry.io/...`)

#### 2. **Ajouter le DSN au `.env`**
```bash
SENTRY_DSN=https://your-key@sentry.io/your-project-id
NODE_ENV=production
```

#### 3. **En développement** (optionnel)
```bash
SENTRY_DSN=https://your-key@sentry.io/your-project-id
NODE_ENV=development
```

---

## 📈 Métriques Capturées

### WhatsApp Manager
- ✅ **Authentification réussie**: `captureInfo()`
- ❌ **Authentification échouée**: `captureWarning()`
- 🔌 **Déconnexion**: `captureWarning()`
- 💥 **Erreur d'initialisation**: `captureException()`
- 📤 **Erreur d'envoi de message**: `captureException()`
- 📢 **Alerte propriétaire envoyée**: `captureInfo()`

### API Server
- 🏥 **Health Check amélioré**: `/api/health`
  - État MongoDB
  - État des sessions WhatsApp
  - Uptime du serveur
  - Environnement

---

## 🚨 Types d'Alertes

### Critique 🔴
- Authentification WhatsApp échouée
- Session déconnectée inopinément
- Erreur lors de l'envoi d'une alerte propriétaire
- MongoDB déconnecté

### Warning 🟡
- Erreur d'envoi de message client
- Session non trouvée
- Tentative d'initialisation échouée

### Info 🔵
- Authentification réussie
- Alerte propriétaire envoyée avec succès
- Initialization réussie

---

## 🔔 Configuration des Alertes Sentry

### Par Email
1. Allez dans **Alerts** > **Create Alert Rule**
2. Sélectionnez **When an issue changes from resolved to unresolved**
3. Action: **Send to Admins**

### Par Slack (recommandé)
1. Installez l'intégration Slack: **Settings** > **Integrations** > **Slack**
2. Créez une règle d'alerte:
   - Condition: `error.level >= error`
   - Déclenchez tous les 30 minutes

### Par Discord/Webhook
```
POST https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
{
  "content": "🚨 Erreur WhatsApp: ${error.message}"
}
```

---

## 📊 Dashboard Sentry

### Vue d'ensemble
- **Problèmes**: Tous les erreurs/warnings groupés
- **Tendances**: Graphique d'erreurs sur les 7 derniers jours
- **Utilisateurs affectés**: Comptes avec problèmes

### Filtres utiles
```
level:error                    # Erreurs uniquement
message:"WhatsApp"             # Erreurs WhatsApp
tags[environment]:production   # Erreurs en prod
```

---

## 🔧 Développement Local

### Tester les alertes
```javascript
// Dans n'importe quel endpoint
import { captureWarning, captureException } from './config/sentry.js';

// Warning
captureWarning('Test warning', { businessId: '123' });

// Exception
captureException(new Error('Test error'), { context: 'test' });
```

### Voir les logs localement
```bash
# Terminal 1 - Démarrer le backend
npm run dev

# Terminal 2 - Accéder à http://localhost:5000/api/health
curl http://localhost:5000/api/health
```

---

## 📈 Améliorations Futures

- [ ] Prometheus + Grafana pour les métriques en temps réel
- [ ] Alertes basées sur des seuils (ex: >5 erreurs/min)
- [ ] Historique de disponibilité WhatsApp
- [ ] Dashboard admin pour voir les alertes
- [ ] Intégration PagerDuty pour les alertes critiques
- [ ] Rapports de disponibilité hebdomadaires

---

## 🔗 Ressources

- [Documentation Sentry](https://docs.sentry.io/)
- [Intégrations Sentry](https://sentry.io/integrations/)
- [Guide d'alerting](https://docs.sentry.io/platform/guides/node/enriching-events/breadcrumbs/)
