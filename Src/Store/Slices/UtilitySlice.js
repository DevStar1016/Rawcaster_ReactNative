import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  insets: {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
  },
  locationDetails: null,
  isBottomTabBarAbsolute: false,
  nugget_type: 1, // 1 - video, 2 - audio
  bottomHomeButtonType: 1, //1 - video or other_nuggets, 2 - rawcaster Logo
  isVisibleInfluencers: false,
  isAppForeground: true,
  isOpenLoginAlert: false,
  isOpenVerifyPopup: false,
  globalLoaderData: {
    status: false,
    text: '',
  },
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
    setBottomHomeButtonType: (state, action) => {
      state.bottomHomeButtonType = action.payload;
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
    setGlobalLoaderData: (state, action) => {
      state.globalLoaderData = {
        status: action.payload.status ?? false,
        text: action.payload.text ?? '',
      };
    },

    setTabNuggetType: (state, action) => {
      if (action.payload.tab_type) {
        if (action.payload.tab_type !== state.bottomHomeButtonType) {
          state.bottomHomeButtonType = action.payload.tab_type;
        }
      }
      if (action.payload.nugget_type) {
        if (action.payload.nugget_type !== state.nugget_type) {
          state.nugget_type = action.payload.nugget_type;
        }
      }
    },
  },
});
export const {
  setInsets,
  setLocationDetails,
  setIsBottomTabBarAbsolute,
  setNuggetType,
  setTabNuggetType,
  setBottomHomeButtonType,
  setIsVisibleInfluencers,
  setIsAppForeground,
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
  setGlobalLoaderData,
} = UtilitySlice.actions;
export default UtilitySlice.reducer;
