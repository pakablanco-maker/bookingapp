# 📅 BookingApp - Complete MERN Booking System

A **complete, production-ready booking/reservation web application** for small businesses (hair salons, beauty services, coaching) built with the **MERN stack**.

## 🎯 Project Overview

BookingApp is a full-stack SaaS booking system that allows business owners to:
- Create and manage services
- View and manage appointments
- Track business statistics

And allows clients to:
- Browse available services
- Select preferred date & time
- Book appointments online

## 📸 Quick Features

✅ **User Authentication** - Register & login with JWT
✅ **Service Management** - Create, edit, delete services
✅ **Appointment System** - Complete booking workflow
✅ **Double Booking Prevention** - No scheduling conflicts
✅ **Beautiful Calendar** - Easy date/time selection
✅ **Dashboard** - Real-time statistics
✅ **Mobile Responsive** - Works on all devices
✅ **Public Booking Page** - Shareable booking link

## 🏗️ Project Structure

```
BookingApp/
├── backend/                 # Node.js + Express API
│   ├── models/             # MongoDB schemas
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # JWT authentication
│   ├── config/            # Database config
│   ├── utils/             # Helper functions
│   ├── server.js          # Express server
│   ├── package.json
│   ├── .env.example
│   ├── API_DOCUMENTATION.md
│   ├── MODELS_SCHEMA.md
│   └── README.md
│
└── frontend/               # React + Bootstrap UI
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/        # Page components
    │   ├── context/      # Auth context
    │   ├── services/     # API client
    │   ├── styles/       # CSS styles
    │   ├── App.js
    │   └── index.js
    ├── package.json
    ├── .env.example
    └── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
# App runs on http://localhost:3000
```

## 💻 Technology Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Bootstrap 5** - CSS framework
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **React Icons** - Icon library

## 🎨 Key Features

### For Business Owners

#### Dashboard
- Total appointments count
- Pending, confirmed, completed appointments overview
- Today's appointments list
- Completion rate statistics

#### Services Management
- Create unlimited services
- Set price and duration
- Edit service details
- Delete services
- Categorize services (hair, beauty, massage, coaching, etc.)

#### Appointments Management
- View all appointments
- Filter by status
- Confirm pending appointments
- Mark appointments as completed
- Cancel appointments
- Client information tracking

#### Profile Management
- Update business name and description
- Manage business address
- Update contact information
- View account details

### For Clients

#### Public Booking Page
Beautiful 3-step booking process:

**Step 1: Service Selection**
- Browse all available services
- View price and duration
- Simple click-to-select interface

**Step 2: Date & Time Selection**
- Interactive calendar (next 30 days)
- Visual date selection
- Real-time available time slots
- 30-minute interval slots
- Prevents already-booked times

**Step 3: Enter Your Details**
- Full name (required)
- Phone number (required)
- Email (optional)
- Review booking summary
- Confirm appointment

## 📊 Database Schema

### User (Business Owner)
```javascript
{
  name, email, password (hashed),
  businessName, businessDescription,
  phone, address, city,
  workingHours (by day),
  createdAt, updatedAt
}
```

### Service
```javascript
{
  businessId (ref: User),
  name, description,
  price, duration (in minutes),
  category, image,
  isActive,
  createdAt, updatedAt
}
```

