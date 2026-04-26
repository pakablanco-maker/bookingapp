# Backend Models & Database Schema

## 📊 Data Models Overview

### 1. **User Model** (Business Owner)

**File:** `models/User.js`

**Schema:**
```javascript
{
  name: String,                    // Business owner name (required)
  email: String,                   // Unique email (required)
  password: String,                // Hashed password (required)
  businessName: String,            // Business name
  businessDescription: String,     // Business description (max 500 chars)
  phone: String,                   // Contact phone
  address: String,                 // Business address
  city: String,                    // Business city
  businessImage: String,           // Business logo/image URL
  
  // Working hours (by day)
  workingHours: {
    monday: { start: "09:00", end: "18:00" },
    tuesday: { start: "09:00", end: "18:00" },
    // ... etc for all days
  },
  
  isActive: Boolean,               // Account status
  timestamps: true                 // createdAt, updatedAt
}
```

**Key Methods:**
- `matchPassword(password)` - Compare hashed passwords
- `toJSON()` - Excludes password from responses

**Database Indexes:**
- `email` (unique)

---

### 2. **Service Model** (Services Offered)

**File:** `models/Service.js`

**Schema:**
```javascript
{
  businessId: ObjectId,            // Reference to User (required)
  name: String,                    // Service name (required)
  description: String,             // Service description
  price: Number,                   // Price in USD (required, min: 0)
  duration: Number,                // Duration in minutes (required, min: 15)
  image: String,                   // Service image URL
  
  category: String,                // Service category
  // Enum: 'hair', 'beauty', 'massage', 'coaching', 'other'
  
  isActive: Boolean,               // Service availability
  timestamps: true                 // createdAt, updatedAt
}
```

**Examples:**
```json
{
  "businessId": "60d5ec49...",
  "name": "Haircut",
  "description": "Classic mens haircut",
  "price": 25,
  "duration": 30,
  "category": "hair",
  "isActive": true
}
```

**Database Indexes:**
- `businessId` + `isActive`

---

### 3. **Appointment Model** (Bookings)

**File:** `models/Appointment.js`

**Schema:**
```javascript
{
  businessId: ObjectId,            // Reference to User (required)
  serviceId: ObjectId,             // Reference to Service (required)
  
  clientName: String,              // Client name (required)
  clientPhone: String,             // Client phone (required)
  clientEmail: String,             // Client email (optional)
  
  appointmentDate: Date,           // Appointment date (required)
  startTime: String,               // Start time "HH:MM" (required)
  endTime: String,                 // End time "HH:MM" (required)
  
  status: String,                  // Status (required)
  // Enum: 'pending', 'confirmed', 'completed', 'cancelled'
  
  notes: String,                   // Additional notes
  reminderSent: Boolean,           // Email reminder sent flag
  timestamps: true                 // createdAt, updatedAt
}
```

**Examples:**
```json
{
  "businessId": "60d5ec49...",
  "serviceId": "60d5ec49...",
  "clientName": "Alice Johnson",
  "clientPhone": "+1234567890",
  "clientEmail": "alice@example.com",
  "appointmentDate": "2024-04-20",
  "startTime": "14:00",
  "endTime": "14:30",
  "status": "pending"
}
```

**Virtual Fields:**
- `formattedDate` - Returns formatted date string
- `isPast` - Boolean, true if appointment date/time is in the past

**Database Indexes:**
- `businessId` + `appointmentDate`
- `businessId` + `status`

---

## 🔐 Password Hashing & Security

- **Library:** bcryptjs
- **Salt Rounds:** 10
- **Algorithm:** bcrypt SHA-256

**Example:**
```javascript
// Password is hashed before saving to database
user = new User({ password: "mypassword123" });
await user.save(); // Password is auto-hashed via schema.pre('save')

// Compare password on login
const isMatch = await user.matchPassword("mypassword123"); // true
```

---

## 🔗 Database Relationships

