import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayAppointments, getStats } from '../features/appointements/appointmentSlice';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import WhatsAppConnect from '../components/WhatsAppConnect';
import api from '../services/api';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, todayAppointments, loading } = useSelector((state) => state.appointments);
  const [restartLoading, setRestartLoading] = useState(false);
  const [restartMessage, setRestartMessage] = useState(null);
  const [whatsappStatus, setWhatsappStatus] = useState(null);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getTodayAppointments());
  }, [dispatch]);

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
        <h1>👋 Welcome, {user?.businessName || user?.name}!</h1>
        <p className="text-muted">Here's your business overview for today</p>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="text-muted">📊 Total Appointments</div>
            <div className="stat-number">{stats?.total || 0}</div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="text-muted">⏳ Pending</div>
            <div className="stat-number" style={{ color: '#f39c12' }}>
              {stats?.pending || 0}
            </div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="text-muted">✅ Confirmed</div>
            <div className="stat-number" style={{ color: '#3498db' }}>
              {stats?.confirmed || 0}
            </div>
          </div>
        </Col>

        <Col md={3} sm={6} className="mb-3">
          <div className="stat-card">
            <div className="text-muted">✨ Completed</div>
            <div className="stat-number" style={{ color: '#27ae60' }}>
              {stats?.completed || 0}
            </div>
          </div>
        </Col>
      </Row>

      {/* Booking Link Card */}
      {user?.slug && (
        <Row className="mb-4">
          <Col lg={8}>
            <div className="stat-card">
              <h5 className="mb-3">🔗 Your Booking Link</h5>
              <p className="text-muted mb-3">Share this link with your clients on WhatsApp, Instagram, and Facebook</p>
              
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={`${window.location.origin}/book/${user.slug}`}
                  readOnly
                />
                <button
                  className="btn btn-dark"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/book/${user.slug}`);
                    alert('✅ Link copied to clipboard!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
              
              <div className="mt-3">
                <small className="text-muted">
                  Example: <code>{`${window.location.origin}/book/${user.slug}`}</code>
                </small>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Today's Appointments */}
      <Row>
        <Col lg={8}>
          <div className="stat-card">
            <h4 className="mb-4">
              <FaCalendarAlt /> Today's Appointments ({todayAppointments.length})
            </h4>

            {todayAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No appointments today</p>
                <p className="text-muted small">You have a free day!</p>
              </div>
            ) : (
              <div>
                {todayAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="p-3 border rounded mb-2"
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{apt.clientName}</strong>
                        <div className="small text-muted">
                          {apt.serviceId?.name} • {apt.startTime} - {apt.endTime}
                        </div>
                      </div>
                      <div>
                        <span className={`badge badge-${apt.status}`}>
                          {apt.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>

        <Col lg={4}>
          <div className="stat-card">
            <h5 className="mb-4">📈 Quick Stats</h5>

            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span>Completion Rate</span>
                <strong>
                  {stats?.total > 0
                    ? Math.round((stats?.completed / stats?.total) * 100)
                    : 0}
                  %
                </strong>
              </div>
              <div
                className="progress"
                style={{ height: '8px' }}
              >
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{
                    width: `${stats?.total > 0 ? (stats?.completed / stats?.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <hr />

            <div className="mb-2 d-flex align-items-center">
              <FaClock className="me-2" style={{ color: '#f39c12' }} />
              <span className="text-muted">Pending: {stats?.pending}</span>
            </div>

            <div className="mb-2 d-flex align-items-center">
              <FaCheckCircle className="me-2" style={{ color: '#3498db' }} />
              <span className="text-muted">Confirmed: {stats?.confirmed}</span>
            </div>

            <div className="d-flex align-items-center">
              <FaTimesCircle className="me-2" style={{ color: '#e74c3c' }} />
              <span className="text-muted">Cancelled: {stats?.cancelled}</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* WhatsApp Connect Card */}
      <Row className="mb-4">
        <Col lg={8}>
          <div className="stat-card">
            <h5 className="mb-3">💬 Connect to WhatsApp</h5>
            <p className="text-muted mb-3">Connect your WhatsApp account to manage bookings</p>
            <WhatsAppConnect businessId={user?._id} onStatusChange={setWhatsappStatus} />

            {/* Force restart button (business only) - hidden when WhatsApp is connected */}
            {(user?.role === 'business' || user?.role === 'admin') && whatsappStatus !== 'connected' && (
              <div className="mt-3">
                <button
                  className="btn btn-outline-danger"
                  disabled={restartLoading}
                  onClick={async () => {
                    const ok = window.confirm('Confirmer : forcer la réinitialisation de la session WhatsApp ?');
                    if (!ok) return;
                    setRestartLoading(true);
                    setRestartMessage(null);
                    try {
                      const body = user?.role === 'admin' ? { businessId: user?._id } : {};
                      const res = await api.post('/whatsapp/admin/restart-session', body);
                      if (res?.data?.success) {
                        setRestartMessage({ type: 'success', text: res.data.message || 'Session réinitialisée.' });
                      } else {
                        setRestartMessage({ type: 'error', text: res?.data?.message || 'Échec serveur' });
                      }
                    } catch (err) {
                      console.error(err);
                      const serverMsg = err?.response?.data?.message || err?.message || 'Erreur lors de l\'appel';
                      setRestartMessage({ type: 'error', text: serverMsg });
                    } finally {
                      setRestartLoading(false);
                    }
                  }}
                >
                  {restartLoading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  )}
                  🔁 Réinitialiser WhatsApp
                </button>

                {restartMessage && (
                  <div className={`mt-2 text-${restartMessage.type === 'success' ? 'success' : 'danger'}`}>
                    {restartMessage.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
