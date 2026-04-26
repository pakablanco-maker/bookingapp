import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaCut, FaCalendarAlt, FaUser } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar" style={{ width: '250px' }}>
      <h3 style={{ marginBottom: '30px', color: '#3498db' }}>
        📅 BookingApp
      </h3>

      <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
        <FaChartLine /> Dashboard
      </Link>

      <Link to="/services" className={`nav-link ${isActive('/services')}`}>
        <FaCut /> Services
      </Link>

      <Link to="/appointments" className={`nav-link ${isActive('/appointments')}`}>
        <FaCalendarAlt /> Appointments
      </Link>

      <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
        <FaUser /> Profile
      </Link>

      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #555' }}>
        <small style={{ color: '#95a5a6' }}>Business Management System</small>
      </div>
    </div>
  );
};

export default Sidebar;
