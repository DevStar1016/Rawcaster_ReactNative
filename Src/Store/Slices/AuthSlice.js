import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  token: null,
  userData: null,
  myProfile: null,
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
  },
});
export const {setToken, setUserData, setMyProfile} = AuthSlice.actions;
export default AuthSlice.reducer;
