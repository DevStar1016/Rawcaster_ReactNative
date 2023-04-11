import {configureStore} from '@reduxjs/toolkit';
import AuthSlice from './Slices/AuthSlice';
import HomeSlice from './Slices/HomeSlice';
import NuggetActionsSlice from './Slices/NuggetActionsSlice';
import UtilitySlice from './Slices/UtilitySlice';
export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    utility: UtilitySlice,
    home: HomeSlice,
    nugget_actions: NuggetActionsSlice,
  },
});
