import api from '../../services/api';

const getAppointments = async () => {
  try {
    const response = await api.get('/appointments');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const getTodayAppointments = async () => {
  try {
    const response = await api.get('/appointments/business/today');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const getStats = async () => {
  try {
    const response = await api.get('/appointments/business/stats');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const getAvailableSlots = async (businessId, serviceId, date) => {
  try {
    const response = await api.get(
      `/appointments/available-slots/${businessId}/${serviceId}/${date}`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const createAppointment = async (data) => {
  try {
    const response = await api.post('/appointments', data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const updateStatus = async (id, status) => {
  try {
    const response = await api.put(`/appointments/${id}`, { status });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const cancelAppointment = async (id) => {
  try {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const appointmentService = {
  getAppointments,
  getTodayAppointments,
  getStats,
  getAvailableSlots,
  createAppointment,
  updateStatus,
  cancelAppointment,
};

export default appointmentService;
