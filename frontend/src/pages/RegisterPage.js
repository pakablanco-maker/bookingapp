import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert } from 'react-bootstrap';
import { register } from '../features/auth/authSlice';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const { loading, error: authError } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await dispatch(
        register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          phone: formData.phone,
        })
      ).unwrap();

      if (result) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>✨ Create Account</h2>
        <p className="text-muted text-center mb-4">Start managing your bookings</p>

        {error && <Alert variant="danger">{error}</Alert>}
        {authError && <Alert variant="danger">{authError}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>👤 Full Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📧 Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="your@email.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🏢 Business Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your salon/business name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📞 Phone Number</Form.Label>
            <Form.Control
              type="tel"
              placeholder="+1 (555) 123-4567"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🔒 Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="At least 6 characters"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>🔒 Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#667eea' }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
