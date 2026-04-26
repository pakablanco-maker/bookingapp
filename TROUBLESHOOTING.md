# 🚨 Troubleshooting Guide

Common issues and solutions during frontend-backend integration.

---

## 🔴 API Connection Issues

### Issue: "Cannot connect to API" / CORS Error

**Error Message:**
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:5000/api/...
```

**Causes:**
- Backend not running
- Wrong API URL in frontend `.env`
- CORS not enabled in backend

**Solutions:**

1. **Verify backend is running:**
   ```bash
   # In backend terminal
   npm run dev
   
   # Should see:
   # 🚀 Server running on port 5000
   ```

2. **Check frontend `.env` file:**
   ```properties
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Verify CORS in backend:**
   Check `backend/server.js` has:
   ```javascript
   const cors = require('cors');
   app.use(cors());
   ```

4. **Restart frontend:**
   ```bash
   # Stop: Ctrl+C
   # Start:
   npm start
   ```

5. **Test directly:**
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"message":"Server is running"}
   ```

---

### Issue: Network request hangs / times out

**Error Message:**
```
Request timeout / Pending forever in Network tab
```

**Causes:**
- Backend crashed or not responding
- Large data transfer
- Database query taking too long

**Solutions:**

1. **Check backend terminal:**
   Look for error messages or crashes

2. **Restart backend:**
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```

3. **Check database connection:**
   Backend logs should show:
   ```
   MongoDB Connected: localhost
   ```

4. **Verify database is running:**
   ```bash
   # For local MongoDB
   mongod --version  # Check installed
   
   # Windows: Run mongod in Command Prompt
   # macOS: brew services start mongodb-community
   ```

---

### Issue: 404 Not Found errors

**Error Message:**
```json
{
  "message": "Cannot POST /api/auth/register",
  "status": 404
}
```

**Causes:**
- Wrong endpoint path
- Typo in route name
- Backend routes not loaded

**Solutions:**

1. **Check endpoint spelling:**
   - Correct: `/api/auth/register`
   - Wrong: `/api/signup` or `/auth/register`

2. **Verify route files loaded:**
   Check `backend/server.js`:
   ```javascript
   app.use('/api/auth', require('./routes/authRoutes'));
   app.use('/api/services', require('./routes/serviceRoutes'));
   app.use('/api/appointments', require('./routes/appointmentRoutes'));
   ```

3. **Check API_REFERENCE.md for correct endpoints**

4. **Restart backend:**
   ```bash
   npm run dev
   ```

---

## 🔴 Authentication Issues

### Issue: "Unauthorized" / 401 Error

**Error Message:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Causes:**
- Missing JWT token
- Invalid token
- Token expired
- Token not sent with header

**Solutions:**

1. **Check token in localStorage:**
   ```javascript
   // Browser Console
   localStorage.getItem('token')
   // Should return: eyJhbGc... (not null)
   ```

2. **Verify token format:**
   Should have 3 parts: `xxxxx.yyyyy.zzzzz`

3. **Check Authorization header:**
   Network tab → Click request → Headers
   Should show:
   ```
   Authorization: Bearer eyJhbGc...
   ```

4. **Login again:**
   ```javascript
   // Clear old token
   localStorage.clear()
   // Then login again
   ```

5. **Check backend JWT_SECRET:**
   `.env` file should have:
   ```properties
   JWT_SECRET=your_secret_key
   ```

6. **Verify axios interceptor:**
   Check `frontend/src/services/api.js` has token interceptor

---

### Issue: Login doesn't work / "Invalid email or password"

**Causes:**
- Wrong credentials
- User not registered
- Database not connected
- Password hashing issue

**Solutions:**

1. **Verify user exists:**
   - Make sure you registered first
   - Check email matches (case-sensitive)

2. **Check credentials:**
   ```javascript
   // Try registering new account
   // Email: test@example.com
   // Password: testpass123
   ```

3. **Check database connection:**
   Backend logs should show:
   ```
   MongoDB Connected: localhost
   ```

4. **Clear browser data:**
   ```javascript
   localStorage.clear()
   location.reload()
   ```