```
User (Business Owner)
  ├── has many → Services
  └── has many → Appointments

Service
  ├── belongs to → User (businessId)
  └── has many → Appointments

Appointment
  ├── belongs to → User (businessId)
  └── belongs to → Service (serviceId)
```

---

## 📝 Complete Controllers Implementation

### authController.js
- ✅ `register()` - Register new business
- ✅ `login()` - Login with email/password
- ✅ `getProfile()` - Get user profile
- ✅ `updateProfile()` - Update business information

### serviceController.js
- ✅ `getServices()` - Get services for a business (public)
- ✅ `getBusinessServices()` - Get own services (protected)
- ✅ `createService()` - Create new service
- ✅ `updateService()` - Update service details
- ✅ `deleteService()` - Delete service

### appointmentController.js
- ✅ `getAppointments()` - Get all appointments (business owner)
- ✅ `getTodayAppointments()` - Get today's appointments
- ✅ `getAppointmentStats()` - Get statistics for dashboard
- ✅ `getAvailableSlots()` - Get available time slots
- ✅ `createAppointment()` - Create appointment (client booking)
- ✅ `updateAppointmentStatus()` - Update appointment status
- ✅ `cancelAppointment()` - Cancel appointment

---

## 🛠️ Utility Functions

**File:** `utils/helpers.js`

- `generateToken()` - Create JWT token
- `timeToMinutes()` - Convert "HH:MM" to minutes
- `addMinutesToTime()` - Add duration to time
- `generateTimeSlots()` - Generate available slots
- `isTimeSlotBooked()` - Check for double booking
- `formatDate()` - Format date to YYYY-MM-DD

---

## 🚀 Quick Test

### 1. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas connection string
```

### 2. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Test API (using Postman or curl)

**Register:**
```bash
POST http://localhost:5000/api/auth/register
Body: {
  "name": "John Salon",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "John's Hair Salon"
}
```

**Create Service:**
```bash
POST http://localhost:5000/api/services
Auth: Bearer YOUR_TOKEN
Body: {
  "name": "Haircut",
  "price": 25,
  "duration": 30,
  "category": "hair"
}
```

**Get Available Slots:**
```bash
GET http://localhost:5000/api/appointments/available-slots/BUSINESS_ID/SERVICE_ID/2024-04-20
```

---

## 📁 Updated Backend Structure

```
backend/
├── models/
│   ├── User.js              ✅ User (Business Owner)
│   ├── Service.js           ✅ Services offered
│   └── Appointment.js       ✅ Bookings
├── controllers/
│   ├── authController.js    ✅ Complete with all methods
│   ├── serviceController.js ✅ Complete with all methods
│   └── appointmentController.js ✅ Complete with all methods
├── routes/
│   ├── authRoutes.js        ✅ Updated with all routes
│   ├── serviceRoutes.js     ✅ Updated with all routes
│   └── appointmentRoutes.js ✅ Updated with all routes
├── middleware/
│   └── authenticate.js      ✅ JWT verification
├── config/
│   └── db.js                ✅ MongoDB connection
├── utils/
│   ├── helpers.js           ✅ Utility functions
│   └── errorHandler.js      ✅ Error handling
├── server.js                ✅ Express server (routes uncommented!)
├── package.json             ✅ Dependencies
├── .env.example
├── .gitignore
├── README.md
└── API_DOCUMENTATION.md     ✅ Complete API docs
```

---

## ✨ Key Features Implemented

- ✅ User registration & login with JWT
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with middleware
- ✅ Service CRUD operations
- ✅ Appointment booking system
- ✅ Double booking prevention
- ✅ Available time slot generation
- ✅ Appointment status tracking
- ✅ Dashboard statistics
- ✅ MongoDB relationships & indexes
- ✅ Error handling
- ✅ Complete API documentation

---

## 🎯 Next Step: Frontend

Ready for **Step 3: Generate Frontend Pages** with React + Bootstrap 5

Frontend will include:
- Login/Register pages
- Dashboard with statistics
- Services management
- Appointments management
- Public booking page
- Weekly calendar view
