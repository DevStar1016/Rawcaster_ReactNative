import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  token: null,
};

const AuthSlice = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    SetToken: (state, action) => {
      state.token = action.payload;
    },
  },
});
export const {SetToken} = AuthSlice.actions;
export default AuthSlice.reducer;
