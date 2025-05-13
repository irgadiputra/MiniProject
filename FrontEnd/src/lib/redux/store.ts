import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlices";
import eventSlice from "./features/eventSlices"

export function makeStore () {
  return configureStore({
    reducer: {
      auth: authSlice,
      event: eventSlice,
    }, 
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];