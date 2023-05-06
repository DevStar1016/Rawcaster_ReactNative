import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  nuggetsList: [],
  searchedNuggetsList: [],
  connectionsList: [],
  groupsList: [],
  pendingFriendRequests: [],
  influencerCategoryList: [],
};

const HomeSlice = createSlice({
  name: 'HomeSlice',
  initialState,
  reducers: {
    setNuggetsList: (state, action) => {
      state.nuggetsList = action.payload;
    },
    setSearchedNuggetsList: (state, action) => {
      state.searchedNuggetsList = action.payload;
    },
    setConnectionsList: (state, action) => {
      state.connectionsList = action.payload;
    },
    setGroupsList: (state, action) => {
      state.groupsList = action.payload;
    },
    setPendingFriendRequests: (state, action) => {
      state.pendingFriendRequests = action.payload;
    },
    setInfluencerCategoryList: (state, action) => {
      state.influencerCategoryList = action.payload;
    },
    clearHomeReduxData: (state, action) => {
      state.nuggetsList = [];
      state.searchedNuggetsList = [];
      state.connectionsList = [];
      state.groupsList = [];
      state.pendingFriendRequests = [];
      state.influencerCategoryList = [];
    },
  },
});
export const {
  setNuggetsList,
  setSearchedNuggetsList,
  setConnectionsList,
  setGroupsList,
  setPendingFriendRequests,
  setInfluencerCategoryList,
  clearHomeReduxData,
} = HomeSlice.actions;
export default HomeSlice.reducer;
