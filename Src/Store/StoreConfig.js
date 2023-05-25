import {configureStore} from '@reduxjs/toolkit';
import AuthSlice from './Slices/AuthSlice';
import HomeSlice from './Slices/HomeSlice';
import NuggetActionsSlice from './Slices/NuggetActionsSlice';
import UtilitySlice from './Slices/UtilitySlice';
import NuggetsListSlice from './Slices/NuggetsListSlice';
export const store = configureStore({
  reducer: {
    auth: AuthSlice,
    utility: UtilitySlice,
    home: HomeSlice,
    nugget_actions: NuggetActionsSlice,
    nugget_list_data: NuggetsListSlice,
  },
});
