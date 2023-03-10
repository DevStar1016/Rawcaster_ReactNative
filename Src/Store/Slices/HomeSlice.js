import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  nuggetsList: [],
};

const HomeSlice = createSlice({
  name: 'HomeSlice',
  initialState,
  reducers: {
    setNuggetsList: (state, action) => {
      state.nuggetsList = action.payload;
    },
  },
});
export const {setNuggetsList} = HomeSlice.actions;
export default HomeSlice.reducer;
