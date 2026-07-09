#!/bin/bash
# 🚀 Script de déploiement rapide - BookingApp
# Utilisation: bash deploy.sh

set -e

echo "🚀 ===== BookingApp Deployment Script ====="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier les prérequis
echo -e "${YELLOW}1️⃣  Vérification des prérequis...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js et Git trouvés${NC}"
echo ""

# 2. Vérifier que .env.production existe
echo -e "${YELLOW}2️⃣  Vérification du fichier .env.production...${NC}"
if [ ! -f "backend/.env.production" ]; then
    echo -e "${RED}❌ backend/.env.production n'existe pas${NC}"
    echo "Créer le fichier avec:"
    echo "  cp backend/.env.example backend/.env.production"
    echo "  # Éditer et remplir les variables"
    exit 1
fi
echo -e "${GREEN}✅ .env.production trouvé${NC}"
echo ""

# 3. Vérifier les variables d'environnement essentielles
echo -e "${YELLOW}3️⃣  Vérification des variables essentielles...${NC}"
if ! grep -q "SENTRY_DSN" backend/.env.production || grep -q "SENTRY_DSN=https://your-key" backend/.env.production; then
    echo -e "${RED}⚠️  ATTENTION: SENTRY_DSN n'est pas configuré${NC}"
    echo "    (Le monitoring Sentry ne fonctionnera pas)"
fi
if ! grep -q "MONGODB_URI" backend/.env.production; then
    echo -e "${RED}❌ MONGODB_URI est manquant${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Variables essentielles trouvées${NC}"
echo ""

# 4. Installer les dépendances
echo -e "${YELLOW}4️⃣  Installation des dépendances...${NC}"
cd backend
npm ci --production
cd ..
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# 5. Tests de syntaxe
echo -e "${YELLOW}5️⃣  Tests de syntaxe (npm test)...${NC}"
cd backend
npm test
cd ..
echo -e "${GREEN}✅ Tests réussis${NC}"
echo ""

# 6. Vérifier le déploiement
echo -e "${YELLOW}6️⃣  Configuration du déploiement...${NC}"
echo ""
echo "Options de déploiement:"
echo "  1) Railway (Recommandé - gratuit ~$5/mois)"
echo "  2) Render (Gratuit avec création de compte)"
echo "  3) Heroku (Payant - $7-50/mois)"
echo ""
echo "Note: Vous devez avoir un compte GitHub connecté"
echo ""

# 7. Instructions finales
echo -e "${GREEN}✅ ===== Prêt pour le déploiement =====${NC}"
echo ""
echo "Prochaines étapes:"
echo "  1. Aller sur https://railway.app (recommandé)"
echo "  2. Connecter votre repo GitHub"
echo "  3. Ajouter les variables d'environnement depuis .env.production"
echo "  4. Cliquer 'Deploy'"
echo ""
echo "Vérification après déploiement:"
echo "  curl https://your-app-url/api/health"
echo ""
echo -e "${GREEN}🎉 Déploiement prêt ! ${NC}"