### Appointment
```javascript
{
  businessId (ref: User),
  serviceId (ref: Service),
  clientName, clientPhone, clientEmail,
  appointmentDate, startTime, endTime,
  status (pending/confirmed/completed/cancelled),
  notes, reminderSent,
  createdAt, updatedAt
}
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT authentication with secure tokens
- ✅ Protected routes with middleware
- ✅ CORS enabled for frontend
- ✅ Input validation on both ends
- ✅ Error handling
- ✅ Data sanitization

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get profile (protected)
- `PUT /api/auth/update-profile` - Update profile (protected)

### Services
- `GET /api/services/:businessId` - Get services (public)
- `GET /api/services/business/all` - Get own services (protected)
- `POST /api/services` - Create service (protected)
- `PUT /api/services/:id` - Update service (protected)
- `DELETE /api/services/:id` - Delete service (protected)

### Appointments
- `GET /api/appointments` - Get all appointments (protected)
- `GET /api/appointments/business/today` - Today's appointments (protected)
- `GET /api/appointments/business/stats` - Statistics (protected)
- `GET /api/appointments/available-slots/:businessId/:serviceId/:date` - Available times (public)
- `POST /api/appointments` - Create appointment (public)
- `PUT /api/appointments/:id` - Update status (protected)
- `DELETE /api/appointments/:id` - Cancel appointment (protected)

For detailed API documentation, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

## 🎓 Usage Examples

### For Business Owner

1. **Register Account**
   - Go to `/register`
   - Enter name, email, password, business name
   - Account created with JWT token

2. **Create Services**
   - Navigate to `/services`
   - Click "Add Service"
   - Enter service name, price, duration
   - Service visible to clients

3. **Manage Appointments**
   - Go to `/appointments`
   - View all bookings
   - Confirm pending appointments
   - Cancel if needed

4. **View Statistics**
   - Check `/dashboard`
   - See today's appointments
   - View completion rate

### For Client

1. **Share Booking Link**
   - Business owner shares: `https://yourapp.com/booking/{businessId}`

2. **Book on Public Page**
   - Select service
   - Choose date on interactive calendar
   - Select available time
   - Enter name and phone
   - Confirm booking
   - Get confirmation

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/booking-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
NODE_ENV=development
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

- **Mobile (< 768px)** - Single column, touch-friendly buttons
- **Tablet (768px - 1024px)** - 2-column layouts
- **Desktop (> 1024px)** - Full multi-column layouts

## 🚦 Testing the System

### Create Test Business

```bash
# Backend must be running
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Salon",
    "email": "john@salon.com",
    "password": "password123",
    "businessName": "Johns Hair Salon"
  }'
```

### Create Test Service

Use the returned JWT token:

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Haircut",
    "price": 25,
    "duration": 30,
    "category": "hair"
  }'
```

### Test Booking

Visit: `http://localhost:3000/booking/{businessId}`

Replace `{businessId}` with the actual business ID from registration.

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. Build the project
   ```bash
   npm run build
   ```

2. Deploy to Netlify
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   netlify deploy --prod --dir=build
   ```

3. Configure environment variables in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

### Backend Deployment (Heroku/AWS/Railway)

1. Create Procfile
   ```
   web: node server.js
   ```

2. Deploy to Heroku
   ```bash
   heroku create your-booking-app
   heroku config:set MONGODB_URI=your_atlas_uri
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

## 🐛 Troubleshooting

### Can't connect to MongoDB
- Check MongoDB is running: `mongod`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

### API calls failing
- Ensure backend is running on port 5000
- Check frontend `.env` has correct API URL
- Check browser console for errors

### Booking page showing no services
- Verify business ID in URL is correct
- Check services are created in dashboard
- Ensure `isActive` is true for services

### JWT errors on login
- Clear localStorage in browser
- Check JWT_SECRET is set in backend
- Verify token expiry hasn't passed

## 📚 Documentation

- [Backend README](backend/README.md) - Backend setup & structure
- [Backend API Documentation](backend/API_DOCUMENTATION.md) - Complete API reference
- [Backend Models](backend/MODELS_SCHEMA.md) - Database schemas
- [Frontend README](frontend/README.md) - Frontend setup & components

## 🎯 Future Enhancements

- Email notifications with nodemailer
- SMS reminders (Twilio)
- Payment processing (Stripe)
- Google Calendar sync
- Email verification
- Password reset
- Business analytics
- Customer reviews & ratings
- Group bookings
- Waitlist functionality
- Video consultations
- Admin panel

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## ✨ Summary - 4 Steps to Complete App

✅ **Step 1:** Backend structure created (server, routes, middleware)
✅ **Step 2:** Models and controllers implemented (User, Service, Appointment)
✅ **Step 3:** Frontend pages & components built (React + Bootstrap)
⏭️ **Step 4:** Ready for frontend-backend connection and testing

---

**Built with ❤️ for small business owners**

Your complete booking solution in one application!
