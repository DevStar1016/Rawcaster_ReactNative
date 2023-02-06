import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  token: null,
};

const AuthSlice = createSlice({
  name: 'AuthSlice',
  initialState,
  reducers: {
    StoreToken: (state, action) => {
      state.token = action.payload;
    },
  },
});
export const {StoreToken} = AuthSlice.actions;
export default AuthSlice.reducer;
