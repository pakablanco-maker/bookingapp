import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ServiceCard = ({ service, onEdit, onDelete }) => {
  return (
    <Card className="service-card h-100">
      <Card.Body>
        <Row className="align-items-start">
          <Col>
            <Card.Title className="mb-2">{service.name}</Card.Title>
            {service.description && (
              <Card.Text className="text-muted small mb-3">{service.description}</Card.Text>
            )}

            <div className="mb-3">
              <div className="mb-2">
                <strong>💰 Price:</strong> ${service.price}
              </div>
              <div>
                <strong>⏱️ Duration:</strong> {service.duration} minutes
              </div>
            </div>

            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => onEdit(service)}
              >
                <FaEdit /> Edit
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(service._id)}
              >
                <FaTrash /> Delete
              </Button>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ServiceCard;