5. **Test with cURL:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

---

### Issue: Token not persisting after refresh

**Problem:**
- Token disappears after page refresh
- Logged out when refreshing browser

**Causes:**
- localStorage not saving
- AuthContext not loading token on mount

**Solutions:**

1. **Check AuthContext:**
   `frontend/src/context/AuthContext.js` should have:
   ```javascript
   useEffect(() => {
     const token = localStorage.getItem('token');
     setToken(token);
   }, []);
   ```

2. **Verify localStorage works:**
   ```javascript
   // Browser Console
   localStorage.setItem('test', 'value');
   localStorage.getItem('test'); // Should return 'value'
   ```

3. **Check browser privacy mode:**
   - localStorage disabled in private/incognito mode
   - Use regular browsing mode

4. **Clear browser cache:**
   DevTools → Application → Cache Storage → Clear All

---

## 🔴 Database Issues

### Issue: "MongoDB connection failed"

**Error Message:**
```
Error connecting to MongoDB: MongooseError: Cannot connect to mongodb://localhost:27017
```

**Causes:**
- MongoDB not running
- Wrong connection string
- Invalid credentials (for Atlas)
- Firewall blocking connection

**Solutions:**

1. **Check MongoDB is running:**
   
   **Windows:**
   ```bash
   mongod
   # In another terminal: mongo
   ```
   
   **macOS:**
   ```bash
   brew services start mongodb-community
   mongo
   ```
   
   **Linux:**
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify connection string:**
   
   **Local:**
   ```properties
   MONGODB_URI=mongodb://localhost:27017/booking-app
   ```
   
   **Atlas (Cloud):**
   ```properties
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking-app
   ```

3. **Test connection:**
   ```bash
   # Check if mongod is running
   ps aux | grep mongod
   
   # Try connecting
   mongo mongodb://localhost:27017
   ```

4. **Check firewall:**
   - Port 27017 (local MongoDB)
   - Port 27015-27016 (MongoDB Atlas)

5. **Use Atlas (easier for beginners):**
   - Create free account at mongodb.com/cloud/atlas
   - Create cluster
   - Get connection string
   - Update `.env`

---

### Issue: "Cannot find database" / Empty results

**Problem:**
- Collections not showing data
- Queries return empty

**Causes:**
- Data in wrong database
- Collections not created yet
- Wrong database name

**Solutions:**

1. **Check database name:**
   Connection string should have: `/booking-app`
   ```
   mongodb://localhost:27017/booking-app
   ```

2. **Verify data exists:**
   ```bash
   # In mongo shell
   use booking-app
   db.users.find()
   db.services.find()
   ```

3. **Create test data:**
   - Register new user (creates User document)
   - Create service (creates Service document)
   - Book appointment (creates Appointment document)

4. **Check collections:**
   ```bash
   show collections
   # Should show: users, services, appointments
   ```

---

## 🔴 Frontend Issues

### Issue: Blank page / Nothing loads

**Problem:**
- App doesn't display anything
- White screen

**Causes:**
- JavaScript error
- React not mounted
- Component crash

**Solutions:**

1. **Check console for errors:**
   DevTools → Console
   Look for red error messages

2. **Check for async/await issues:**
   Make sure all API calls have proper error handling

3. **Verify React entry point:**
   `frontend/src/index.js` should exist

4. **Clear bundle cache:**
   ```bash
   # Stop: Ctrl+C
   rm -rf node_modules/.cache
   npm start
   ```

5. **Full clean rebuild:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

---

### Issue: "Module not found" error

**Error Message:**
```
Failed to compile
./src/components/Navbar.js
Module not found: Can't resolve './AuthContext'
```

**Causes:**
- Missing file
- Wrong import path
- File deleted or moved

**Solutions:**

1. **Check file exists:**
   Look in `frontend/src/context/AuthContext.js`

2. **Fix import path:**
   ```javascript
   // Wrong
   import { useAuth } from './AuthContext'
   
   // Correct (from pages folder)
   import { useAuth } from '../context/AuthContext'
   ```

