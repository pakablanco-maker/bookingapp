import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/book/:slug" element={<BookingPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="d-flex">
                  <Sidebar />
                  <div style={{ flex: 1 }}>
                    <Navbar />
                    <div className="container-fluid p-4">
                      <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
