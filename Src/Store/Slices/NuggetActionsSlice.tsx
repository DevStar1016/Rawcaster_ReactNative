import {createSlice} from '@reduxjs/toolkit';
import {getFilteredDuplicatesList} from '../../Utilities/Methods';
import {NuggetActionsDataProp} from '../SliceTypes/NuggetTypes';

export const initialState: NuggetActionsDataProp = {
  likedNuggets: [], //{ id:nugget_id,total_likes:TOTAL_LIKES}
  savedNuggetsIds: [],
  unLikedNuggetsFromLikedNuggets: [],
  editedNuggets: [],
  deletedNuggetsIds: [],
  translatedNuggets: [],
  uploadingNuggets: [],
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
        let total_likes = parseInt(action.payload.total_likes);
        const unlikedNuggetData = [
          ...state.unLikedNuggetsFromLikedNuggets,
        ].find(item => item.id === action.payload.nugget_id);

        if (unlikedNuggetData) {
          total_likes = unlikedNuggetData.total_likes;
        }
        tempLikedNuggets.push({
          id: action.payload.nugget_id,
          total_likes: total_likes + 1,
        });
        state.unLikedNuggetsFromLikedNuggets = [
          ...state.unLikedNuggetsFromLikedNuggets,
        ].filter(item => item.id !== action.payload.nugget_id);
      } else {
        const tempUnlikedNuggetData = tempLikedNuggets.find(
          item => item.id === action.payload.nugget_id,
        );
        tempLikedNuggets = tempLikedNuggets.filter(
          item => item.id !== action.payload.nugget_id,
        );
        if (tempUnlikedNuggetData) {
          state.unLikedNuggetsFromLikedNuggets = [
            ...state.unLikedNuggetsFromLikedNuggets,
            {
              ...tempUnlikedNuggetData,
              total_likes: tempUnlikedNuggetData.total_likes - 1,
            },
          ];
        }
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

        state.savedNuggetsIds = getFilteredDuplicatesList(
          tempSavedNuggetsIds,
          '',
        );
      }
    },
    addEditedNugget: (state, action) => {
      const editedNugget = {...action.payload};
      let tempEditedNuggetsList = [...state.editedNuggets];
      const tempIndex = [...tempEditedNuggetsList].findIndex(
        item => item.nugget_id === editedNugget.nugget_id,
      );
      if (tempIndex === -1) {
        tempEditedNuggetsList = [{...editedNugget}, ...tempEditedNuggetsList];
      } else {
        tempEditedNuggetsList[tempIndex] = {...editedNugget};
      }
      state.editedNuggets = getFilteredDuplicatesList(
        tempEditedNuggetsList,
        'nugget_id',
      );
    },
    addDeletedNuggetId: (state, action) => {
      state.deletedNuggetsIds = getFilteredDuplicatesList(
        [...state.deletedNuggetsIds, action.payload],
        '',
      );
    },
    setTranslatedNuggets: (state, action) => {
      state.translatedNuggets = getFilteredDuplicatesList(
        action.payload,
        'nugget_id',
      );
    },
    addUpdateUploadingNugget: (state, action) => {
      let tempUploadingNuggets = [...state.uploadingNuggets];
      const updateNuggetIndex = tempUploadingNuggets.findIndex(
        item => item.id === action.payload.id,
      );
      if (updateNuggetIndex !== -1) {
        tempUploadingNuggets[updateNuggetIndex] = {...action.payload};
      } else {
        tempUploadingNuggets = [{...action.payload}, ...tempUploadingNuggets];
      }
      state.uploadingNuggets = [...tempUploadingNuggets];
    },
    removeUploadingNugget: (state, action) => {
      state.uploadingNuggets = [...state.uploadingNuggets].filter(
        item => item.id !== action.payload,
      );
    },
    clearNuggetActionsReduxData: (state, action) => {
      return {...initialState};
    },
  },
});
export const {
  likeUnlikeNugget,
  saveUnSaveNugget,
  setLikedSavedNuggets,
  addDeletedNuggetId,
  addEditedNugget,
  setTranslatedNuggets,
  addUpdateUploadingNugget,
  removeUploadingNugget,
  clearNuggetActionsReduxData,
} = NuggetActionsSlice.actions;
export default NuggetActionsSlice.reducer;