3. **Verify file structure:**
   ```
   frontend/src/
   ├── components/
   ├── pages/
   ├── context/
   ├── services/
   └── styles/
   ```

4. **Check for typos:**
   - Filenames are case-sensitive
   - `AuthContext.js` ≠ `authcontext.js`

---

### Issue: Styles not loading / Page unstyled

**Problem:**
- No CSS applied
- Bootstrap classes not working

**Causes:**
- CSS file not imported
- Bootstrap CSS missing
- Wrong class names

**Solutions:**

1. **Check CSS imports:**
   `frontend/src/App.js` should have:
   ```javascript
   import './styles/global.css'
   import 'bootstrap/dist/css/bootstrap.min.css'
   ```

2. **Verify Bootstrap installed:**
   `frontend/package.json` should have:
   ```json
   "bootstrap": "^5.2.3",
   "react-bootstrap": "^2.6.0"
   ```

3. **Check file path:**
   Style file should be at: `frontend/src/styles/global.css`

4. **Restart frontend:**
   ```bash
   npm start
   ```

---

### Issue: Form not submitting / Buttons don't work

**Problem:**
- Click button, nothing happens
- Form values not sent

**Causes:**
- Missing onClick handler
- Form validation failing silently
- Async operation hanging
- State not updating

**Solutions:**

1. **Check console for errors:**
   DevTools → Console (look for red errors)

2. **Verify handler exists:**
   ```javascript
   <button onClick={handleSubmit}>
     // handler must be defined
   </button>
   ```

3. **Check form validation:**
   Make sure all required fields filled

4. **Look at Network tab:**
   - See if request sent to backend
   - Check response status
   - Read error message

5. **Test in browser console:**
   ```javascript
   // Simulate form submission
   fetch('http://localhost:5000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       email: 'test@example.com',
       password: 'pass123'
     })
   })
   .then(r => r.json())
   .then(d => console.log(d))
   .catch(e => console.error(e))
   ```

---

## 🔴 Data Issues

### Issue: Services not showing on booking page

**Problem:**
- Booking page blank
- No services in dropdown

**Causes:**
- No services created
- Wrong business ID
- API error

**Solutions:**

1. **Create services first:**
   - Login to dashboard
   - Go to Services page
   - Click "Add Service"
   - Create "Haircut" service

2. **Check business ID:**
   URL should have valid business ID:
   ```
   http://localhost:3000/booking/60d5ec49c1234567890abcaa
   ```

3. **Verify API call:**
   Network tab → Find `GET /services/...`
   - Check response has data
   - Check status is 200

4. **Test directly:**
   ```bash
   curl http://localhost:5000/api/services/60d5ec49c1234567890abcaa
   ```

---

### Issue: Time slots not showing

**Problem:**
- Calendar shows dates but no times
- Time slots empty

**Causes:**
- No available slots
- API error
- Business closed on that day

**Solutions:**

1. **Check business hours:**
   - Go to Profile page
   - Verify working hours set
   - Make sure day is not marked closed

2. **Select future date:**
   - Can't book past dates
   - Select tomorrow or later

3. **Verify slots available:**
   ```bash
   curl "http://localhost:5000/api/appointments/available-slots/businessId/serviceId/2026-04-21"
   # Should see slots array with times
   ```

4. **Check for bookings:**
   If all slots showing "available: false", might all be booked

---

### Issue: Double booking not prevented

**Problem:**
- Can book same time twice
- Overbooking happens

**Causes:**
- Backend validation disabled
- Race condition
- Service duration too short

**Solutions:**

1. **Verify backend check:**
   `backend/utils/helpers.js` has `isTimeSlotBooked()`

2. **Check available-slots endpoint:**
   Should return `available: false` for booked times

3. **Test directly:**
   ```bash
   # Try booking same slot twice
   curl -X POST http://localhost:5000/api/appointments \
     -H "Content-Type: application/json" \
     -d '{ ... }'
   
   # Second should fail with:
   # "This time slot is already booked"
   ```

---

## 🔴 Port Conflicts

