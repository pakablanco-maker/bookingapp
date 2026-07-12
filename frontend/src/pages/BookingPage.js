import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { createAppointment, getAvailableSlots } from '../features/appointements/appointmentSlice';
import { addDays, format, isToday, isBefore, startOfDay } from 'date-fns';

const apiBaseUrl = 'http://localhost:5000/api';

const BookingPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { availableSlots } = useSelector(
    (state) => state.appointments
  );
  

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [clientInfo, setClientInfo] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i));

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/auth/public/${slug}`);
      setBusiness(response.data.business);
      setServices(response.data.services);
      setError('');
    } catch (err) {
      setError('Business not found. Please check the booking link.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [slug]);


  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep(2);
  };

  const handleDateSelect = async (date) => {
    if (isBefore(date, startOfDay(new Date()))) {
      setError('Please select today or a future date');
      return;
    }

    setSelectedDate(date);
    setSelectedTime(null);
    await fetchAvailableSlots(date);
  };

  const fetchAvailableSlots = async (date) => {
    try {
      setSlotsLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      // Fetch available slots directly from API (public route)
      await axios.get(
        `${apiBaseUrl}/appointments/available-slots/${business._id}/${selectedService._id}/${dateStr}`
      );
      // Dispatch to Redux or just manage locally
      dispatch(getAvailableSlots({ 
        businessId: business._id, 
        serviceId: selectedService._id, 
        date: dateStr 
      }));
      setError('');
    } catch (err) {
      setError('Failed to load available times. Please try another date.');
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
  };

  const handleClientInfoChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!clientInfo.clientName || !clientInfo.clientPhone) {
      setError('Please enter your name and phone number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await dispatch(
        createAppointment({
          businessId: business._id,
          serviceId: selectedService._id,
          clientName: clientInfo.clientName,
          clientPhone: clientInfo.clientPhone,
          clientEmail: clientInfo.clientEmail || undefined,
          appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime.startTime,
        })
      ).unwrap();

      setSuccess('✅ Appointment booked successfully! You will receive a confirmation soon.');
      setBookingStep(1);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setClientInfo({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err || 'Failed to book appointment. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="loading-spinner">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingTop: '30px', paddingBottom: '30px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body className="p-4">
                <h2 className="mb-1">📅 Book Your Appointment</h2>
                <p className="text-muted mb-4">Easy and quick booking in 3 steps</p>

                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {/* Step Indicator */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-3">
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: bookingStep >= 1 ? '#667eea' : '#ddd',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontWeight: 'bold',
                        }}
                      >
                        1
                      </div>
                      <small className="d-block mt-2">Service</small>
                    </div>
                    <div style={{ flex: 1, margin: '15px 10px', background: bookingStep >= 2 ? '#667eea' : '#ddd', height: '2px' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: bookingStep >= 2 ? '#667eea' : '#ddd',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontWeight: 'bold',
                        }}
                      >
                        2
                      </div>
                      <small className="d-block mt-2">Date & Time</small>
                    </div>
                    <div style={{ flex: 1, margin: '15px 10px', background: bookingStep >= 3 ? '#667eea' : '#ddd', height: '2px' }}></div>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: bookingStep >= 3 ? '#667eea' : '#ddd',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontWeight: 'bold',
                        }}
                      >
                        3
                      </div>
                      <small className="d-block mt-2">Details</small>
                    </div>
                  </div>
                </div>

                {/* Step 1: Service Selection */}
                {bookingStep === 1 && (
                  <div>
                    <h4 className="mb-3">🧴 Select a Service</h4>

                    {services.length === 0 ? (
                      <Alert variant="info">No services available at the moment</Alert>
                    ) : (
                      <div>
                        {services.map((service) => (
                          <Card
                            key={service._id}
                            className="mb-2 cursor-pointer"
                            onClick={() => handleServiceSelect(service)}
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
                          >
                            <Card.Body className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1">{service.name}</h5>
                                <p className="text-muted mb-0 small">{service.description}</p>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div className="fw-bold" style={{ color: '#667eea' }}>${service.price}</div>
                                <small className="text-muted">{service.duration} min</small>
                              </div>
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Date & Time Selection */}
                {bookingStep === 2 && selectedService && (
                  <div>
                    <Button
                      variant="light"
                      onClick={() => setBookingStep(1)}
                      className="mb-3"
                    >
                      ← Back
                    </Button>

                    <h4 className="mb-3">📅 Select Date & Time</h4>
                    <p className="text-muted mb-3">
                      Service: <strong>{selectedService.name}</strong> ({selectedService.duration} min)
                    </p>

                    {/* Calendar Grid */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Choose a date:</h6>
                      <div className="calendar-grid">
                        {availableDates.map((date) => (
                          <button
                            key={date.getTime()}
                            className={`calendar-day ${
                              selectedDate?.getTime() === date.getTime() ? 'selected' : ''
                            }`}
                            onClick={() => handleDateSelect(date)}
                            disabled={isBefore(date, startOfDay(new Date())) && !isToday(date)}
                          >
                            <div className="fw-bold">{format(date, 'd')}</div>
                            <small>{format(date, 'EEE')}</small>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Slots */}
                    {selectedDate && (
                      <div>
                        <h6 className="text-muted mb-3">
                          Choose a time for {format(selectedDate, 'MMMM d, yyyy')}:
                        </h6>

                        {slotsLoading ? (
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spinner animation="border" size="sm" />
                          </div>
                        ) : availableSlots.length === 0 ? (
                          <Alert variant="warning">
                            No available time slots for this date. Please choose another date.
                          </Alert>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {availableSlots.map((slot) => (
                              <button
                                key={slot.startTime}
                                className={`time-slot ${selectedTime?.startTime === slot.startTime ? 'selected' : ''}`}
                                onClick={() => handleTimeSelect(slot)}
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedTime && (
                          <Button
                            variant="primary"
                            className="mt-4 w-100"
                            onClick={() => setBookingStep(3)}
                          >
                            Next: Your Details
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Client Details */}
                {bookingStep === 3 && selectedService && selectedDate && selectedTime && (
                  <Form onSubmit={handleBooking}>
                    <Button
                      variant="light"
                      onClick={() => setBookingStep(2)}
                      className="mb-3"
                    >
                      ← Back
                    </Button>

                    <h4 className="mb-3">👤 Your Details</h4>

                    <Card className="mb-4" style={{ background: '#f0f4ff' }}>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Service:</strong> {selectedService.name}
                            </div>
                            <div className="mb-2">
                              <strong>Price:</strong> ${selectedService.price}
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-2">
                              <strong>Date:</strong> {format(selectedDate, 'MMMM d, yyyy')}
                            </div>
                            <div className="mb-2">
                              <strong>Time:</strong> {selectedTime.startTime}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Form.Group className="mb-3">
                      <Form.Label>👤 Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="clientName"
                        placeholder="Your name"
                        value={clientInfo.clientName}
                        onChange={handleClientInfoChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>📞 Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="clientPhone"
                        placeholder="+1 (555) 123-4567"
                        value={clientInfo.clientPhone}
                        onChange={handleClientInfoChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>📧 Email (optional)</Form.Label>
                      <Form.Control
                        type="email"
                        name="clientEmail"
                        placeholder="your@email.com"
                        value={clientInfo.clientEmail}
                        onChange={handleClientInfoChange}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={submitting}
                      size="lg"
                    >
                      {submitting ? 'Booking...' : '✓ Confirm Booking'}
                    </Button>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BookingPage;
