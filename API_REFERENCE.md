# 🔌 Complete API Reference

All 17 API endpoints with examples and responses.

## 📋 API Base URL

```
Development: http://localhost:5000/api
Production: https://yourdomain.com/api
```

---

## 🔐 Authentication

### Authorization Header

All protected endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
```

### Getting a Token

1. **Register or login** first
2. Response includes `token` field
3. Store in `localStorage` (frontend does this automatically)
4. Include in all subsequent requests

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

# 🔓 Public Endpoints (No Auth Required)

## 1. Register New Business Owner

**Endpoint:**
```
POST /auth/register
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Salon",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "John's Hair Salon",
  "phone": "+1-555-1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ec49c1234567890abcaa",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon",
    "phone": "+1-555-1234"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## 2. Login Business Owner

**Endpoint:**
```
POST /auth/login
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d5ec49c1234567890abcaa",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

## 3. Get Services by Business

**Endpoint:**
```
GET /services/{businessId}
```

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| businessId | String (URL) | Yes |

**Example:**
```
GET /services/60d5ec49c1234567890abcaa
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcbb",
      "businessId": "60d5ec49c1234567890abcaa",
      "name": "Haircut",
      "description": "Classic haircut with styling",
      "price": 25,
      "duration": 30,
      "category": "hair",
      "isActive": true,
      "createdAt": "2026-04-20T10:00:00.000Z"
    },
    {
      "_id": "60d5ec49c1234567890abccc",
      "name": "Manicure",
      "price": 20,
      "duration": 45,
      "category": "beauty"
    }
  ]
}
```

---

## 4. Get Available Time Slots

**Endpoint:**
```
GET /appointments/available-slots/{businessId}/{serviceId}/{date}
```

**Parameters:**
| Name | Type | Format | Example |
|------|------|--------|---------|
| businessId | String (URL) | UUID | 60d5ec49c1234567890abcaa |
| serviceId | String (URL) | UUID | 60d5ec49c1234567890abcbb |
| date | String (URL) | YYYY-MM-DD | 2026-04-21 |

**Example:**
```
GET /appointments/available-slots/60d5ec49c1234567890abcaa/60d5ec49c1234567890abcbb/2026-04-21
```

**Response (200):**
```json
{
  "success": true,
  "slots": [
    { "startTime": "09:00", "endTime": "09:30", "available": true },
    { "startTime": "09:30", "endTime": "10:00", "available": false },
    { "startTime": "10:00", "endTime": "10:30", "available": true },
    { "startTime": "10:30", "endTime": "11:00", "available": true },
    { "startTime": "11:00", "endTime": "11:30", "available": false },
    { "startTime": "14:00", "endTime": "14:30", "available": true }
  ],
  "serviceDuration": 30,
  "date": "2026-04-21"
}
```

**Notes:**
- `available: false` = already booked
- `available: true` = can book
- Slots are 30-minute intervals
- Respects business working hours

---

## 5. Create Appointment (Client Booking)

**Endpoint:**
```
POST /appointments
```

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "businessId": "60d5ec49c1234567890abcaa",
  "serviceId": "60d5ec49c1234567890abcbb",
  "clientName": "Alice Johnson",
  "clientPhone": "+1-555-6789",
  "clientEmail": "alice@example.com",
  "appointmentDate": "2026-04-21",
  "startTime": "10:00"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcdd",
    "businessId": "60d5ec49c1234567890abcaa",
    "serviceId": "60d5ec49c1234567890abcbb",
    "clientName": "Alice Johnson",
    "clientPhone": "+1-555-6789",
    "clientEmail": "alice@example.com",
    "appointmentDate": "2026-04-21T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "10:30",
    "status": "pending",
    "createdAt": "2026-04-20T15:30:00.000Z"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "message": "This time slot is already booked"
}
```

**Validation:**
- Client name required
- Valid email (if provided)
- Valid phone number
- Future date only
- Slot must be available

---

# 🔒 Protected Endpoints (Auth Required)

## Authentication Header Required

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. Get Current User Profile

**Endpoint:**
```
GET /auth/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "60d5ec49c1234567890abcaa",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon",
    "businessDescription": "Professional salon services",
    "phone": "+1-555-1234",
    "address": "123 Main St",
    "city": "New York",
    "workingHours": {
      "monday": { "open": "09:00", "close": "17:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "17:00", "closed": false },
      "wednesday": { "open": "09:00", "close": "17:00", "closed": false },
      "thursday": { "open": "09:00", "close": "17:00", "closed": false },
      "friday": { "open": "09:00", "close": "18:00", "closed": false },
      "saturday": { "open": "10:00", "close": "16:00", "closed": false },
      "sunday": { "closed": true }
    },
    "isActive": true,
    "createdAt": "2026-04-15T08:00:00.000Z"
  }
}
```

---

## 7. Update User Profile