### Issue: "Port 5000 already in use"

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Causes:**
- Another app using port 5000
- Previous server not fully stopped
- Port stuck in TIME_WAIT state

**Solutions:**

1. **Find process using port:**
   
   **Windows:**
   ```bash
   netstat -ano | findstr :5000
   # Get PID from output
   taskkill /PID 12345 /F
   ```
   
   **macOS/Linux:**
   ```bash
   lsof -i :5000
   kill -9 12345
   ```

2. **Use different port:**
   ```bash
   PORT=5001 npm run dev
   
   # Then update frontend .env:
   REACT_APP_API_URL=http://localhost:5001/api
   npm start
   ```

3. **Wait for port to release:**
   Sometimes takes 30-60 seconds after kill

---

### Issue: "Port 3000 already in use"

**Error Message:**
```
Something is already running on port 3000
? Would you like to run this app on another port instead? (Y/n)
```

**Solution:**
- Type `Y` and press Enter
- App will start on port 3001 instead

---

## 🟡 Performance Issues

### Issue: App is very slow

**Problem:**
- Pages take long to load
- Clicks take time to respond

**Causes:**
- Large data transfers
- Slow internet
- Inefficient queries
- Memory leak

**Solutions:**

1. **Check Network tab:**
   - Look for slow requests
   - Check response sizes
   - Look for failed requests

2. **Check backend logs:**
   See if queries are slow

3. **Optimize queries:**
   ```javascript
   // Only fetch needed fields
   db.appointments.find(
     {},
     { clientName: 1, startTime: 1, status: 1 }
   )
   ```

4. **Enable caching:**
   Add caching headers in backend

5. **Use pagination:**
   Fetch 10 items at a time, not 1000

---

## 🟡 Environment Issues

### Issue: `.env` variables not loading

**Problem:**
- API URL wrong
- Database string not used
- Changes not taking effect

**Causes:**
- Wrong filename (should be exactly `.env`)
- File in wrong location
- Server not restarted

**Solutions:**

1. **Check filename:**
   - Must be exactly `.env` (not `.env.example`)
   - Location: `frontend/` and `backend/` folders

2. **Verify correct location:**
   ```
   backend/.env           ← For backend
   frontend/.env          ← For frontend
   ```

3. **Restart both servers:**
   ```bash
   # Stop both (Ctrl+C)
   # Terminal 1: npm run dev (backend)
   # Terminal 2: npm start (frontend)
   ```

4. **Check variable names:**
   Frontend: `REACT_APP_*` (must have prefix)
   Backend: Regular names

5. **Frontend example:**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

---

## 🟢 Quick Diagnostics

Run these commands to identify issues:

```bash
# 1. Backend running?
curl http://localhost:5000/api/health

# 2. Frontend running?
curl http://localhost:3000
# (Check browser instead)

# 3. MongoDB running?
mongo --version

# 4. Check backend logs
# Look in Terminal 1

# 5. Check frontend errors
# DevTools Console (F12)

# 6. Check network requests
# DevTools Network tab (F12)
```

---

## 📞 Getting Help

If still stuck:

1. **Check error message carefully**
   - Note exact error text
   - Check spelling

2. **Look at:
   - DevTools Console (browser F12)
   - Backend terminal logs
   - Network tab responses

3. **Try common fixes:**
   - Restart both servers
   - Clear browser cache
   - Clear localStorage
   - Kill and restart processes

4. **Review docs:**
   - SETUP_GUIDE.md
   - API_REFERENCE.md
   - INTEGRATION_TESTING.md

---

## ✅ When Everything Works

You should see:

✅ Backend terminal:
```
🚀 Server running on port 5000
MongoDB Connected: localhost
GET /api/health 200
```

✅ Frontend terminal:
```
Compiled successfully!
Local: http://localhost:3000
```

✅ Browser:
- http://localhost:3000 loads
- Can register account
- Can login
- Can create services
- Can book appointments
- Dashboard shows stats

✅ No errors in console

**If all good → You're done! 🎉**

---

**Still need help? Check INTEGRATION_TESTING.md for step-by-step testing guide!**
