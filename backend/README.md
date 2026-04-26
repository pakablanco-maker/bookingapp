# Booking App Backend

MERN Stack Backend for Booking/Reservation System

## Backend Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── authenticate.js       # JWT authentication middleware
├── models/                   # Mongoose schemas (using next)
│   ├── User.js
│   ├── Service.js
│   └── Appointment.js
├── controllers/              # Business logic
│   ├── authController.js
│   ├── serviceController.js
│   └── appointmentController.js
├── routes/                   # API endpoints
│   ├── authRoutes.js
│   ├── serviceRoutes.js
│   └── appointmentRoutes.js
├── server.js                 # Express server entry point
├── package.json
├── .env.example             # Environment variables template
└── .gitignore
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `backend/` folder (copy from `.env.example`):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/booking-app
JWT_SECRET=your_random_jwt_secret_key_here
JWT_EXPIRY=7d
NODE_ENV=development
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/booking-app
```

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on: `http://localhost:5000`

## API Health Check

```
GET http://localhost:5000/api/health
```

Returns:
```json
{
  "message": "Server is running",
  "status": "OK"
}
```

## Next Steps

- Step 2: Generate models (User, Service, Appointment)
- Step 3: Implement controllers
- Step 4: Create frontend

## Technology Stack

- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Security:** bcryptjs for password hashing
- **Validation:** validator.js
- **Environment:** dotenv
- **CORS:** Enabled for frontend integration
