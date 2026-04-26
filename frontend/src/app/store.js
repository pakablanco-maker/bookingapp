import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentReducer from '../features/appointements/appointmentSlice';
import servicesReducer from '../features/services/serviceSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
    services: servicesReducer,
  },
});