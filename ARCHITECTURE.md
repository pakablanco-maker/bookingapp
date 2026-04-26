# 🏗️ BookingApp Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT DEVICES                               │
│                  (Browser, Mobile, Tablet)                          │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                               │
│                Port: 3000                                            │
├─────────────────────────────────────────────────────────────────────┤
│  Pages:          Components:           Context:  Services:          │
│  • Login         • Navbar              • Auth    • API Client       │
│  • Register      • Sidebar             Context   (Axios)            │
│  • Dashboard     • ServiceCard                                      │
│  • Services      • AppointmentCard                                   │
│  • Appointments  • TimeslotSelector                                  │
│  • Booking       • Calendar                                         │
│  • Profile                                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ REST API (JSON)
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js + Express)                     │
│                Port: 5000                                           │
├─────────────────────────────────────────────────────────────────────┤
│  API Endpoints:                                                     │
│  ├─ GET/POST   /api/auth/*          → authController               │
│  ├─ GET/POST/PUT/DELETE /api/services/* → serviceController        │
│  └─ GET/POST/PUT/DELETE /api/appointments/* → appointmentController│
├─────────────────────────────────────────────────────────────────────┤
│  Middleware:    Authentication      Utilities:   Config:            │
│  • CORS         • JWT Verificaton    • Helpers   • DB Connection   │
│  • JSON Parser  • Protected Routes   • Validators • Env Vars       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓ Mongoose ODM
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                                │
├─────────────────────────────────────────────────────────────────────┤
│  Collections:                                                       │
│  ├─ users          (Business Owners)                               │
│  ├─ services       (Services offered)                              │
│  └─ appointments   (Bookings)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Registration & Login Flow
```
User registers   →  Frontend Form  →  POST /api/auth/register
                                              ↓
                                    authController.register()
                                              ↓
                                    Hash password (bcryptjs)
                                              ↓
                                    Save to MongoDB
                                              ↓
                                    Generate JWT token
                                              ↓
                        Send token to Frontend  ←→  Store in localStorage
```

### Service Creation Flow
```
Owner creates service  →  POST /api/services
(Authenticated with JWT)         ↓
                        Verify JWT token (middleware)
                                 ↓
                        serviceController.createService()
                                 ↓
                        Validate input data
                                 ↓
                        Create Service in MongoDB
                                 ↓
                        Return Service JSON
                                 ↓
                        Frontend updates Services page
```

### Appointment Booking Flow
```
Client selects service  →  GET /api/appointments/available-slots/{id}/{date}
                                           ↓
                            appointmentController.getAvailableSlots()
                                           ↓
                            Query booked appointments for date
                                           ↓
                            Generate free time slots
                                           ↓
                        Return available slots to Frontend
                                           ↓
Client chooses time & enters details  →  POST /api/appointments
                                           ↓
                        appointmentController.createAppointment()
                                           ↓
                        Check for double booking (helper function)
                                           ↓
                        If available: Create appointment in MongoDB
                                           ↓
                        Return confirmation to Frontend
                                           ↓
                        Display success message
```

## Component Communication Pattern

```
App.js (Main Router)
    ├─ AuthProvider (Context)
    │   └─ useAuth() hook available to all components
    │
    ├─ Protected Routes
    │   ├─ Navbar
    │   ├─ Sidebar
    │   └─ Page Component
    │       └─ Calls API methods from api.js
    │           └─ Axios with JWT interceptor
    │               └─ Backend Controller
    │                   └─ Database interaction

Public Routes (Login, Register, Booking)
    └─ API calls without authentication
```

## Database Relationships

```
┌──────────────┐
│    User      │
├──────────────┤
│ _id          │
│ name         │
│ email        │  1
│ password     │  │
│ businessName │  │
│ workingHours │  │
└──────────────┘  │
     ↑            │
     │          (1:N)
     │            │
     │        (businessId)
     │            ↓
     │      ┌──────────────┐
     │      │   Service    │
     │      ├──────────────┤
     │      │ _id          │
     │      │ businessId───┘
     │      │ name         │
     │      │ price        │
     │      │ duration     │
     │      └──────────────┘
     │             ↑
     │           (1:N)
     │        (serviceId)
     │             │
     └──────────────────────→ ┌────────────────┐
                              │  Appointment   │
                              ├────────────────┤
                              │ _id            │
                              │ businessId─────┘
                              │ serviceId──────┘
                              │ clientName     │
                              │ appointmentDate│
                              │ startTime      │
                              │ status         │
                              └────────────────┘
```

## Authentication Flow (JWT)

```
1. Registration/Login
   ├─ User submits credentials
   ├─ Backend validates
   ├─ Backend generates JWT token
   └─ Token sent to Frontend

2. Token Storage
   └─ Frontend stores token in localStorage
      {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }

3. Authenticated Requests
   ├─ Frontend includes token in header
   │  Authorization: Bearer {token}
   ├─ Axios interceptor adds automatically
   └─ Backend middleware verifies token
      └─ If valid: continue
      └─ If invalid: 401 Unauthorized

4. Token Expiry
   └─ User autmatically logged out
   └─ localStorage cleared
   └─ Redirect to login
```

## API Request/Response Example

### Create Appointment (Client Booking)
**Request:**
```
POST /api/appointments HTTP/1.1
Content-Type: application/json

{
  "businessId": "60d5ec49c1234567890abcaa",
  "serviceId": "60d5ec49c1234567890abcde",
  "clientName": "Alice Johnson",
  "clientPhone": "+1111111111",
  "appointmentDate": "2024-04-20",
  "startTime": "14:00"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcff",
    "businessId": "60d5ec49c1234567890abcaa",
    "serviceId": "60d5ec49c1234567890abcde",
    "clientName": "Alice Johnson",
    "clientPhone": "+1111111111",
    "appointmentDate": "2024-04-20T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "14:30",
    "status": "pending",
    "createdAt": "2024-04-19T10:30:00.000Z",
    "updatedAt": "2024-04-19T10:30:00.000Z"
  }
}
```

**Response (Conflict - 400):**
```json
{
  "success": false,
  "message": "This time slot is already booked"
}
```

## State Management Strategy

### Global State (Context API)
```
AuthContext
├─ user: User object
├─ token: JWT string
├─ isAuthenticated: boolean
├─ loading: boolean
├─ error: string
└─ Methods:
   ├─ login()
   ├─ register()
   ├─ logout()
   └─ fetchProfile()
```

### Component State (useState)
```
Page Components
├─ FormData: Form inputs
├─ Data: API response data
├─ Loading: API call status
├─ Error: Error messages
├─ Filter: List filters
└─ Modal: Modal visibility
```

## Deployment Architecture

```
Production Environment:

┌─────────────────────────────────────────┐
│   Client                                 │
│   (Browser)                             │
└────────────────┬────────────────────────┘
                 │ HTTPS
    ┌────────────┴────────────┐
    ↓                         ↓
┌─────────────────────┐  ┌──────────────────┐
│ Frontend            │  │ Backend          │
│ (Vercel/Netlify)    │  │ (Heroku/Railway) │
│                     │  │                  │
│ React App (Built)   │  │ Node.js Server   │
│ Static HTML/CSS/JS  │  │ Port: 5000       │
│                     │  │                  │
└─────────────────────┘  └────────┬─────────┘
                                  │
                        ┌─────────┴──────────┐
                        ↓                    ↓
                   ┌────────────┐    ┌────────────┐
                   │ MongoDB    │    │ Backup     │
                   │ Atlas      │    │ Storage    │
                   │ (Cloud)    │    │ (Optional) │
                   └────────────┘    └────────────┘
```

## Performance Optimizations

### Frontend
- ✅ React component memoization
- ✅ Lazy loading calendar dates
- ✅ Efficient re-renders
- ✅ CSS minification
- ✅ Image optimization
- ✅ Code splitting

### Backend
- ✅ Database indexes
- ✅ Query optimization
- ✅ Caching (if needed)
- ✅ Connection pooling
- ✅ Error handling
- ✅ Rate limiting ready

### Database
- ✅ Indexes on frequently queried fields
- ✅ Virtual fields for computed values
- ✅ Efficient relationships via ObjectId refs

## Security Layers

```
Layer 1: HTTPS (Transport)
         ↓
Layer 2: CORS (Browser)
         ↓
Layer 3: Input Validation (Frontend + Backend)
         ↓
Layer 4: JWT Authentication (Protected Routes)
         ↓
Layer 5: Password Hashing (bcryptjs)
         ↓
Layer 6: Data Authorization (Check ownership)
         ↓
Layer 7: Error Handling (Don't leak info)
```

## Technology Stack Justification

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 | Modern, component-based, large ecosystem |
| Styling | Bootstrap 5 | Quick styling, responsive, accessible |
| Routing | React Router v6 | Industry standard, nested routes |
| API | Axios | Promise-based, interceptors, easy to use |
| Backend | Node.js | Fast, event-driven, JavaScript everywhere |
| Framework | Express | Lightweight, flexible, middleware ecosystem |
| Database | MongoDB | Document-based, flexible schema, scalable |
| ODM | Mongoose | Schema validation, relationships, hooks |
| Auth | JWT | Stateless, works well with REST APIs |
| Password | bcryptjs | Industry standard, salt rounds configurable |

## Scalability Considerations

Future scaling strategies:
1. **Horizontal Scaling** - Multiple server instances behind load balancer
2. **Caching** - Redis for frequently accessed data
3. **CDN** - For static assets and API responses
4. **Database Replication** - MongoDB replica sets
5. **API Versioning** - Support v1, v2 endpoints
6. **Microservices** - Separate services for auth, bookings, etc.
7. **Message Queue** - For async tasks (email notifications, etc.)
8. **Rate Limiting** - Prevent abuse and DDoS

## Monitoring & Logging

Ready to implement:
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Logging (Winston, Morgan)
- Health checks
- Uptime monitoring
- Analytics

---

This architecture is **production-ready** and designed for **scalability**, **security**, and **maintainability**.
