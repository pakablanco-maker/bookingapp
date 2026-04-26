# Deployment Guide

## Before Pushing to Git

### 1. **Remove Sensitive Data**
Never commit `.env` files or sensitive credentials. Only commit `.env.example`:

```bash
# In backend/
git rm --cached .env
git add .env.example
```

### 2. **Update JWT Secret (CRITICAL)**
```env
# backend/.env (LOCAL ONLY)
JWT_SECRET=your_very_long_and_secure_random_string_min_32_chars
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. **MongoDB Connection**
- For **local development**: Use MongoDB local or Atlas
- For **production**: Create a production MongoDB cluster
- Keep credentials in `.env` (local only), never in git

## Git Setup

### Clone & Setup Instructions for Others

```bash
# Clone the repository
git clone https://github.com/pakablanco-maker/bookingapp.git
cd bookingapp

# Backend setup
cd backend
cp .env.example .env
# Edit .env with your actual credentials
npm install

# Frontend setup
cd ../frontend
cp .env.example .env
npm install

# Start the app
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm start
```

## Environment Variables Setup

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
JWT_EXPIRY=7d
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Deployment Checklist

- [ ] Remove all `.env` files from git (keep `.env.example`)
- [ ] Update `JWT_SECRET` to a strong random string
- [ ] Test locally before pushing
- [ ] All `node_modules/` ignored in `.gitignore`
- [ ] All log files ignored
- [ ] Build directory ignored for frontend
- [ ] README.md has clear setup instructions
- [ ] `package.json` has all dependencies listed

## GitHub Setup

1. Create repository on GitHub
2. Add remote: `git remote add origin https://github.com/username/repo.git`
3. Push code: `git push -u origin main`

## Production Deployment

For deploying to production (Heroku, Vercel, AWS, etc.):

1. Set environment variables in your hosting platform
2. Use production MongoDB connection
3. Generate new strong JWT_SECRET
4. Set NODE_ENV=production
5. Ensure CORS_ORIGIN points to your frontend domain

---

**Remember**: Never hardcode credentials or secrets in your code!
