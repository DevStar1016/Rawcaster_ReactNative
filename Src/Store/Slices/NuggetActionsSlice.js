import {createSlice} from '@reduxjs/toolkit';
import {getFilteredDuplicatesList} from '../../Utilities/Methods';

export const initialState = {
  likedNuggets: [], //{ id:nugget_id,total_likes:TOTAL_LIKES}
  savedNuggetsIds: [],
};

const NuggetActionsSlice = createSlice({
  name: 'NuggetActionsSlice',
  initialState,
  reducers: {
    likeUnlikeNugget: (state, action) => {
      let tempLikedNuggets = [...state.likedNuggets];
      let tempIndex = tempLikedNuggets.findIndex(
        item => item.id === action.payload.nugget_id,
      );
      if (tempIndex === -1) {
        tempLikedNuggets.push({
          id: action.payload.nugget_id,
          total_likes: parseInt(action.payload.total_likes) + 1,
        });
      } else {
        tempLikedNuggets = tempLikedNuggets.filter(
          item => item.id !== action.payload.nugget_id,
        );
      }
      state.likedNuggets = [...tempLikedNuggets];
    },

    saveUnSaveNugget: (state, action) => {
      let tempNuggetsIds = [...state.savedNuggetsIds];
      let tempIndex = tempNuggetsIds.findIndex(id => id === action.payload);
      if (tempIndex === -1) {
        tempNuggetsIds.push(action.payload);
      } else {
        tempNuggetsIds = tempNuggetsIds.filter(id => id !== action.payload);
      }
      state.savedNuggetsIds = [...tempNuggetsIds];
    },
    setLikedSavedNuggets: (state, action) => {
      if (action.payload.likedNuggets) {
        const tempLikedNuggets = [
          ...state.likedNuggets,
          ...action.payload.likedNuggets,
        ];
        state.likedNuggets = getFilteredDuplicatesList(tempLikedNuggets, 'id');
      }
      if (action.payload.savedNuggetsIds) {
        const tempSavedNuggetsIds = [
          ...state.savedNuggetsIds,
          ...action.payload.savedNuggetsIds,
        ];
        console.log(tempSavedNuggetsIds, 'SAVEDDDDDD REDUX IDS');
        state.savedNuggetsIds = getFilteredDuplicatesList(tempSavedNuggetsIds);
      }
    },
  },
});
export const {likeUnlikeNugget, saveUnSaveNugget, setLikedSavedNuggets} =
  NuggetActionsSlice.actions;
export default NuggetActionsSlice.reducer;
