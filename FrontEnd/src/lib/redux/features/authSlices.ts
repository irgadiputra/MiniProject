import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define role type for the user
type StatusRole = 'customer' | 'organiser' | null;

export interface IUser {
  email: string;
  first_name: string;
  last_name: string;
  id: number;
  status_role: StatusRole;
  profile_pict: string;
  referal_code: string;
  point: number;
  is_verified: boolean
}

export interface IAuth {
  user: IUser;
  isLogin: boolean;
  token: string | null;  
}

const initialState: IAuth = {
  user: {
    email: '',
    first_name: '',
    last_name: '',
    id: 0,
    status_role: null,
    profile_pict: '',
    referal_code: '',
    point: 0,
    is_verified: false
  },
  isLogin: false,
  token: null,  // Initialize the token as null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login action to update the user and token
    onLogin: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
      state.user = action.payload.user;  // Store user information
      state.isLogin = true;  // User is logged in
      state.token = action.payload.token;  // Store the token (JWT)
      
      // Optionally store the token in localStorage for persistence
      localStorage.setItem('authToken', action.payload.token);
    },

    // Logout action to clear the user data and token
    onLogout: (state) => {
      state.user = initialState.user;
      state.isLogin = false;
      state.token = null;  // Clear the token
      localStorage.removeItem('authToken');  // Remove the token from localStorage
    },

    // Update the token (e.g., for refreshing the token)
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;  // Update the token
      localStorage.setItem('authToken', action.payload);  // Persist the token
    }
  },
});

export const { onLogin, onLogout, updateToken } = authSlice.actions;

export default authSlice.reducer;