**Endpoint:**
```
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (all optional):**
```json
{
  "name": "John's Updated Salon",
  "businessName": "John's Premium Hair Salon",
  "businessDescription": "Luxury salon with 10 years experience",
  "phone": "+1-555-9999",
  "address": "456 Broadway Ave",
  "city": "New York"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "60d5ec49c1234567890abcaa",
    "name": "John's Updated Salon",
    "businessName": "John's Premium Hair Salon",
    "phone": "+1-555-9999"
  }
}
```

---

## 8. Get All Services (Business Owner)

**Endpoint:**
```
GET /services/by-business
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcbb",
      "name": "Haircut",
      "description": "Classic haircut",
      "price": 25,
      "duration": 30,
      "category": "hair",
      "isActive": true
    },
    {
      "_id": "60d5ec49c1234567890abccc",
      "name": "Color",
      "price": 60,
      "duration": 90,
      "category": "hair"
    }
  ]
}
```

---

## 9. Create Service

**Endpoint:**
```
POST /services
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Haircut",
  "description": "Classic men's or women's haircut",
  "price": 25,
  "duration": 30,
  "category": "hair"
}
```

**Categories:** `hair`, `beauty`, `massage`, `coaching`, `other`

**Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcee",
    "businessId": "60d5ec49c1234567890abcaa",
    "name": "Haircut",
    "description": "Classic men's or women's haircut",
    "price": 25,
    "duration": 30,
    "category": "hair",
    "isActive": true,
    "createdAt": "2026-04-20T15:45:00.000Z"
  }
}
```

---

## 10. Update Service

**Endpoint:**
```
PUT /services/{serviceId}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| serviceId | String (URL) | Yes |

**Body (all optional):**
```json
{
  "name": "Premium Haircut",
  "description": "Deluxe haircut with styling",
  "price": 35,
  "duration": 45
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcee",
    "name": "Premium Haircut",
    "price": 35,
    "duration": 45
  }
}
```

---

## 11. Delete Service

**Endpoint:**
```
DELETE /services/{serviceId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| serviceId | String (URL) | Yes |

**Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## 12. Get All Appointments (Business Owner)

**Endpoint:**
```
GET /appointments
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (optional):**
| Name | Type | Values |
|------|------|--------|
| status | String | pending, confirmed, completed, cancelled |
| date | String | YYYY-MM-DD |

**Examples:**
```
GET /appointments
GET /appointments?status=pending
GET /appointments?date=2026-04-21
GET /appointments?status=completed&date=2026-04-21
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcdd",
      "clientName": "Alice Johnson",
      "clientPhone": "+1-555-6789",
      "clientEmail": "alice@example.com",
      "appointmentDate": "2026-04-21T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "pending",
      "serviceId": {
        "_id": "60d5ec49c1234567890abcbb",
        "name": "Haircut",
        "price": 25
      },
      "createdAt": "2026-04-20T15:30:00.000Z"
    }
  ]
}
```

---

## 13. Get Today's Appointments

**Endpoint:**
```
GET /appointments/today
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcdd",
      "clientName": "Alice Johnson",
      "startTime": "09:00",
      "status": "confirmed",
      "serviceId": { "name": "Haircut" }
    },
    {
      "_id": "60d5ec49c1234567890abcee",
      "clientName": "Bob Smith",
      "startTime": "14:00",
      "status": "pending",
      "serviceId": { "name": "Color" }
    }
  ]
}
```

---

## 14. Get Appointment Statistics

**Endpoint:**
```
GET /appointments/business/stats
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 24,
    "pending": 5,
    "confirmed": 12,
    "completed": 6,
    "cancelled": 1
  }
}
```

---

## 15. Update Appointment Status

**Endpoint:**
```
PUT /appointments/{appointmentId}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| appointmentId | String (URL) | Yes |

**Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:** `pending`, `confirmed`, `completed`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcdd",
    "clientName": "Alice Johnson",
    "status": "confirmed",
    "appointmentDate": "2026-04-21",
    "startTime": "10:00"
  }
}
```

---

## 16. Cancel Appointment

**Endpoint:**
```
DELETE /appointments/{appointmentId}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parameters:**
| Name | Type | Required |
|------|------|----------|
| appointmentId | String (URL) | Yes |

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcdd",
    "status": "cancelled"
  }
}
```

---

## 17. Health Check

**Endpoint:**
```
GET /health
```

**Response (200):**
```json
{
  "message": "Server is running",
  "status": "OK"
}
```

**Notes:**
- No authentication required
- Use to verify backend is online
- Use to test connection

---

## 📊 Quick Reference Table

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/register | ❌ | Register new business |
| POST | /auth/login | ❌ | Login to account |
| GET | /auth/me | ✅ | Get my profile |
| PUT | /auth/profile | ✅ | Update my profile |
| GET | /services/{id} | ❌ | Get services by business |
| GET | /services/by-business | ✅ | Get my services |
| POST | /services | ✅ | Create new service |
| PUT | /services/{id} | ✅ | Update service |
| DELETE | /services/{id} | ✅ | Delete service |
| GET | /appointments/available-slots/{bid}/{sid}/{date} | ❌ | Get available times |
| POST | /appointments | ❌ | Book appointment |
| GET | /appointments | ✅ | Get my appointments |
| GET | /appointments/today | ✅ | Get today's bookings |
| GET | /appointments/business/stats | ✅ | Get statistics |
| PUT | /appointments/{id} | ✅ | Update appointment status |
| DELETE | /appointments/{id} | ✅ | Cancel appointment |
| GET | /health | ❌ | Health check |

---

## 🧪 Testing with cURL

### Register Example:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Salon",
    "email": "john@test.com",
    "password": "pass123",
    "businessName": "Johns Salon",
    "phone": "+1234567890"
  }'
```

### Login Example:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "pass123"
  }'
```

### Protected Endpoint Example:
```bash
TOKEN="eyJhbGc..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Common Status Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal error |

---

## 🚀 Next Steps

1. ✅ Understand all endpoints
2. ✅ Test in browser console or Postman
3. ✅ Follow INTEGRATION_TESTING.md for detailed tests
4. ✅ Use SETUP_GUIDE.md to run servers

**All 17 endpoints ready to use!** 🎉
