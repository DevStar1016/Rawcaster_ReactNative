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
export const useTabType = () => {
  return useSelector(state => state.utility.bottomHomeButtonType);
};

export const useDeletedNuggetsIds = () => {
  return useSelector(state => state.nugget_actions.deletedNuggetsIds);
};

export const useEditedNuggetsList = () => {
  return useSelector(state => state.nugget_actions.editedNuggets);
};

export const useFollowingUsersList = () => {
  return useSelector(state => state.home.followingUsersList);
};

export const useIsVisibleInfluencers = () => {
  return useSelector(state => state.utility.isVisibleInfluencers);
};

export const useSearchedNuggetsList = () => {
  return useSelector(state => state.home.searchedNuggetsList);
};

export const useConnectionsList = () => {
  return useSelector(state => state.home.connectionsList);
};
export const useOtherConnectionsRequestList = () => {
  return useSelector(state => state.home.otherConnectionsRequestList);
};
export const useOtherInfluencersRequestList = () => {
  return useSelector(state => state.home.otherInfluencersRequestList);
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
export const useUnclaimedAccountsList = () => {
  return useSelector(state => state.home.unclaimedAccountsList);
};
export const useLikedNuggets = () => {
  return useSelector(state => state.nugget_actions.likedNuggets);
};
export const useUnLikedNuggetsFromLikedNuggets = () => {
  return useSelector(
    state => state.nugget_actions.unLikedNuggetsFromLikedNuggets,
  );
};
export const useSavedNuggetsIds = () => {
  return useSelector(state => state.nugget_actions.savedNuggetsIds);
};
export const useTranslatedNuggetsList = () => {
  return useSelector(state => state.nugget_actions.translatedNuggets);
};
export const useIsAppForeground = () => {
  return useSelector(state => state.utility.isAppForeground);
};

export const useIsOpenLoginAlert = () => {
  return useSelector(state => state.utility.isOpenLoginAlert);
};

export const usePremiumAlert = () => {
  return useSelector(state => state.utility.premiumAlert);
};

export const useIsOpenVerifyPopup = () => {
  return useSelector(state => state.utility.isOpenVerifyPopup);
};

export const useUnreadNotificationCount = () => {
  return useSelector(state => state.home.unreadNotificationCount);
};

export const useIsNuggetsLoading = (categoryName = 'forYou') => {
  if (categoryName) {
    return useSelector(
      state => state.nugget_list_data.nuggetsLoading[categoryName],
    );
  }
  // return useSelector(state => {
  //   const loadingStatusList = Object.keys(
  //     state.nugget_list_data.nuggetsLoading,
  //   ).map(keyName => state.nugget_list_data.nuggetsLoading[keyName]);
  //   if (loadingStatusList.includes(true)) {
  //     return true;
  //   }
  //   return false;
  // });
};

export const useNuggetsList = (categoryName = 'forYou') => {
  return categoryName
    ? useSelector(state => state.nugget_list_data.nuggetsList[categoryName]) ??
        []
    : [];
};
export const useNuggetsListTotalPages = (categoryName = 'forYou') => {
  return categoryName
    ? useSelector(state => state.nugget_list_data.totalPages[categoryName]) ?? 1
    : 1;
};
export const useSavedNuggetsList = () => {
  return useSelector(state => state.home.savedNuggetsList);
};

export const useBlockedUserIds = () => {
  return useSelector(state => state.home.blockedUserIds);
};

export const useGlobalLoaderData = () => {
  return useSelector(state => state.utility.globalLoaderData);
};
