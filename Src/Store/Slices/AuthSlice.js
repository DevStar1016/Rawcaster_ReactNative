import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  token: null,
  userData: null,
  myProfile: null,
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
      state.myProfile = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
  },
});
export const {setToken, setUserData, setMyProfile, setSettings} =
  AuthSlice.actions;
export default AuthSlice.reducer;
