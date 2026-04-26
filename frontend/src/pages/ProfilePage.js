import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updateWorkingHours } from '../features/auth/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    phone: '',
    address: '',
    city: '',
    businessDescription: '',
  });
  const [workingHours, setWorkingHours] = useState({
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '', end: '' },
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [successWorkingHours, setSuccessWorkingHours] = useState('');
  const [errorWorkingHours, setErrorWorkingHours] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        businessName: user?.businessName || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        businessDescription: user?.businessDescription || '',
      });
      
      if (user?.workingHours) {
        setWorkingHours(user.workingHours);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours({
      ...workingHours,
      [day]: {
        ...workingHours[day],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    }
  };

  const handleWorkingHoursSubmit = async (e) => {
    e.preventDefault();
    setSuccessWorkingHours('');
    setErrorWorkingHours('');

    try {
      await dispatch(updateWorkingHours(workingHours)).unwrap();
      setSuccessWorkingHours('Working hours updated successfully!');
      setTimeout(() => setSuccessWorkingHours(''), 3000);
    } catch (err) {
      setErrorWorkingHours('Failed to update working hours');
      console.error(err);
    }
  };

  return (
    <Container>
      <div className="mb-4">
        <h1>👤 Business Profile</h1>
        <p className="text-muted">Manage your business information</p>
      </div>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="stat-card" style={{ maxWidth: '600px' }}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>👤 Full Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>🏢 Business Name</Form.Label>
            <Form.Control
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📝 Business Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="businessDescription"
              placeholder="Tell clients about your business"
              value={formData.businessDescription}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📞 Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>📍 Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              placeholder="Street address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>🏙️ City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : ''}
            Save Changes
          </Button>
        </Form>
      </div>

      <div className="stat-card mt-4" style={{ maxWidth: '600px' }}>
        <h5 className="mb-3">📊 Business Info</h5>
        <div className="mb-2">
          <strong>Email:</strong> {user?.email}
        </div>
        <div className="mb-2">
          <strong>Slug:</strong> {user?.slug || 'N/A'}
        </div>
        <div className="mb-2">
          <strong>Member Since:</strong>{' '}
          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      {/* Working Hours Section */}
      <div className="stat-card mt-4" style={{ maxWidth: '700px' }}>
        <h5 className="mb-4">🕐 Working Hours</h5>

        {successWorkingHours && <Alert variant="success">{successWorkingHours}</Alert>}
        {errorWorkingHours && <Alert variant="danger">{errorWorkingHours}</Alert>}

        <Form onSubmit={handleWorkingHoursSubmit}>
          {Object.keys(workingHours).map((day) => (
            <Row key={day} className="mb-3" xs={1} sm={2} lg={3}>
              <Col>
                <Form.Label style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                  {day}
                </Form.Label>
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={workingHours[day].start || ''}
                  onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                  placeholder="Start time"
                />
              </Col>
              <Col>
                <Form.Control
                  type="time"
                  value={workingHours[day].end || ''}
                  onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                  placeholder="End time"
                />
              </Col>
            </Row>
          ))}

          <Button
            variant="success"
            type="submit"
            disabled={loading}
            className="w-100 mt-3"
          >
            {loading ? <Spinner size="sm" className="me-2" /> : ''}
            Save Working Hours
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default ProfilePage;
