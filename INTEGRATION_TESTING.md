# 🔗 Frontend-Backend Integration & Testing Guide

Complete guide to connect and test your BookingApp MERN stack.

## ✅ Pre-Connection Checklist

Before starting, ensure:

- [ ] Node.js installed (v14+)
- [ ] MongoDB running (local or Atlas connection string ready)
- [ ] Both backend and frontend folders have `node_modules` installed
- [ ] Backend `.env` file configured with:
  - `MONGODB_URI` (local or Atlas)
  - `JWT_SECRET` (any random string)
- [ ] Frontend `.env` file has:
  - `REACT_APP_API_URL=http://localhost:5000/api`

---

## 🚀 Step 1: Start the Backend Server

### In Terminal 1:

```bash
cd backend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Expected output:
# 🚀 Server running on port 5000
# MongoDB Connected: {connection.host}
```

**Verify backend is running:**
```bash
# In another terminal
curl http://localhost:5000/api/health

# Should return:
# {"message":"Server is running","status":"OK"}
```

✅ **Backend status:** Server running on `http://localhost:5000`

---

## 🚀 Step 2: Start the Frontend

### In Terminal 2:

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm start

# Browser will automatically open http://localhost:3000
# If not, manually go to: http://localhost:3000
```

✅ **Frontend status:** App running on `http://localhost:3000`

---

## 📋 Both Servers Running - Checklist

```
Terminal 1 (Backend):
✓ 🚀 Server running on port 5000
✓ Database connected

Terminal 2 (Frontend):
✓ Compiled successfully
✓ http://localhost:3000 in browser
```

---

## 🧪 Integration Test Scenarios

### Test 1: Health Check

**Objective:** Verify backend is accessible from frontend

**Steps:**
```bash
# In frontend browser console (Press F12)
# Paste and run:
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data))
```

**Expected Result:**
```
{message: 'Server is running', status: 'OK'}
```

✅ **Status:** Backend accessible from frontend

---

### Test 2: User Registration

**Objective:** Create new business owner account

**Method 1: Using Frontend UI**

1. Go to `http://localhost:3000/register`
2. Fill in form:
   - Full Name: `John Salon`
   - Email: `john@test.com`
   - Password: `password123`
   - Business Name: `John's Hair Salon`
   - Phone: `+1234567890`
3. Click "Create Account"

**Expected Result:**
- ✅ Account created
- ✅ Redirected to dashboard
- ✅ User name shown in navbar
- ✅ JWT token stored in localStorage

**Verification:**
```javascript
// Browser DevTools Console:
localStorage.getItem('token')  // Should return JWT token

// Network Tab:
// See POST /api/auth/register
// Response: 200 with token
```

**Method 2: Using Postman/cURL**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Owner",
    "email": "test@example.com",
    "password": "password123",
    "businessName": "Test Salon",
    "phone": "+9876543210"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "Test Owner",
    "email": "test@example.com",
    "businessName": "Test Salon"
  }
}
```

✅ **Status:** Registration working

---

### Test 3: User Login

**Objective:** Login with created account

**Method 1: Using Frontend UI**

1. Logout first (click dropdown → Logout)
2. Go to `http://localhost:3000/login`
3. Enter:
   - Email: `john@test.com`
   - Password: `password123`
4. Click "Login"

**Expected Result:**
- ✅ Logged in successfully
- ✅ Redirected to dashboard
- ✅ Token updated in localStorage

**Method 2: Using cURL**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": { ... }
}
```

✅ **Status:** Login working

---

### Test 4: Get Profile

**Objective:** Fetch current user profile

**Frontend:** Happens automatically on login

**Backend Test:**
```bash
# Get token from previous login response
TOKEN="eyJhbGc..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Salon",
    "email": "john@test.com",
    "businessName": "John's Hair Salon"
  }
}
```

✅ **Status:** Profile retrieval working

---

### Test 5: Create Service

**Objective:** Add a new service

**Frontend UI:**

1. Dashboard → Click "Services"
2. Click "+ Add Service"
3. Fill form:
   - Service Name: `Haircut`
   - Description: `Classic mens haircut`
   - Price: `25`
   - Duration: `30`
   - Category: `Hair`
4. Click "Create Service"

**Expected Result:**
- ✅ Service created
- ✅ Service appears in list
- ✅ Notification: "Service created successfully"

**Backend Test:**
```bash
TOKEN="eyJhbGc..."

curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Haircut",
    "description": "Classic haircut",
    "price": 25,
    "duration": 30,
    "category": "hair"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "...",
    "businessId": "...",
    "name": "Haircut",
    "price": 25,
    "duration": 30
  }
}
```

✅ **Status:** Service creation working

---

### Test 6: Get Services (Public Endpoint)

**Objective:** Fetch services without authentication

**Method:** Get services by business ID (from URL or localStorage)

**Backend Test:**
```bash
BUSINESS_ID="60d5ec49c1234567890abcaa"

curl http://localhost:5000/api/services/$BUSINESS_ID
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "name": "Haircut",
      "price": 25,
      "duration": 30
    }
  ]
}
```

✅ **Status:** Public service listing working

---

### Test 7: Get Available Time Slots

**Objective:** Fetch available appointment times

**Backend Test:**
```bash
BUSINESS_ID="..."
SERVICE_ID="..."
DATE="2026-04-21"

curl "http://localhost:5000/api/appointments/available-slots/$BUSINESS_ID/$SERVICE_ID/$DATE"
```

**Expected Response:**
```json
{
  "success": true,
  "slots": [
    { "startTime": "09:00", "endTime": "09:30", "available": true },
    { "startTime": "09:30", "endTime": "10:00", "available": true },
    { "startTime": "10:00", "endTime": "10:30", "available": true }
  ],
  "serviceDuration": 30
}
```

✅ **Status:** Time slot generation working

---

### Test 8: Create Appointment (Client Booking)

**Objective:** Test public booking endpoint

**Frontend UI:**

1. Open booking page: `http://localhost:3000/booking/{businessId}`
2. Select service: "Haircut"
3. Select date: Tomorrow (e.g., 2026-04-21)
4. Select time: 10:00
5. Enter details:
   - Name: "Alice Johnson"
   - Phone: "+1111111111"
   - Email: "alice@example.com"
6. Click "Confirm Booking"

**Expected Result:**
- ✅ Booking created
- ✅ Success message: "✅ Appointment booked successfully!"
- ✅ Page resets for new booking

**Backend Test:**
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "...",
    "serviceId": "...",
    "clientName": "Alice Johnson",
    "clientPhone": "+1111111111",
    "clientEmail": "alice@example.com",
    "appointmentDate": "2026-04-21",
    "startTime": "10:00"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "...",
    "clientName": "Alice Johnson",
    "appointmentDate": "2026-04-21T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "pending"
  }
}
```

✅ **Status:** Appointment creation working

---

### Test 9: View Appointments (Business Owner)

**Objective:** Fetch all appointments for business

**Frontend UI:**

1. Logged in as business owner
2. Click "Appointments" in sidebar
3. Should see list of all bookings

**Expected Result:**
- ✅ List shows appointment with "Alice Johnson"
- ✅ Status shows "Pending"
- ✅ Date and time displayed correctly

**Backend Test:**
```bash
TOKEN="eyJhbGc..."

curl http://localhost:5000/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "clientName": "Alice Johnson",
      "startTime": "10:00",
      "status": "pending",
      "serviceId": { "name": "Haircut", "price": 25 }
    }
  ]
}
```

✅ **Status:** Appointment retrieval working

---

### Test 10: Update Appointment Status

**Objective:** Change appointment from pending to confirmed

**Frontend UI:**

1. Go to Appointments
2. Find appointment in list
3. Click "Confirm" button
4. Should see status change to "Confirmed"

**Backend Test:**
```bash
TOKEN="eyJhbGc..."
APPOINTMENT_ID="..."

curl -X PUT http://localhost:5000/api/appointments/$APPOINTMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "status": "confirmed" }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "_id": "...",
    "status": "confirmed",
    "clientName": "Alice Johnson"
  }
}
```

✅ **Status:** Status update working

---

### Test 11: Get Dashboard Statistics

**Objective:** Fetch appointment statistics

**Frontend:** Dashboard automatically loads stats

**Backend Test:**
```bash
TOKEN="eyJhbGc..."

curl http://localhost:5000/api/appointments/business/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "total": 1,
    "completed": 0,
    "confirmed": 1,
    "pending": 0,
    "cancelled": 0
  }
}
```

✅ **Status:** Statistics working

---

### Test 12: Double Booking Prevention

**Objective:** Verify system prevents booking same time slot twice

**Steps:**

1. Create first booking: Haircut, April 21, 10:00
2. Try to create second booking: Haircut, April 21, 10:00

**Backend Test:**
```bash
# First booking succeeds
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "...",
    "serviceId": "...",
    "clientName": "Alice",
    "clientPhone": "+1111111111",
    "appointmentDate": "2026-04-21",
    "startTime": "10:00"
  }'

