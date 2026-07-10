import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";
import { getTokenFromLocalStorage } from "../../utils/tokenUtil";
import { toast } from "react-toastify";


//fonction securiser pour recupérer l'utilisateur au demarage de l'application
const getInitialUser = () => {
  try {
    const token = getTokenFromLocalStorage();
    const storedUser = localStorage.getItem('user');

    //si la chaine est undefined ou null, on retourne null
    if (!token || !storedUser || storedUser === "undefined") {
      return null;
    }
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error getting initial user:', error);
    return null;
  }
};

const initialUser = getInitialUser();

const initialState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
  message:'',
};

// //restaure token and user from localStorage if available
// export const restoreAuth = createAsyncThunk(
//   "auth/restore",
//   async (_, thunkAPI) => {
//     try {
//         const token = getTokenFromLocalStorage();
//         const storedUser = JSON.parse(localStorage.getItem('user'));
//         if (token && storedUser) {
//             return { user: storedUser, token };
//         }
//         return { user: null, token: null };
//     }catch(error){
//         return thunkAPI.rejectWithValue(error.message || "Failed to restore auth");
//     }
//     }
// );

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
    async (credentials, thunkAPI) => {
    try {
      const response = await authService.login(credentials);
      toast.success('login successful');
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Login failed");
    }
    }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const response = await authService.register(data);
      toast.success('Registration successful');
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const response = await authService.getProfile();
      return response.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const response = await authService.updateProfile(data);
      return response.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update profile");
    }
    }
);

export const updateWorkingHours = createAsyncThunk(
  "auth/updateWorkingHours",
  async (workingHours, thunkAPI) => {
    try {
      const response = await authService.updateWorkingHours(workingHours);
      toast.success('Working hours updated successfully');
      return response.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update working hours");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.isAuthenticated = false;
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.info('Logged out successfully');
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.message = action.payload || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success= true;
        state.error= false;
        state.message= 'Registration successful';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload || 'Registration failed';
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Working Hours
      .addCase(updateWorkingHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkingHours.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(updateWorkingHours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;