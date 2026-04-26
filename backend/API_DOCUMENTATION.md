# Booking App Backend - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 📋 AUTHENTICATION ENDPOINTS

### 1. Register
**POST** `/auth/register`

Register a new business owner account.

**Request Body:**
```json
{
  "name": "John Salon",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "John's Hair Salon",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon",
    "phone": "+1234567890"
  }
}
```

---

### 2. Login
**POST** `/auth/login`

Login with existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon"
  }
}
```

---

### 3. Get Profile
**GET** `/auth/me` (Protected)

Get current logged-in user profile.

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "60d5ec49c1234567890abcde",
    "name": "John Salon",
    "email": "john@example.com",
    "businessName": "John's Hair Salon",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "workingHours": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" }
    }
  }
}
```

---

### 4. Update Profile
**PUT** `/auth/update-profile` (Protected)

Update business owner profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "businessName": "John's Better Salon",
  "phone": "+9876543210",
  "address": "456 Oak Ave",
  "city": "Los Angeles",
  "businessDescription": "Premium hair salon"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "user": { /* updated user object */ }
}
```

---

## 🧴 SERVICE ENDPOINTS

### 1. Get All Services for Business
**GET** `/services/{businessId}`

Get all active services for a specific business (public endpoint for client).

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "businessId": "60d5ec49c1234567890abcaa",
      "name": "Haircut",
      "description": "Classic mens haircut",
      "price": 25,
      "duration": 30,
      "category": "hair",
      "image": "https://...",
      "isActive": true
    }
  ]
}
```

---

### 2. Get My Services
**GET** `/services/business/all` (Protected)

Get all services for authenticated business owner.

**Response (200):** Same as above

---

### 3. Create Service
**POST** `/services` (Protected)

Create a new service.

**Request Body:**
```json
{
  "name": "Haircut",
  "description": "Classic mens haircut",
  "price": 25,
  "duration": 30,
  "category": "hair"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "businessId": "60d5ec49c1234567890abcaa",
    "name": "Haircut",
    "price": 25,
    "duration": 30,
    "category": "hair",
    "isActive": true,
    "createdAt": "2024-04-19T10:30:00.000Z"
  }
}
```

---

### 4. Update Service
**PUT** `/services/{id}` (Protected)

Update an existing service.

**Request Body:**
```json
{
  "price": 30,
  "duration": 45
}
```

**Success Response (200):** Updated service object

---

### 5. Delete Service
**DELETE** `/services/{id}` (Protected)

Delete a service.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## 📅 APPOINTMENT ENDPOINTS

### 1. Get Available Time Slots
**GET** `/appointments/available-slots/{businessId}/{serviceId}/{date}`

Get available time slots for booking (public endpoint).

**Parameters:**
- `businessId`: Business ID
- `serviceId`: Service ID
- `date`: Date in ISO format (2024-04-20)

**Response (200):**
```json
{
  "success": true,
  "slots": [
    {
      "startTime": "09:00",
      "endTime": "09:30",
      "available": true
    },
    {
      "startTime": "10:00",
      "endTime": "10:30",
      "available": true
    }
  ],
  "serviceDuration": 30
}
```

---

### 2. Create Appointment (Client Booking)
**POST** `/appointments`

Book an appointment (public endpoint for clients).

**Request Body:**
```json
{
  "businessId": "60d5ec49c1234567890abcaa",
  "serviceId": "60d5ec49c1234567890abcde",
  "clientName": "Alice Johnson",
  "clientPhone": "+1111111111",
  "clientEmail": "alice@example.com",
  "appointmentDate": "2024-04-20",
  "startTime": "14:00"
}
```

**Success Response (201):**
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
    "status": "pending"
  }
}
```

**Error if slot is booked (400):**
```json
{
  "success": false,
  "message": "This time slot is already booked"
}
```

---

### 3. Get All Appointments
**GET** `/appointments` (Protected)

Get all appointments for business owner.

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "60d5ec49c1234567890abcff",
      "businessId": "60d5ec49c1234567890abcaa",
      "serviceId": {
        "_id": "60d5ec49c1234567890abcde",
        "name": "Haircut",
        "price": 25,
        "duration": 30
      },
      "clientName": "Alice Johnson",
      "appointmentDate": "2024-04-20T00:00:00.000Z",
      "startTime": "14:00",
      "endTime": "14:30",
      "status": "pending"
    }
  ]
}
```

---

### 4. Get Today's Appointments
**GET** `/appointments/business/today` (Protected)

Get appointments for today.

**Response (200):** Same structure as above, filtered for today only

---

### 5. Get Appointment Statistics
**GET** `/appointments/business/stats` (Protected)

Get appointment statistics for dashboard.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "completed": 15,
    "confirmed": 8,
    "pending": 2,
    "cancelled": 0
  }
}
```

---

### 6. Update Appointment Status
**PUT** `/appointments/{id}` (Protected)

Update appointment status (pending → confirmed → completed/cancelled).

**Request Body:**
```json
{
  "status": "confirmed"
}
```

Valid statuses: `pending`, `confirmed`, `completed`, `cancelled`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": { /* updated appointment */ }
}
```

---

### 7. Cancel Appointment
**DELETE** `/appointments/{id}` (Protected)

Cancel an appointment.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to update this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 500 Server Error
```json
{
  "message": "Something went wrong!",
  "error": "Error details"
}
```

---

## Example cURL Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Salon",
    "email": "john@example.com",
    "password": "password123",
    "businessName": "Johns Hair Salon"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Service (Protected)
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

### Get Available Slots
```bash
curl http://localhost:5000/api/appointments/available-slots/BUSINESS_ID/SERVICE_ID/2024-04-20
```

### Book Appointment
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "BUSINESS_ID",
    "serviceId": "SERVICE_ID",
    "clientName": "Alice",
    "clientPhone": "+1111111111",
    "appointmentDate": "2024-04-20",
    "startTime": "14:00"
  }'
```

---

## Next Steps
- Step 3: Generate Frontend Pages
- Step 4: Connect Frontend to Backend with Axios
