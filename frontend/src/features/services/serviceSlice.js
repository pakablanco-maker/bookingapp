import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import servicesService from './servicesService';

const initialState = {
  services: [],
  myServices: [],
  loading: false,
  error: null,
};

// Async thunks
export const getServices = createAsyncThunk(
  'services/getServices',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await servicesService.getServices(businessId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
  }
);

export const getMyServices = createAsyncThunk(
  'services/getMyServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await servicesService.getMyServices();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch my services');
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (data, { rejectWithValue }) => {
    try {
      const response = await servicesService.createService(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await servicesService.updateService(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      const response = await servicesService.deleteService(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete service');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    resetServices: (state) => {
      state.services = [];
      state.myServices = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Services
      .addCase(getServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(getServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Services
      .addCase(getMyServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyServices.fulfilled, (state, action) => {
        state.loading = false;
        state.myServices = action.payload;
      })
      .addCase(getMyServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Service
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.myServices.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.myServices.findIndex(
          (svc) => svc._id === action.payload._id
        );
        if (index !== -1) {
          state.myServices[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.myServices = state.myServices.filter(
          (svc) => svc._id !== action.payload
        );
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetServices, clearError } = serviceSlice.actions;

export default serviceSlice.reducer;
