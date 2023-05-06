import {createSlice} from '@reduxjs/toolkit';
import {COLORS} from '../../Utilities/Colors';

export const initialState = {
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
  isOpenVerifyPopup: false,
};

const UtilitySlice = createSlice({
  name: 'UtilitySlice',
  initialState,
  reducers: {
    setInsets: (state, action) => {
      state.insets = action.payload;
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
    setIsOpenVerifyPopup: (state, action) => {
      state.isOpenVerifyPopup = action.payload;
    },
    clearUtilityReduxData: (state, action) => {
      state.insets = {
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
      };
      state.locationDetails = null;
      state.isBottomTabBarAbsolute = false;
      state.nugget_type = 1;
      state.isVisibleInfluencers = false;
      state.isAppForeground = true;
      state.isOpenLoginAlert = false;
      state.isOpenVerifyPopup = false;
    },
  },
});
export const {
  setInsets,
  setLocationDetails,
  setIsBottomTabBarAbsolute,
  setNuggetType,
  setIsVisibleInfluencers,
  setIsAppForeground,
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
  clearUtilityReduxData,
} = UtilitySlice.actions;
export default UtilitySlice.reducer;
