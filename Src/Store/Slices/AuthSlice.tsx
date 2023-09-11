import {createSlice} from '@reduxjs/toolkit';
import {AuthDataProp} from '../SliceTypes/AuthTypes';

export const initialState: AuthDataProp = {
  token: null,
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
    setMyProfile: (state, action) => {
      state.profile = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    clearAuthReduxData: (state, action) => {
      return {...initialState};
    },
  },
});
export const {setToken, setMyProfile, setSettings, clearAuthReduxData} =
  AuthSlice.actions;
export default AuthSlice.reducer;
