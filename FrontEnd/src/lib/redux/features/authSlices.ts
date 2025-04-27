import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface IUser {
  email: string;
  firstname: string;
  lastname: string;
}

export interface IAuth {
  user: IUser;
  isLogin: boolean;
}

const initialState: IAuth = {
  user: {
    email: "",
    firstname: "",
    lastname: ""
  },
  isLogin: false
} 

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    onLogin: (state: IAuth, action: PayloadAction<IAuth>) => {
      state.user = action.payload.user
      state.isLogin = true;
    },
    onLogout: (state: IAuth) => {
      state.user = { email: '', firstname: '', lastname: ''}
      state.isLogin = false;
    }
  }
})
  

export const { onLogin, onLogout } = authSlice.actions;

export default authSlice.reducer