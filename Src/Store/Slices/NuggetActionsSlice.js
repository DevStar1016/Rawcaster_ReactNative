import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  likedNuggetsIds: [],
  savedNuggetsIds: [],
};

const NuggetActionsSlice = createSlice({
  name: 'NuggetActionsSlice',
  initialState,
  reducers: {
    likeUnlikeNugget: (state, action) => {
      let tempNuggetsIds = [...state.likedNuggetsIds];
      let tempIndex = tempNuggetsIds.findIndex(id => id === action.payload);
      if (tempIndex === -1) {
        tempNuggetsIds.push(action.payload);
      } else {
        tempNuggetsIds = tempNuggetsIds.filter(id => id !== action.payload);
      }
      state.likedNuggetsIds = tempNuggetsIds;
    },
    saveUnSaveNugget: (state, action) => {
      let tempNuggetsIds = [...state.savedNuggetsIds];
      let tempIndex = tempNuggetsIds.findIndex(id => id === action.payload);
      if (tempIndex === -1) {
        tempNuggetsIds.push(action.payload);
      } else {
        tempNuggetsIds = tempNuggetsIds.filter(id => id !== action.payload);
      }
      state.savedNuggetsIds = tempNuggetsIds;
    },
  },
});
export const {likeUnlikeNugget, saveUnSaveNugget} = NuggetActionsSlice.actions;
export default NuggetActionsSlice.reducer;
