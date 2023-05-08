import {useSelector} from 'react-redux';

export const useToken = () => {
  return useSelector(state => state.auth.token);
};

export const useUserData = () => {
  return useSelector(state => state.auth.userData);
};

export const useProfile = () => {
  return useSelector(state => state.auth.profile);
};
export const useSettings = () => {
  return useSelector(state => state.auth.settings);
};

export const useLocationDetails = () => {
  return useSelector(state => state.utility.locationDetails);
};

export const useIsBottomTabBarAbsolute = () => {
  return useSelector(state => state.utility.isBottomTabBarAbsolute);
};

export const useInsets = () => {
  return useSelector(state => state.utility.insets);
};

export const useNuggetType = () => {
  return useSelector(state => state.utility.nugget_type);
};

export const useIsVisibleInfluencers = () => {
  return useSelector(state => state.utility.isVisibleInfluencers);
};

export const useNuggetsList = () => {
  return useSelector(state => state.home.nuggetsList);
};

export const useSearchedNuggetsList = () => {
  return useSelector(state => state.home.searchedNuggetsList);
};

export const useConnectionsList = () => {
  return useSelector(state => state.home.connectionsList);
};
export const useGroupsList = () => {
  return useSelector(state => state.home.groupsList);
};
export const usePendingFriendRequests = () => {
  return useSelector(state => state.home.pendingFriendRequests);
};
export const useInfluencerCategoryList = () => {
  return useSelector(state => state.home.influencerCategoryList);
};
export const useLikedNuggetsIds = () => {
  return useSelector(state => state.nugget_actions.likedNuggetsIds);
};
export const useSavedNuggetsIds = () => {
  return useSelector(state => state.nugget_actions.savedNuggetsIds);
};
export const useIsAppForeground = () => {
  return useSelector(state => state.utility.isAppForeground);
};

export const useIsOpenLoginAlert = () => {
  return useSelector(state => state.utility.isOpenLoginAlert);
};

export const useIsOpenVerifyPopup = () => {
  return useSelector(state => state.utility.isOpenVerifyPopup);
};

export const useUnreadNotificationCount = () => {
  return useSelector(state => state.home.unreadNotificationCount);
};
