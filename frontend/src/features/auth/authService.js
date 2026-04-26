import api from '../../services/api';
import { getCurrentUser, saveUserToLocalStorage, clearUserFromLocalStorage } from '../../utils/tokenUtil';

const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if(response.data){
        //extrire les donnés correctement
        const {token} = response.data;
        const userWithToken = { ...response.data.user, token };
        saveUserToLocalStorage(userWithToken);
        return userWithToken;
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    if(response.data){
        //extrire les donnés correctement
        const {token} = response.data;
        const userWithToken = { ...response.data.user, token };
        saveUserToLocalStorage(userWithToken);
        return userWithToken;
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const getProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const updateProfile = async (data) => {
  try {
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const updateWorkingHours = async (workingHours) => {
  try {
    const response = await api.put('/auth/working-hours', { workingHours });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

const authService = {
  login,
  register,
  getProfile,
  updateProfile,
  updateWorkingHours
};

export default authService;