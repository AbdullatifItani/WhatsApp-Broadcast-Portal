import { createSlice } from "@reduxjs/toolkit";

const emptyContactsState = {
  contacts: [],
};

export const contactsSlice = createSlice({
  name: "contacts",
  initialState: emptyContactsState,
  reducers: {
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    addContact: (state, action) => {
      state.contacts.push(action.payload);
    },
    updateContact: (state, action) => {
      const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
    deleteContact: (state, action) => {
      state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
    },
  },
});

export const { setContacts, addContact, updateContact, deleteContact } = contactsSlice.actions;
export const contactsReducer = contactsSlice.reducer;
