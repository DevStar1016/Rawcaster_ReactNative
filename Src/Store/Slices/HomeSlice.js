import {createSlice} from '@reduxjs/toolkit';
import {getFilteredDuplicatesList} from '../../Utilities/Methods';

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
  otherConnectionsRequestList: [],
  otherInfluencersRequestList: [],
  savedNuggetsList: [],
  followingUsersList: [], // {user_id:userId,follow_count:followCount}
  blockedUserIds: [],
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
    setOtherConnectionsRequestList: (state, action) => {
      state.otherConnectionsRequestList = action.payload;
    },
    setOtherInfluencersRequestList: (state, action) => {
      state.otherInfluencersRequestList = action.payload;
    },
    setSavedNuggetsList: (state, action) => {
      state.savedNuggetsList = action.payload;
    },
    blockUsers: (state, action) => {
      state.blockedUserIds = getFilteredDuplicatesList([
        ...state.blockedUserIds,
        ...action.payload,
      ]);
    },
    unBlockUser: (state, action) => {
      state.blockedUserIds = [...state.blockedUserIds].filter(
        id => id !== action.payload,
      );
    },

    setFollowingUsersList: (state, action) => {
      state.followingUsersList = getFilteredDuplicatesList(
        [...state.followingUsersList, ...action.payload],
        'user_id',
      );
    },
    addFollowingUser: (state, action) => {
      let tempFollowingUsersList = [...state.followingUsersList];
      let tempIndex = tempFollowingUsersList.findIndex(
        item => item.id === action.payload.user_id,
      );

      if (tempIndex === -1) {
        tempFollowingUsersList = [
          ...tempFollowingUsersList,
          {...action.payload},
        ];
      } else {
        tempFollowingUsersList = [...tempFollowingUsersList].filter(
          item => item.user_id !== action.payload.user_id,
        );
      }
      state.followingUsersList = getFilteredDuplicatesList(
        [...tempFollowingUsersList],
        'user_id',
      );
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
      state.otherConnectionsRequestList = [];
      state.otherInfluencersRequestList = [];
      state.savedNuggetsList = [];
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
  setOtherConnectionsRequestList,
  setOtherInfluencersRequestList,
  setSavedNuggetsList,
  setFollowingUsersList,
  addFollowingUser,
  blockUsers,
  unBlockUser,
} = HomeSlice.actions;
export default HomeSlice.reducer;
