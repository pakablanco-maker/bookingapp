import React from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

const AppointmentCard = ({ appointment, onStatusChange, onCancel }) => {
  const getStatusBadge = (status) => {
    const badgeClass = `badge-status badge-${status}`;
    return <span className={badgeClass}>{status.toUpperCase()}</span>;
  };

  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className={`appointment-card ${appointment.status}`}>
      <Card.Body>
        <Row className="align-items-center">
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted mb-2">{appointment.serviceId?.name}</h6>
              <h5 className="mb-3">{appointment.clientName}</h5>

              <div className="mb-2">
                <strong>📅 Date:</strong> {formattedDate}
              </div>
              <div className="mb-2">
                <strong>🕐 Time:</strong> {appointment.startTime} - {appointment.endTime}
              </div>
              <div className="mb-2">
                <strong>📞 Phone:</strong> {appointment.clientPhone}
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="text-end">
              <div className="mb-3">
                <strong>Price:</strong> ${appointment.serviceId?.price}
              </div>
              <div className="mb-3">{getStatusBadge(appointment.status)}</div>

              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <div className="d-flex gap-2 justify-content-end">
                  {appointment.status === 'pending' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onStatusChange(appointment._id, 'confirmed')}
                    >
                      <FaCheck /> Confirm
                    </Button>
                  )}

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onCancel(appointment._id)}
                  >
                    <FaTimes /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;
