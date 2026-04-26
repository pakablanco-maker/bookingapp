import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from './appointmentService';

const initialState = {
  appointments: [],
  todayAppointments: [],
  stats: null,
  availableSlots: [],
  loading: false,
  error: null,
};

// Async thunks
export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch appointments');
    }
  }
);

export const getTodayAppointments = createAsyncThunk(
  'appointments/getTodayAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getTodayAppointments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch today appointments');
    }
  }
);

export const getStats = createAsyncThunk(
  'appointments/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stats');
    }
  }
);

export const getAvailableSlots = createAsyncThunk(
  'appointments/getAvailableSlots',
  async ({ businessId, serviceId, date }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(
        businessId,
        serviceId,
        date
      );
      return response.slots;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch available slots');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create appointment');
    }
  }
);

export const updateStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update status');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel appointment');
    }
  }
);

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    resetAppointments: (state) => {
      state.appointments = [];
      state.todayAppointments = [];
      state.availableSlots = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Today Appointments
      .addCase(getTodayAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAppointments = action.payload;
      })
      .addCase(getTodayAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Stats
      .addCase(getStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Available Slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          (apt) => apt._id === action.payload._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = state.appointments.filter(
          (apt) => apt._id !== action.payload._id
        );
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAppointments, clearError } = appointmentSlice.actions;

export default appointmentSlice.reducer;
