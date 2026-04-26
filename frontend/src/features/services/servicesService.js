import api from '../../services/api';

const getServices = async (businessId) => {
  try {
    const response = await api.get('/all');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const getMyServices = async () => {
  try {
    const response = await api.get('/services/myservices');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const createService = async (data) => {
  try {
    const response = await api.post('/services', data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const updateService = async (id, data) => {
  try {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const deleteService = async (id) => {
  try {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const servicesService = {
  getServices,
  getMyServices,
  createService,
  updateService,
  deleteService,
};

export default servicesService;
