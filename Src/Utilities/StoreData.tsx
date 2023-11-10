import {useAppSelector} from '../Store/StoreHook';

export const useToken = () => {
  return useAppSelector(state => state.auth.token);
};

export const useProfile = () => {
  return useAppSelector(state => state.auth.profile);
};
export const useSettings = () => {
  return useAppSelector(state => state.auth.settings);
};

export const useLocationDetails = () => {
  return useAppSelector(state => state.utility.locationDetails);
};

export const useIsBottomTabBarAbsolute = () => {
  return useAppSelector(state => state.utility.isBottomTabBarAbsolute);
};

export const useInsets = () => {
  return useAppSelector(state => state.utility.insets);
};

export const useNuggetType = () => {
  return useAppSelector(state => state.utility.nugget_type);
};
export const useTabType = () => {
  return useAppSelector(state => state.utility.bottomHomeButtonType);
};

export const useDeletedNuggetsIds = () => {
  return useAppSelector(state => state.nugget_actions.deletedNuggetsIds);
};

export const useEditedNuggetsList = () => {
  return useAppSelector(state => state.nugget_actions.editedNuggets);
};

export const useFollowingUsersList = () => {
  return useAppSelector(state => state.home.followingUsersList);
};

export const useIsVisibleInfluencers = () => {
  return useAppSelector(state => state.utility.isVisibleInfluencers);
};

export const useSearchedNuggetsList = () => {
  return useAppSelector(state => state.home.searchedNuggetsList);
};

export const useConnectionsList = () => {
  return useAppSelector(state => state.home.connectionsList);
};
export const useOtherConnectionsRequestList = () => {
  return useAppSelector(state => state.home.otherConnectionsRequestList);
};
export const useOtherInfluencersRequestList = () => {
  return useAppSelector(state => state.home.otherInfluencersRequestList);
};
export const useGroupsList = () => {
  return useAppSelector(state => state.home.groupsList);
};
export const useGroupListLoading = () => {
  return useAppSelector(state => state.home.groupListLoading);
};
export const useConnectionsListLoading = () => {
  return useAppSelector(state => state.home.connectionsListLoading);
};
export const usePendingFriendRequests = () => {
  return useAppSelector(state => state.home.pendingFriendRequests);
};
export const useInfluencerCategoryList = () => {
  return useAppSelector(state => state.home.influencerCategoryList);
};
export const useUnclaimedAccountsList = () => {
  return useAppSelector(state => state.home.unclaimedAccountsList);
};
export const useLikedNuggets = () => {
  return useAppSelector(state => state.nugget_actions.likedNuggets);
};
export const useUnLikedNuggetsFromLikedNuggets = () => {
  return useAppSelector(
    state => state.nugget_actions.unLikedNuggetsFromLikedNuggets,
  );
};
export const useSavedNuggetsIds = () => {
  return useAppSelector(state => state.nugget_actions.savedNuggetsIds);
};
export const useUploadingNuggets = () => {
  return useAppSelector(state => state.nugget_actions.uploadingNuggets);
};

export const useTranslatedNuggetsList = () => {
  return useAppSelector(state => state.nugget_actions.translatedNuggets);
};
export const useIsAppForeground = () => {
  return useAppSelector(state => state.utility.isAppForeground);
};

export const useIsOpenLoginAlert = () => {
  return useAppSelector(state => state.utility.isOpenLoginAlert);
};

export const useIsGroupJoinAlert = () => {
  return useAppSelector(state => state.utility.isGroupJoinAlert);
};

export const usePremiumAlert = () => {
  return useAppSelector(state => state.utility.premiumAlert);
};

export const useIsOpenVerifyPopup = () => {
  return useAppSelector(state => state.utility.isOpenVerifyPopup);
};

export const useUnreadNotificationCount = () => {
  return useAppSelector(state => state.home.unreadNotificationCount);
};

export const useIsNuggetsLoading = (categoryName = 'forYou') => {
  if (categoryName) {
    return useAppSelector(
      state => state.nugget_list_data.nuggetsLoading[categoryName],
    );
  }
};

export const useNuggetsErrorMessage = (categoryName = 'forYou') => {
  if (categoryName) {
    return useAppSelector(
      state => state.nugget_list_data.nuggetsErrorMessage[categoryName],
    );
  }
};

export const useNuggetsList = (categoryName = 'forYou') => {
  return categoryName
    ? useAppSelector(
        state => state.nugget_list_data.nuggetsList[categoryName],
      ) ?? []
    : [];
};
export const useNuggetsListTotalPages = (categoryName = 'forYou') => {
  return categoryName
    ? useAppSelector(
        state => state.nugget_list_data.totalPages[categoryName],
      ) ?? 1
    : 1;
};
export const useSavedNuggetsList = () => {
  return useAppSelector(state => state.home.savedNuggetsList);
};

export const useBlockedUserIds = () => {
  return useAppSelector(state => state.home.blockedUserIds);
};

export const useGlobalLoaderData = () => {
  return useAppSelector(state => state.utility.globalLoaderData);
};
