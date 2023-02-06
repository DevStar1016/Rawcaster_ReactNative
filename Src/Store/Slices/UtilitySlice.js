import {createSlice} from '@reduxjs/toolkit';
import {COLORS} from '../../Utilities/Colors';

export const initialState = {
  statusBarColor: COLORS.primary,
  insets: {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
  },
};

const UtilitySlice = createSlice({
  name: 'UtilitySlice',
  initialState,
  reducers: {
    setStatusBarColor: (state, action) => {
      state.statusBarColor = action.payload;
    },
    setInsets: (state, action) => {
      state.insets = action.payload;
    },
  },
});
export const {setStatusBarColor, setInsets} = UtilitySlice.actions;
export default UtilitySlice.reducer;
