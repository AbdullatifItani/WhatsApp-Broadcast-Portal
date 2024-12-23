import { createSlice } from "@reduxjs/toolkit";

export const emptyUserState = {
  id: "",
  userName: "",
  name: "",
  role: "",
  isLoggedIn: false,
};

export const accountSlice = createSlice({
  name: "account",
  initialState: emptyUserState,
  reducers: {
    setLoggedInUser: (state, action) => {
      state.id = action.payload.id;
      state.userName = action.payload.userName;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isLoggedIn = true;
    },
    logoutUser: (state) => {
      state.id = "";
      state.userName = "";
      state.name = "";
      state.role = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setLoggedInUser, logoutUser } = accountSlice.actions;
export const accountReducer = accountSlice.reducer;
