import {configureStore} from '@reduxjs/toolkit';
import AuthSlice from './Slices/AuthSlice';
import UtilitySlice from './Slices/UtilitySlice';
export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    utility: UtilitySlice,
  },
});
