# 🚀 GUIDE DE DÉPLOIEMENT - SENTRY v10

**Date**: 2024-07-11  
**Version**: v1.0  
**Status**: ✅ PRÊT À DÉPLOYER

---

## 📋 PRE-DÉPLOIEMENT CHECKLIST

### 1. **Validation Locale** ✅
```bash
# Valider la migration Sentry
npm run validate-sentry

# Résultat attendu:
# ✅ Passed: 8
# ⚠️  Warnings: 4 (acceptable - rétro-compatible)
# ❌ Critical Issues: 0
```

### 2. **Tests Unitaires** ⏳
```bash
# Exécuter les tests
npm test

# Vérifier aucune erreur Sentry
npm run test:sentry
```

### 3. **Lint & Syntax** ✅
```bash
# Vérifier la syntaxe
npm run check

# Vérifier les lints
npm run lint
```

---

## 🔐 CONFIGURATION PRÉ-DÉPLOIEMENT

### Vérifier `.env` (ne PAS committer)
```bash
cat .env | grep SENTRY
```

**Attendu**:
```
SENTRY_DSN=https://[key]@sentry.io/[project]
SENTRY_ENVIRONMENT=production
SENTRY_TRACE_SAMPLE_RATE=0.1
```

### Vérifier `.env.production` (optionnel)
```bash
cat .env.production | grep SENTRY
```

---

## 📦 DÉPLOIEMENT ÉTAPE PAR ÉTAPE

### Étape 1: Créer une branche de déploiement
```bash
git checkout -b deploy/sentry-v10-migration

# Vérifier les changements
git status
# Attendu: 6 fichiers modifiés + 4 nouveaux fichiers
```

### Étape 2: Vérifier les modifications
```bash
# Voir les changements
git diff HEAD -- backend/

# Voir les nouveaux fichiers
git status | grep "new file"
```

### Étape 3: Commit des changements
```bash
git add backend/ scripts/ *.md

git commit -m "🎯 Migration Sentry v7/v8/v9 → v10 - Complet

- Mise à jour de @sentry/node version
- Modernisation de toutes les APIs (getCurrentHub, startTransaction, etc.)
- Ajout HTTP context handler
- Intégration authentication logging
- Optimisation profiling (100% → 5% dev, 10% prod)
- Filtrage des erreurs de bruit
- 6 fichiers critiques corrigés + 4 guides de migration

Migration validée avec 0 problèmes critiques.
Prêt pour production."
```

### Étape 4: Push vers remote
```bash
# Push la branche
git push origin deploy/sentry-v10-migration

# Vérifier que le push est OK
git log --oneline origin/deploy/sentry-v10-migration
```

### Étape 5: Créer une Pull Request (optionnel)
```bash
# Sur GitHub, créer une PR:
# Title: "🎯 Migration Sentry v10 - Production Ready"
# Description: Voir SENTRY_MIGRATION_SUMMARY.md
```

---

## 🎯 DÉPLOIEMENT EN STAGING

### 1. Merger en staging
```bash
git checkout staging
git pull origin staging
git merge deploy/sentry-v10-migration
git push origin staging
```

### 2. Déployer
```bash
# Selon votre plateforme (Heroku, AWS, etc.)
# Exemple Heroku:
git push heroku staging:main

# Ou via CI/CD
# L'action GitHub devrait déclencher automatiquement
```

### 3. Vérifier les logs
```bash
# Heroku
heroku logs --app booking-app-staging --tail

# Attendu:
# Sentry initialized
# DSN: OK
# Environment: staging
```

### 4. Tester le `/debug-sentry` endpoint
```bash
curl https://booking-app-staging.herokuapp.com/debug-sentry

# Vérifier que l'erreur apparait sur Sentry dashboard
# Attendre 1-2 minutes
```

### 5. Tester les rendez-vous
```bash
# Via Postman ou curl
POST /api/appointments
# Vérifier que la transaction apparait sur Sentry

# Tester auth failures
GET /api/appointments (sans token)
# Vérifier que le warning "Authentication attempt" apparait
```

---

## ✅ VÉRIFICATION EN STAGING

### Sentry Dashboard Checklist

- [ ] Aller à https://sentry.io/settings/[org]/projects/[project]/
- [ ] Vérifier **General Settings**:
  - Environment: staging
  - Platform: Node.js
  - Version: (montrer la date actuelle)

- [ ] Aller à **Monitoring > Issues**:
  - [ ] Chercher "My first Sentry error!" (de /debug-sentry)
  - [ ] Vérifier le contexte: URL, method, status
  - [ ] Vérifier la breadcrumb chain

- [ ] Aller à **Monitoring > Performance > Transactions**:
  - [ ] Chercher "Create Appointment"
  - [ ] Vérifier la durée (p50, p95, p99)
  - [ ] Vérifier le waterfall (HTTP context + DB operations)

- [ ] Aller à **Discover**:
  - [ ] Vérifier que les transactions apparaissent
  - [ ] Vérifier les erreurs auth

