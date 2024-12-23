import { createSlice } from "@reduxjs/toolkit";

// Define the initial state for the settings
export const emptySettingsState = {
  id: null,
  senderName: "",
  senderEmail: "",
  senderAddress: "",
  productId: "",
  token: "",
  phoneId: "",
  phoneNumber: "",
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: emptySettingsState,
  reducers: {
    setSettings: (state, action) => {
      state.id = action.payload.id;
      state.senderName = action.payload.senderName;
      state.senderEmail = action.payload.senderEmail;
      state.senderAddress = action.payload.senderAddress;
      state.productId = action.payload.productId;
      state.token = action.payload.token;
      state.phoneId = action.payload.phoneId;
      state.phoneNumber = action.payload.phoneNumber;
    },
    clearSettings: (state) => {
      state.id = null;
      state.senderName = "";
      state.senderEmail = "";
      state.senderAddress = "";
      state.productId = "";
      state.token = "";
      state.phoneId = "";
      state.phoneNumber = "";
    },
  },
});

export const { setSettings, clearSettings } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

