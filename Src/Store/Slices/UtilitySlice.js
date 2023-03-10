import {createSlice} from '@reduxjs/toolkit';
import {COLORS} from '../../Utilities/Colors';

export const initialState = {
  isGlobalLoading: false,
  insets: {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
  },
  locationDetails: null,
  isBottomTabBarAbsolute: false,
  nugget_type: 1,
  isVisibleInfluencers: false,
  isAppForeground: true,
  isOpenLoginAlert: false,
};

const UtilitySlice = createSlice({
  name: 'UtilitySlice',
  initialState,
  reducers: {
    setInsets: (state, action) => {
      state.insets = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.isGlobalLoading = action.payload;
    },
    setLocationDetails: (state, action) => {
      state.locationDetails = action.payload;
    },
    setIsBottomTabBarAbsolute: (state, action) => {
      state.isBottomTabBarAbsolute = action.payload;
    },
    setNuggetType: (state, action) => {
      state.nugget_type = action.payload;
    },
    setIsVisibleInfluencers: (state, action) => {
      state.isVisibleInfluencers = action.payload;
    },
    setIsAppForeground: (state, action) => {
      state.isAppForeground = action.payload;
    },
    setIsOpenLoginAlert: (state, action) => {
      state.isOpenLoginAlert = action.payload;
    },
  },
});
export const {
  setInsets,
  setGlobalLoading,
  setLocationDetails,
  setIsBottomTabBarAbsolute,
  setNuggetType,
  setIsVisibleInfluencers,
  setIsAppForeground,
  setIsOpenLoginAlert,
} = UtilitySlice.actions;
export default UtilitySlice.reducer;