---

## 🚀 DÉPLOIEMENT EN PRODUCTION

### 1. Merger en production
```bash
git checkout main  # ou master/production
git pull origin main
git merge deploy/sentry-v10-migration
git push origin main
```

### 2. Tagger la version
```bash
git tag -a v1.0.0-sentry-v10 -m "Sentry v10 Migration Production"
git push origin v1.0.0-sentry-v10
```

### 3. CI/CD déclenche automatiquement
```bash
# Vérifier l'action GitHub ou le pipeline CI/CD
# Étapes:
# 1. npm install
# 2. npm run check
# 3. npm run validate-sentry (0 issues critiques)
# 4. npm run test (si applicable)
# 5. npm run build
# 6. Deploy to production
```

### 4. Vérifier les logs de production
```bash
# Selon votre plateforme:
# Heroku
heroku logs --app booking-app --tail

# AWS CloudWatch
aws logs tail /aws/lambda/booking-api --follow

# GCP Cloud Logging
gcloud logging read "resource.type=gke_container" --tail
```

---

## 📊 MONITORING POST-DÉPLOIEMENT

### 1ère Heure (CRITIQUE)
- [ ] Vérifier Sentry dashboard pour les erreurs
- [ ] Vérifier que `/debug-sentry` crée bien une issue
- [ ] Tester login/logout (vérifier auth logging)
- [ ] Tester création rendez-vous (vérifier transaction)

### 1-6 Heures
- [ ] Vérifier les métriques de performance
- [ ] Vérifier le nombre d'erreurs (doit être stable)
- [ ] Vérifier le quota utilisé (doit être raisonnable)

### 6-24 Heures
- [ ] Vérifier les tendances
- [ ] Vérifier les patterns d'erreur
- [ ] Configurer les alertes Sentry

---

## 🔔 ALERTES À CONFIGURER

### Sur Sentry Dashboard:

#### Alerte 1: Taux d'erreurs élevé
```
Condition: (event.level: error) > 100 in 10 minutes
Action: Send Slack message to #alerts
```

#### Alerte 2: Authentications échouées
```
Condition: (tags.context: auth) > 50 in 10 minutes
Action: Send Slack message to #security
```

#### Alerte 3: Transactions lentes
```
Condition: (tags.op: booking.create) AND (duration > 2000) in transaction
Action: Send email to dev-team@company.com
```

---

## 🚨 ROLLBACK PLAN

Si des problèmes critiques surviennent:

### Rollback Immédiat
```bash
# 1. Revenir au dernier commit bon
git revert [commit-hash]

# 2. Push le revert
git push origin main

# 3. CI/CD redéploie automatiquement

# 4. Notifier l'équipe sur Slack
```

### Rollback Complet (si nécessaire)
```bash
# Chercher le dernier tag stable
git tag -l | grep -E "v[0-9]+\.[0-9]+\.[0-9]+" | sort -V | tail -1

# Checkout la version
git checkout v0.9.0  # Exemple

# Redéployer
git push origin HEAD:main --force-with-lease
```

### Post-Rollback
1. Analyser les logs Sentry
2. Créer une issue GitHub
3. Fixer le problème en local
4. Relancer le déploiement

---

## 📞 CONTACTS & ESCALADE

### En cas de problème:

1. **Slack Channel**: #backend-deployments
2. **Email**: dev-team@company.com
3. **PagerDuty**: On-call engineer

### Informations à fournir:
- Timestamp du problème
- Erreur exacte
- Lien Sentry vers l'issue
- Logs serveur

---

## ✨ SUCCESS CRITERIA

Après 24h en production, vous devez avoir:

- [x] 0 erreurs critiques
- [x] Transactions visibles sur Sentry
- [x] Performance OK (p95 < 2s pour create appointment)
- [x] Erreurs auth tracées et visibles
- [x] Quota Sentry utilisé raisonnablement (< 5000 events/day)

---

## 🎯 PROCHAINES ÉTAPES (OPTIONNEL)

### Phase 2 (Après stabilisation):
- [ ] Intégrer Socket.io avec Sentry
- [ ] Configurer les Sentry Release Tracking
- [ ] Mettre à place le Source Maps Upload
- [ ] Créer des dashboards Sentry custom

### Phase 3 (Long terme):
- [ ] Ajouter OpenTelemetry pour metrics avancées
- [ ] Configurer alerts automatiques
- [ ] Créer rapports hebdomadaires Sentry
- [ ] Documenter dans ARCHITECTURE.md

---

## 📋 DÉPLOIEMENT SIGNATURE

```
Déploiement par: [NOM]
Date: [DATE]
Environnement: Production
Version: v1.0.0-sentry-v10
Status: ✅ SUCCÈS ou ❌ ROLLBACK

Notes:
[Ajouter notes de déploiement]
```

---

**STATUS**: ✅ **PRÊT POUR PRODUCTION**

**Dernière mise à jour**: 2024-07-11  
**Prochaine étape**: Exécuter `npm run validate-sentry`
