# 🏃 Setup & Run Guide - Both Servers

Quick reference for starting your BookingApp.

## 📋 Pre-Startup Checklist

```
✓ Node.js installed (check: node --version)
✓ MongoDB running or Atlas connected
✓ Backend .env configured
✓ Frontend .env configured
✓ Both folders have npm dependencies installed
```

---

## 🚀 Fastest Way to Start (30 seconds)

### Prerequisites Already Done?

If you've already:
- Installed npm dependencies in both folders
- Created both `.env` files with correct values

Then:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm start
```

✅ Done! App runs on `http://localhost:3000`

---

## 📝 Complete Setup Instructions

### Step 1: Setup Backend

**If first time:**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/booking-app
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRY=7d
NODE_ENV=development
```

**Start backend:**
```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
MongoDB Connected: localhost
```

✅ Backend ready on `http://localhost:5000`

---

### Step 2: Setup Frontend

**If first time:**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# File should already have correct value:
# REACT_APP_API_URL=http://localhost:5000/api
```

**Start frontend:**
```bash
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

✅ Frontend ready on `http://localhost:3000`

---

## 🎯 Quick Reference Terminals

### Terminal 1: Backend
```bash
cd backend
npm run dev

# Stop: Ctrl+C
# Restart: npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm start

# Stop: Ctrl+C
# Restart: npm start
```

### Terminal 3: Optional (Testing)
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test MongoDB connection by checking logs in Terminal 1
```

---

## ✅ Verification Checklist

### Backend Running?
```bash
curl http://localhost:5000/api/health
# Response: {"message":"Server is running","status":"OK"}
```

### Frontend Running?
Open `http://localhost:3000` in browser
- Should see login page

### MongoDB Connected?
Check Terminal 1 backend output
- Should see: "MongoDB Connected: {host}"

### JWT Secret Set?
Backend `.env` has `JWT_SECRET=something`
- Any string works for development

---

## 📊 Health Dashboard

Quick commands to check everything:

```bash
# Check Node.js version
node --version

# Check MongoDB (if local)
mongo --version

# Test backend
curl http://localhost:5000/api/health

# Check frontend at browser console (F12)
localStorage.getItem('token')  # null before login

# Test after login (should show token)
localStorage.getItem('token')  # eyJhbGc...
```

---

## 🔄 Development Workflow

### Daily Startup

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start

# Open http://localhost:3000 in browser
```

### Making Changes

**Frontend:**
- Edit files in `frontend/src/`
- Browser auto-refreshes

**Backend:**
- Edit files in `backend/`
- Server auto-restarts (nodemon)

### Stopping Servers

```bash
# In each terminal: Ctrl+C

# Then restart:
# Terminal 1: npm run dev
# Terminal 2: npm start
```

---

## 🐛 Quick Troubleshooting

**Port 5000 already in use:**
```bash
# Find process on port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or use different port
PORT=5001 npm run dev
```

**Port 3000 already in use:**
```bash
# Frontend will ask to use different port
# Press 'Y' to continue on port 3001
```

**npm modules outdated:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

**MongoDB connection failing:**
```bash
# Verify connection string in .env
# For local: mongodb://localhost:27017/booking-app
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Check MongoDB is running
# Terminal: mongod
```

**Token not persisting:**
```javascript
// Browser Console:
localStorage.clear()  // Clear old data
// Then login again
```

---

## 📱 Testing URLs

| Feature | URL |
|---------|-----|
| App Home | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Dashboard | http://localhost:3000/dashboard |
| Services | http://localhost:3000/services |
| Appointments | http://localhost:3000/appointments |
| Profile | http://localhost:3000/profile |
| Booking | http://localhost:3000/booking/{businessId} |
| API Health | http://localhost:5000/api/health |

---

## 🎬 First-Time User Flow

1. **Start both servers** (see above)

2. **Open http://localhost:3000**

3. **Register account:**
   - Name: John Salon
   - Email: john@test.com
   - Password: password123
   - Business: John's Hair Salon
   - Phone: +1-555-1234

4. **Create service:**
   - Services page
   - Add Service button
   - Name: Haircut
   - Price: 25
   - Duration: 30
   - Save

5. **Test booking:**
   - Copy Business ID from dashboard or URL
   - Open: http://localhost:3000/booking/{businessId}
   - Select Haircut
   - Choose tomorrow's date
   - Pick a time
   - Enter name & phone
   - Book!

6. **View booking:**
   - Go to Appointments
   - See your new booking
   - Try confirming it

✅ **Full flow complete!**

---

## 🔧 Environment Variables

### Backend (.env)

```properties
# Server
PORT=5000
NODE_ENV=development

