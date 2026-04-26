# 🚀 Quick Start Guide - BookingApp

Get your complete booking system up and running in 5 minutes!

## Prerequisites

Before starting, ensure you have:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download Local](https://www.mongodb.com/try/download/community) or [Create Free Atlas Account](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional)

## ⚡ 5-Minute Setup

### Step 1: Start MongoDB (if using local)

**Windows:**
```bash
mongod
```

**macOS/Linux:**
```bash
brew services start mongodb-community
```

Or use **MongoDB Atlas** (cloud):
- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Create free account
- Create cluster
- Get connection string

### Step 2: Backend Setup (2 minutes)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# OR on macOS/Linux:
# cp .env.example .env

# Edit .env file and add:
# If using MongoDB local:
MONGODB_URI=mongodb://localhost:27017/booking-app

# If using MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking-app

# Also set JWT secret:
JWT_SECRET=your_super_secret_key_here_change_this

# Start backend
npm run dev
# Output: 🚀 Server running on port 5000
```

✅ Backend running on `http://localhost:5000`

### Step 3: Frontend Setup (2 minutes)

**Open a NEW terminal window** and:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# OR on macOS/Linux:
# cp .env.example .env

# The default is already correct:
# REACT_APP_API_URL=http://localhost:5000/api

# Start React app
npm start
# Browser will open automatically
```

✅ Frontend running on `http://localhost:3000`

## 🎯 Complete Setup Checklist

```
✓ Node.js installed
✓ MongoDB running (local or Atlas)
✓ Backend .env configured
✓ Backend npm install complete
✓ Backend running (npm run dev)
✓ Frontend .env configured
✓ Frontend npm install complete
✓ Frontend running (npm start)
✓ Browser opens http://localhost:3000
```

## 📝 First Steps After Setup

### 1. Register a Business Account

1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill in:
   - Full Name: "John Salon"
   - Email: "john@salon.com"
   - Password: "password123"
   - Business Name: "John's Hair Salon"
   - Phone: "+1234567890"
4. Click "Create Account"

### 2. Create Your First Service

1. Click "Services" in sidebar
2. Click "+ Add Service" button
3. Fill in:
   - Service Name: "Haircut"
   - Description: "Classic men's haircut"
   - Price: "$25"
   - Duration: "30" minutes
   - Category: "Hair"
4. Click "Create Service"

### 3. Test Booking Page

1. From dashboard, note your Business ID (or check browser URL structure)
2. In new tab, go to: `http://localhost:3000/booking/YOUR_BUSINESS_ID`
3. Follow 3-step booking:
   - Select "Haircut"
   - Pick a date
   - Pick a time slot
   - Enter name & phone
   - Confirm booking

*Note: Replace `YOUR_BUSINESS_ID` with actual ID. You can copy it from the network tab or see it in API calls.*

### 4. View Your Booking

1. Go back to main dashboard
2. Click "Appointments"
3. See your new booking!
4. Try "Confirm" to change status

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Login | http://localhost:3000/login |
| Register | http://localhost:3000/register |
| Dashboard | http://localhost:3000/dashboard |
| Services | http://localhost:3000/services |
| Appointments | http://localhost:3000/appointments |
| Profile | http://localhost:3000/profile |
| Public Booking | http://localhost:3000/booking/{businessId} |
| Backend Health | http://localhost:5000/api/health |

## 🧪 Testing API Endpoints

Test backend without frontend using cURL or Postman:

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Owner",
    "email": "test@example.com",
    "password": "password123",
    "businessName": "Test Business"
  }'
```

See [backend/API_DOCUMENTATION.md](../backend/API_DOCUMENTATION.md) for complete API reference.

## 🐛 Troubleshooting

### "Cannot connect to MongoDB"
- **Solution**: Check MongoDB is running
  - Windows: Run `mongod` in command prompt
  - macOS: `brew services start mongodb-community`
  - Cloud: Check MongoDB Atlas connection string

### "Error: ECONNREFUSED 127.0.0.1:5000"
- **Solution**: Backend not running
  - In backend folder: `npm run dev`
  - Check for port conflicts: `PORT=5000` in use

### "Frontend won't load"
- **Solution**: Check React is running
  - In frontend folder: `npm start`
  - Clear browser cache (Ctrl+Shift+Delete)

### "Page shows 'Error connecting to API'"
- **Solution**: CORS or API URL issue
  - Backend running?
  - Frontend `.env` has `REACT_APP_API_URL=http://localhost:5000/api`?
  - Restart frontend: `npm start`

### "Services not showing on booking page"
- **Solution**: Check service exists and business ID is correct
  - Create service in dashboard first
  - Use correct business ID in booking URL
  - Check Services page shows service

## 📁 File Structure Reminder

```
BookingApp/
├── backend/
│   ├── .env              ← Contains MONGODB_URI & JWT_SECRET
│   ├── server.js         ← Start here
│   └── package.json
│
└── frontend/
    ├── .env              ← Contains REACT_APP_API_URL
    ├── package.json
    └── public/
        └── index.html
```

## 🎓 Next Steps

1. **Explore the code:**
   - Backend models: `backend/models/`
   - Frontend pages: `frontend/src/pages/`
   - API calls: `frontend/src/services/api.js`

2. **Read documentation:**
   - [Backend README](../backend/README.md)
   - [Frontend README](../frontend/README.md)
   - [API Documentation](../backend/API_DOCUMENTATION.md)

3. **Test thoroughly:**
   - Register multiple accounts
   - Create different services
   - Test booking from different browsers
   - Check appointment management

4. **Customize for your needs:**
   - Update colors in `frontend/src/styles/global.css`
   - Modify API fields in models
   - Add business logo support
   - Implement working hours

## 💡 Pro Tips

- **Local Data**: MongoDB stores data in `data/db/` by default
- **JWT Token**: Stored in browser localStorage, persists across sessions
- **API Testing**: Open browser DevTools → Network tab to see API calls
- **Debug Mode**: Check console for errors (F12 or Ctrl+Shift+I)
- **Reset Everything**: Delete MongoDB data and .env files, start fresh

## 🚀 Production Deployment

When ready to launch:

1. **Backend**: Deploy to Heroku, AWS, or Railway
2. **Frontend**: Deploy to Netlify, Vercel, or GitHub Pages
3. **Database**: Use MongoDB Atlas (cloud)
4. **Update URLs**: Change API URLs to production domain

See main [README.md](../README.md) for deployment instructions.

## ❓ Need Help?

1. Check [troubleshooting section](#-troubleshooting) above
2. Read error messages in terminal carefully
3. Check `backend/README.md` and `frontend/README.md`
4. Look at browser DevTools Console (F12)
5. Check Network tab for API errors

---

**You're all set! 🎉**

Your booking app is now running. Share the booking link with clients!

Dashboard: `http://localhost:3000/dashboard`
Public Booking: `http://localhost:3000/booking/{businessId}`
