import { createSlice } from "@reduxjs/toolkit";

const emptyBroadcastState = {
  selectedContacts: [],
  message: "",
};

export const broadcastSlice = createSlice({
  name: "broadcast",
  initialState: emptyBroadcastState,
  reducers: {
    setSelectedContacts: (state, action) => {
      state.selectedContacts = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearBroadcast: (state) => {
      state.selectedContacts = [];
      state.message = "";
    },
  },
});

export const { setSelectedContacts, setMessage, clearBroadcast } = broadcastSlice.actions;
export const broadcastReducer = broadcastSlice.reducer;