# Second booking should fail
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "...",
    "serviceId": "...",
    "clientName": "Bob",
    "clientPhone": "+2222222222",
    "appointmentDate": "2026-04-21",
    "startTime": "10:00"
  }'
```

**Expected Response (Second):**
```json
{
  "success": false,
  "message": "This time slot is already booked"
}
```

✅ **Status:** Double booking prevention working

---

## 📊 Complete Integration Test Checklist

```
✓ Test 1:  Backend health check
✓ Test 2:  User registration
✓ Test 3:  User login
✓ Test 4:  Get profile
✓ Test 5:  Create service
✓ Test 6:  Get services (public)
✓ Test 7:  Get available slots
✓ Test 8:  Create appointment (public booking)
✓ Test 9:  View appointments (business)
✓ Test 10: Update appointment status
✓ Test 11: Get statistics
✓ Test 12: Double booking prevention
```

---

## 🔍 Browser DevTools Testing

### Network Tab Inspection

1. Open DevTools: **F12** or **Right-click → Inspect**
2. Click **Network** tab
3. Perform actions in app
4. View all API calls

**What to look for:**
- ✅ Status: 200 (success), 201 (created)
- ✅ Authorization header: `Bearer {token}`
- ✅ Response code 401 if token missing
- ⚠️ Status 400+ for errors

### Console Tab Inspection

1. Open DevTools: **F12**
2. Click **Console** tab
3. Run JavaScript to test API

**Example:**
```javascript
// Test if token present
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Test API call
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('Error:', err))
```

### Storage Tab Inspection

1. Open DevTools: **F12**
2. Click **Application** (Chrome) or **Storage** (Firefox)
3. Click **LocalStorage**
4. Look for `http://localhost:3000`

**What to check:**
- ✅ `token` key exists and has JWT
- ✅ Token format: `eyJhbGc...` (3 parts separated by dots)

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to API"

**Solution:**
1. Ensure backend is running: `npm run dev` in backend folder
2. Check backend on `http://localhost:5000/api/health`
3. Check frontend `.env` has `REACT_APP_API_URL=http://localhost:5000/api`
4. Restart frontend: Stop `npm start` and restart

### Issue: "Database connection failed"

**Solution:**
1. Check MongoDB is running:
   - Windows: Run `mongod` in Command Prompt
   - macOS: `brew services start mongodb-community`
2. Verify connection string in `.env`:
   - Local: `mongodb://localhost:27017/booking-app`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/booking-app`
3. Check credentials if using Atlas

### Issue: "JWT token errors"

**Solution:**
1. Clear localStorage: `localStorage.clear()` in console
2. Login again
3. Check JWT_SECRET in backend `.env` is consistent
4. Restart backend server

### Issue: "Services not showing on booking page"

**Solution:**
1. Verify business ID is correct in URL
2. Create a service first from Services page
3. Check service is set to `isActive: true`
4. Check network tab for API errors

### Issue: "Cannot book appointment"

**Solution:**
1. Select future date (not past)
2. Verify service exists and has valid duration
3. Check business working hours are set
4. Look at network tab for error details

---

## 📈 Performance Testing

### Load Time Check

```javascript
// Browser Console:
// Measure page load
console.time('Page Load');
// ... perform action
console.timeEnd('Page Load');

// Should be < 2 seconds
```

### API Response Time

Check Network tab:
- ✅ < 500ms: Good
- ⚠️ 500-1000ms: Acceptable
- ❌ > 1000ms: Needs optimization

---

## ✨ Full User Flow Test

**Complete booking workflow:**

1. **Open booking page:** `http://localhost:3000/booking/{businessId}`
2. **Select service:** Haircut
3. **Select date:** Tomorrow
4. **Select time:** 10:00 AM
5. **Enter name:** John Doe
6. **Enter phone:** +1-555-1234
7. **Enter email:** john@example.com
8. **Confirm booking:** Click button
9. **Verify success:** See confirmation message
10. **Check appointment:** Login as business owner, view in Appointments

**Total time:** < 1 minute
**Success rate:** 100%

---

## 📚 Next Steps

1. ✅ Both servers running
2. ✅ Tests passing
3. ✅ Full workflow tested

**Then:**
- Monitor console/network for errors
- Check error handling
- Test edge cases
- Prepare for deployment

---

## 🎯 Success Criteria

All tests passing means:

✅ Frontend-Backend communication working  
✅ Authentication implemented correctly  
✅ API endpoints functioning  
✅ Database operations working  
✅ Error handling implemented  
✅ JWT security in place  
✅ Ready for production deployment  

---

**Congratulations! Your BookingApp is fully integrated and tested! 🚀**
