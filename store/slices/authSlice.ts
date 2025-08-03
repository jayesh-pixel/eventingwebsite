import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  vY4?: string | null; // mobile number
  xA1?: string | null; // customer id
  zX9?: string | null; // customer exists
  pT5?: string | null; // token
  nQ2?: string | null; // isNewCustomer
  jL3?: string | null; // isLoggedIn
}

const initialState: AuthState = {};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMobileNumber: (state, action: PayloadAction<string>) => {
      state.vY4 = action.payload;
    },
    setAuthDetails: (state, action: PayloadAction<{ cust_id: string; customer_exists: string }>) => {
      state.xA1 = action.payload.cust_id;
      state.zX9 = action.payload.customer_exists;
    },
    setIsNewCustomer: (state, action: PayloadAction<string | null>) => {
      state.nQ2 = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.pT5 = action.payload;
    },
    loggedInSucces: (state, action: PayloadAction<string>) => {
      state.jL3 = action.payload;
    },
    resetState: (state) => {
      state.vY4 = null;
      state.xA1 = null;
      state.zX9 = null;
      state.pT5 = null;
      state.nQ2 = null;
      state.jL3 = null;
    },
  },
});

export const {
  setMobileNumber,
  setAuthDetails,
  setIsNewCustomer,
  setToken,
  loggedInSucces,
  resetState,
} = authSlice.actions;

export default authSlice.reducer;
