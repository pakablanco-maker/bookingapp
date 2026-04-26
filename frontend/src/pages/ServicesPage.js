import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Modal, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getMyServices, createService, updateService, deleteService } from '../features/services/serviceSlice';
import ServiceCard from '../components/ServiceCard';
import { FaPlus } from 'react-icons/fa';

const ServicesPage = () => {
  const dispatch = useDispatch();
  const { myServices, loading, error } = useSelector((state) => state.services);
  const [localError, setLocalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'other',
  });

  useEffect(() => {
    dispatch(getMyServices());
  }, [dispatch]);

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingId(service._id);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        duration: service.duration,
        category: service.category || 'other',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: 'other',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (editingId) {
        await dispatch(updateService({ id: editingId, data: formData })).unwrap();
      } else {
        await dispatch(createService(formData)).unwrap();
      }

      handleCloseModal();
    } catch (err) {
      setLocalError(editingId ? 'Failed to update service' : 'Failed to create service');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await dispatch(deleteService(id)).unwrap();
      } catch (err) {
        setLocalError('Failed to delete service');
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>✂️ Services</h1>
          <p className="text-muted">Manage the services you offer</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaPlus /> Add Service
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {localError && <Alert variant="danger">{localError}</Alert>}

      {myServices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✂️</div>
          <h4>No services yet</h4>
          <p className="text-muted mb-3">Create your first service to start accepting bookings</p>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <FaPlus /> Create Service
          </Button>
        </div>
      ) : (
        <Row>
          {myServices.map((service) => (
            <Col md={6} key={service._id} className="mb-4">
              <ServiceCard
                service={service}
                onEdit={handleShowModal}
                onDelete={handleDelete}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Modal for Create/Edit Service */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Service Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="e.g., Haircut, Manicure"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Brief description of service"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price ($) *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (minutes) *</Form.Label>
              <Form.Control
                type="number"
                name="duration"
                placeholder="30"
                min="15"
                value={formData.duration}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="hair">Hair</option>
                <option value="beauty">Beauty</option>
                <option value="massage">Massage</option>
                <option value="coaching">Coaching</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ServicesPage;
