# Booking App Frontend - React + Bootstrap 5

Modern, user-friendly booking application frontend built with React and Bootstrap.

## Frontend Features

- **Authentication Pages** - Login & Register with JWT
- **Dashboard** - View statistics and today's appointments
- **Services Management** - Create, edit, delete services
- **Appointments Management** - Manage all bookings
- **Public Booking Page** - Beautiful calendar interface for clients
- **Profile Management** - Update business information
- **Responsive Design** - Works on desktop, tablet, and mobile

## Frontend Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/           # Reusable components
│   │   ├── Navbar.js        # Top navigation bar
│   │   ├── Sidebar.js       # Left sidebar menu
│   │   ├── ServiceCard.js   # Service display card
│   │   └── AppointmentCard.js # Appointment display card
│   ├── context/             # Auth context
│   │   ├── AuthContext.js   # Authentication state management
│   │   └── ProtectedRoute.js # Route protection
│   ├── pages/               # Page components
│   │   ├── LoginPage.js     # Login page
│   │   ├── RegisterPage.js  # Registration page
│   │   ├── DashboardPage.js # Business dashboard
│   │   ├── ServicesPage.js  # Services management
│   │   ├── AppointmentsPage.js # Appointments management
│   │   ├── BookingPage.js   # Public booking interface
│   │   └── ProfilePage.js   # Business profile
│   ├── services/
│   │   └── api.js          # Axios API client
│   ├── styles/
│   │   └── global.css      # Global styles
│   ├── App.js              # Main app component
│   └── index.js            # React entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm or yarn

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `frontend/` folder (copy from `.env.example`):

```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm start
```

Frontend will run on: `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Pages Overview

### 🔐 Authentication Pages

#### Login (`/login`)
- Email & password login
- Link to register page
- JWT token management

#### Register (`/register`)
- Create new business account
- Collect business name & phone
- Password confirmation
- Link to login page

### 📊 Dashboard (`/dashboard`)
- **Statistics Cards**:
  - Total appointments
  - Pending appointments
  - Confirmed appointments
  - Completed appointments
- **Today's Appointments** - List of all appointments for today
- **Quick Stats** - Completion rate and breakdown

### 🧴 Services (`/services`)
- View all services
- Create new service
- Edit service details
- Delete services
- Service cards showing price & duration

### 📅 Appointments (`/appointments`)
- View all appointments
- Filter by status (all, pending, confirmed, completed, cancelled)
- Update appointment status
- Cancel appointments
- Client information display

### 📱 Public Booking Page (`/booking/:businessId`)
**3-Step Booking Process (Optimized for non-technical users):**

**Step 1: Service Selection**
- Browse all available services
- See price and duration
- Click to select service

**Step 2: Date & Time Selection**
- **Calendar Grid** - Visual monthly calendar
- Next 30 days available
- Shows service duration and availability
- Time slots displayed in 30-min intervals
- Visual feedback for selected date/time

**Step 3: Client Details**
- Enter name (required)
- Enter phone (required)
- Enter email (optional)
- Review booking summary
- Confirm booking

### 👤 Profile (`/profile`)
- Update business name
- Update business description
- Update phone & address
- View account creation date

## Components

### Navbar Component
- Displays business name
- User dropdown menu
- Profile & logout links
- Sticky positioning

### Sidebar Component
- Navigation menu
- Active page highlight
- Dashboard, Services, Appointments, Profile links

### ServiceCard Component
- Service name, description
- Price and duration
- Edit & delete buttons

### AppointmentCard Component
- Client information
- Date, time, service
- Status badge
- Action buttons (confirm, cancel)

## Styling & Design

### Color Scheme
- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Dark Purple)
- **Success**: #27ae60 (Green)
- **Warning**: #f39c12 (Orange)
- **Danger**: #e74c3c (Red)
- **Background**: #f8f9fa (Light Gray)

### Key CSS Classes
- `.navbar-branded` - Gradient navbar
- `.sidebar` - Left sidebar
- `.stat-card` - Statistics card with hover effect
- `.service-card` - Service display card
- `.appointment-card` - Appointment display (with status variants)
- `.calendar-grid` - Calendar day buttons
- `.time-slot` - Time slot buttons
- `.badge-status` - Status badges for appointments
- `.auth-container` - Full-screen auth layout
- `.auth-form` - Auth form card
- `.empty-state` - Empty state display

## API Integration

The frontend uses Axios for API calls with automatic JWT token injection:

```javascript
// All requests automatically include:
// Authorization: Bearer {token}
```

**Main API Endpoints Used:**
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `GET /auth/me` - Get profile
- `PUT /auth/update-profile` - Update profile
- `GET /services/:businessId` - Get services
- `GET /services/business/all` - Get own services
- `POST /services` - Create service
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service
- `GET /appointments` - Get appointments
- `GET /appointments/business/today` - Today's appointments
- `GET /appointments/business/stats` - Statistics
- `GET /appointments/available-slots/:businessId/:serviceId/:date` - Available times
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update status
- `DELETE /appointments/:id` - Cancel appointment

See `API_DOCUMENTATION.md` in backend for full API details.

## State Management

### Context API - AuthContext
Manages:
- User authentication state
- JWT token
- User profile
- Login/Register/Logout functions
- Loading & error states

### Component State
- Service forms
- Appointment filters
- Booking wizard steps
- Form inputs

## Mobile Responsive

The app is fully responsive:
- Mobile: Single column layout, collapsible sidebar
- Tablet: 2-column layouts where appropriate
- Desktop: Full multi-column layouts

## Performance Optimizations

- Lazy loading calendar dates
- Efficient re-renders
- Optimized form handling
- Image optimization

## Future Enhancements

- Email notifications
- SMS reminders
- Payment integration
- Google Calendar sync
- Business analytics
- Customer reviews
- Video consultation support

## Troubleshooting

### API Connection Issues
1. Ensure backend is running on `http://localhost:5000`
2. Check `.env` file has correct API URL
3. Check CORS is enabled in backend

### Login Not Working
1. Verify backend is running
2. Check MongoDB connection
3. Clear browser localStorage
4. Check browser console for errors

### Services Not Loading
1. Ensure you have created services
2. Check businessId in URL (for booking page)
3. Check API response in network tab

## Technologies Used

- **React 18** - UI library
- **React Router v6** - Navigation
- **Bootstrap 5** - Styling framework
- **React Bootstrap** - Bootstrap components
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **React Icons** - Icon library

## Getting Help

Check the backend README for API documentation and setup instructions.

## Next Steps

- Step 4: Connect Frontend to Backend with full testing
- Deploy to production (Netlify/Vercel for frontend, Heroku/AWS for backend)
