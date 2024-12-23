import { configureStore } from "@reduxjs/toolkit";
import { settingsReducer } from "./settingsSlice";
import { contactsReducer } from "./contactsSlice";
import { accountReducer } from "./accountSlice";
import { broadcastReducer } from "./broadcastSlice";
import { settingsApi, contactsApi, accountApi, broadcastApi, templatesApi } from "../../Apis";

const store = configureStore({
  reducer: {
    settingsStore: settingsReducer,
    contactsStore: contactsReducer,
    accountStore: accountReducer,
    broadcastStore: broadcastReducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [broadcastApi.reducerPath]: broadcastApi.reducer,
    [templatesApi.reducerPath]: templatesApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(settingsApi.middleware)
      .concat(contactsApi.middleware)
      .concat(accountApi.middleware)
      .concat(broadcastApi.middleware)
      .concat(templatesApi.middleware),
});

export default store;
