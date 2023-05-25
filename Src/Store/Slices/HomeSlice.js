import {createSlice} from '@reduxjs/toolkit';

export const initialState = {
  searchedNuggetsList: [],
  connectionsList: [],
  groupsList: [],
  pendingFriendRequests: [],
  influencerCategoryList: [],
  unclaimedAccountsList: [],
  unreadNotificationCount: null,
  typeWiseNotificationCount: {
    fans: 0,
    groups: 0,
    connections: 0,
    events: 0,
    nuggets: 0,
    poll_results: 0,
  },
  nuggetFilterType: 0,
  otherConnectionsRequestList: [],
  otherInfluencersRequestList: [],
};

const HomeSlice = createSlice({
  name: 'HomeSlice',
  initialState,
  reducers: {
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
    setUnclaimedAccountsList: (state, action) => {
      state.unclaimedAccountsList = action.payload;
    },
    setUnreadNotificationCount: (state, action) => {
      state.unreadNotificationCount = action.payload;
    },
    setTypeWiseNotificationCount: (state, action) => {
      state.typeWiseNotificationCount = action.payload;
    },
    setNuggetFilterType: (state, action) => {
      state.nuggetFilterType = action.payload;
    },
    setOtherConnectionsRequestList: (state, action) => {
      state.otherConnectionsRequestList = action.payload;
    },
    setOtherInfluencersRequestList: (state, action) => {
      state.otherInfluencersRequestList = action.payload;
    },

    clearHomeReduxData: (state, action) => {
      state.nuggetsList = [];
      state.searchedNuggetsList = [];
      state.connectionsList = [];
      state.groupsList = [];
      state.pendingFriendRequests = [];
      state.influencerCategoryList = [];
      state.unreadNotificationCount = null;
      state.typeWiseNotificationCount = {
        nuggets: 0,
        events: 0,
        connections: 0,
        groups: 0,
        fans: 0,
        poll_results: 0,
      };
      state.nuggetFilterType = 0;
      state.otherConnectionsRequestList = [];
      state.otherInfluencersRequestList = [];
    },
  },
});
export const {
  setSearchedNuggetsList,
  setConnectionsList,
  setGroupsList,
  setPendingFriendRequests,
  setInfluencerCategoryList,
  setUnclaimedAccountsList,
  setUnreadNotificationCount,
  setTypeWiseNotificationCount,
  clearHomeReduxData,
  setNuggetFilterType,
  setOtherConnectionsRequestList,
  setOtherInfluencersRequestList,
} = HomeSlice.actions;
export default HomeSlice.reducer;
