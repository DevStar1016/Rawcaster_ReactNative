import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  token: null,
  userData: null,
  profile: null,
  settings: null,
};

const AuthSlice = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setMyProfile: (state, action) => {
      state.profile = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    clearAuthReduxData: (state, action) => {
      state.token = null;
      state.profile = null;
      state.settings = null;
      state.userData = null;
    },
  },
});
export const {
  setToken,
  setUserData,
  setMyProfile,
  setSettings,
  clearAuthReduxData,
} = AuthSlice.actions;
export default AuthSlice.reducer;