# Database - Local
MONGODB_URI=mongodb://localhost:27017/booking-app

# Database - MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking-app

# Authentication
JWT_SECRET=your_ultra_secret_key_change_this_in_production_12345
JWT_EXPIRY=7d
```

### Frontend (.env)

```properties
# API Connection
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📊 Console Logs to Watch

### Backend Terminal

```
[Normal]
🚀 Server running on port 5000
Environment: development
MongoDB Connected: localhost

[Info]
GET /api/health
POST /api/auth/register
GET /api/services/...

[Error - Watch for these]
Error connecting to MongoDB
Default value for JWT token
```

### Frontend Terminal

```
[Normal]
Compiled successfully!
Local: http://localhost:3000

[Warnings - Usually ok]
Module not found...
Warning about deprecated...

[Error - Check these]
Unexpected token
API endpoint not found
```

### Browser Console (F12)

```
[Normal]
App is running...
No errors displayed

[Warnings - Usually ok]
Warning: Each child in a list...

[Error - Fix these]
Cannot find module...
API error responses
CORS errors
```

---

## 🎯 What's Running?

### Port 3000 (Frontend)
- React app
- User interface
- Pages and components
- Makes API calls to port 5000

### Port 5000 (Backend)
- Express server
- API endpoints
- Business logic
- Database queries to MongoDB

### MongoDB (Local or Atlas)
- User data
- Services
- Appointments
- Stored in database

---

## 🔐 Security Notes for Development

✅ **Good for development:**
- Plain JWT_SECRET
- CORS enabled
- Database logs

❌ **Change before production:**
- Use strong JWT_SECRET
- Restrict CORS
- Enable HTTPS
- Use environment-specific configs

---

## 📈 Performance Tips

**Backend faster:**
- Index frequently queried fields ✅ Already done
- Implement caching if needed
- Use connection pooling

**Frontend faster:**
- Code splitting
- Lazy load components
- Optimize images

**Database faster:**
- Proper indexes ✅ Already done
- Query optimization
- Connection pooling

---

## 🚀 Ready to Deploy?

When ready to go live:

1. **Update environment variables:**
   - Strong JWT_SECRET
   - Production MongoDB URL
   - Frontend CORS settings

2. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   # Creates optimized build/ folder
   ```

3. **Deploy to:**
   - Frontend: Netlify, Vercel, GitHub Pages
   - Backend: Heroku, Railway, AWS, DigitalOcean
   - Database: MongoDB Atlas (already cloud)

See main [README.md](README.md) for deployment details.

---

## 💡 Pro Tips

- **Keyboard shortcuts:**
  - DevTools: F12 or Ctrl+Shift+I
  - Reload: Ctrl+Shift+R (hard refresh)
  - Network tab: Ctrl+Shift+E

- **Testing faster:**
  - Keep DevTools Network tab open
  - Watch API calls in real-time
  - Use browser console for quick tests

- **Debugging:**
  - Check browser console (F12)
  - Check backend terminal logs
  - Use Network tab to inspect API calls
  - Check MongoDB with `mongo` shell

- **Development:**
  - Both servers auto-reload on file changes
  - No need to restart manually (most times)
  - If issues, do full restart of both servers

---

## ❓ Quick Help

**App won't start?**
→ See Troubleshooting section above

**Don't see changes?**
→ Hard refresh: Ctrl+Shift+R

**API error?**
→ Check Network tab (F12) → Requests

**Login not working?**
→ Check DevTools Console for errors

**Can't connect to booking page?**
→ Verify businessId in URL is correct

---

**You're all set! Happy coding! 🎉**

```
cd backend && npm run dev
# ↓ AND in another terminal ↓
cd frontend && npm start
```

Both running? Open http://localhost:3000! 🚀
