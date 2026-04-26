import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAppointments, updateStatus, cancelAppointment } from '../features/appointements/appointmentSlice';
import AppointmentCard from '../components/AppointmentCard';
import { FaFilter } from 'react-icons/fa';

const AppointmentsPage = () => {
  const dispatch = useDispatch();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(getAppointments());
  }, [dispatch]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter]);

  const filterAppointments = () => {
    if (statusFilter === 'all') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(
        appointments.filter((apt) => apt.status === statusFilter)
      );
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateStatus({ id, status })).unwrap();
    } catch (err) {
      setLocalError('Failed to update appointment');
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await dispatch(cancelAppointment(id)).unwrap();
      } catch (err) {
        setLocalError('Failed to cancel appointment');
        console.error(err);
      }
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
    <Container fluid>
      <div className="mb-4">
        <h1>📅 Appointments</h1>
        <p className="text-muted">Manage all your bookings and appointments</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {localError && <Alert variant="danger">{localError}</Alert>}

      {/* Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <FaFilter /> Filter by Status
            </Form.Label>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Appointments</option>
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="completed">✨ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h4>No appointments</h4>
          <p className="text-muted">
            {statusFilter === 'all'
              ? 'You have no appointments yet'
              : `No ${statusFilter} appointments`}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-muted mb-4">
            Found {filteredAppointments.length} appointment(s)
          </p>
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </Container>
  );
};

export default AppointmentsPage;
