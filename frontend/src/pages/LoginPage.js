import React, { useEffect } from 'react'; // Utilise useEffect ici
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Alert } from 'react-bootstrap';
import { login } from '../features/auth/authSlice';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, success } = useSelector((state) => state.auth);

  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      dispatch(login(values));
    }
  });

  // Utilisation correcte de useEffect pour la redirection
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>🔐 Login</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>📧 Email Address</Form.Label>
            <Form.Control
              type="email"
              name="email" // 👈 AJOUTÉ : Indispensable pour Formik
              placeholder="Enter your email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur} // Bonne pratique
              isInvalid={formik.touched.email && !!formik.errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🔒 Password</Form.Label>
            <Form.Control
              type="password"
              name="password" // 👈 AJOUTÉ : Indispensable pour Formik
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={formik.touched.password && !!formik.errors.password}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.password}
            </Form.Control.Feedback>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>

        <p className="mt-3 text-center">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#667eea' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;