import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import TitleRowContainer from './TitleRowContainer';
import ProfileWithBadge, {
  ProfileWithBadgeProps,
} from '../../../Components/ProfileWithBadge';
import {
  useOtherConnectionsRequestList,
  useOtherInfluencersRequestList,
  useProfile,
  useToken,
  useUnclaimedAccountsList,
} from '../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
import SVGIcon from '../../../Components/SVGIcon';
import {StackActions, useNavigation} from '@react-navigation/native';
import UsersProfilesDoubleRowListLoader from '../../../Components/Skelotons/UsersProfilesDoubleRowListLoader';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getFollowListService,
  listAllFriendsService,
  listUnClaimAccountService,
  sendFriendRequestsService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {Modal} from 'react-native';
import Loader from '../../../Components/Loader';
import {useDispatch} from 'react-redux';
import {
  setOtherConnectionsRequestList,
  setOtherInfluencersRequestList,
  setUnclaimedAccountsList,
} from '../../../Store/Slices/HomeSlice';

type Props = {
  userId?: any;
  paddingHorizontal?: number;
  isLock?: boolean;
  list?: [];
  title?: string;
  listType: 'connections' | 'influencers' | 'fans' | 'unclaimed_influencers';
  ProfileItemProps: ProfileWithBadgeProps;
  isDisplayChat?: boolean;
  isExternalListOnly?: boolean;
  onPressChat?: () => void;
  isDisplayEvent?: boolean;
  onPressEvent?: () => void;
};

const EXTRA_MARGIN = 10;
const PROFILE_CONTAINER_MARGIN = 18;
const ProfilesListContainerWithSeeAll = ({
  userId,
  paddingHorizontal = 0,
  isLock,
  list = [],
  isExternalListOnly = false,
  title = '',
  listType,
  ProfileItemProps,
  isDisplayChat = false,
  onPressChat,
  isDisplayEvent = false,
  onPressEvent,
}: Props) => {
  let isMount = true;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const profile = useProfile();
  const unclaimedAccountsList: any = useUnclaimedAccountsList();

  const otherInfluencersRequestList = useOtherInfluencersRequestList();
  const otherConnectionsRequestList = useOtherConnectionsRequestList();
  const [isLoading, setisLoading] = useState(
    !isLock && (userId || list.length <= 0) ? true : false,
  );
  const [usersList, setusersList] = useState<any[]>(
    list.length > 0 ? [...list] : [],
  );
  const [usersTotalCount, setusersTotalCount] = useState(usersList.length);
  const [isActionLoading, setisActionLoading] = useState(false);
  const PROFILE_SIZE =
    (DIMENSIONS.window.width -
      paddingHorizontal * 3 -
      EXTRA_MARGIN * 3 -
      PROFILE_CONTAINER_MARGIN * 6) /
    3;

  useEffect(() => {
    isMount = true;
    if (!isLock && token && (userId || list.length <= 0)) {
      if (listType) {
        switch (listType) {
          case 'connections':
            connectionsListAPICall();
            return;
          case 'fans':
            fansListAPICall(2);
            return;
          case 'influencers':
            fansListAPICall();
            return;
          case 'unclaimed_influencers':
            unclaimedAccountsListAPICall();
            return;

          default:
            if (isMount) {
              setisLoading(false);
            }
            break;
        }
      } else {
        if (isMount) {
          setisLoading(false);
        }
      }
    } else {
      if (isMount) {
        setisLoading(false);
      }
    }

    return () => {
      isMount = false;
    };
  }, []);

  const connectionsListAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token ?? ''));
    formData.append('allfriends', 1);
    if (userId) {
      formData.append('user_id', userId);
    }
    listAllFriendsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setusersTotalCount(res.data.friends_count);
          setusersList(res.data.friends_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const unclaimedAccountsListAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    listUnClaimAccountService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setUnclaimedAccountsList(res.data.unclaim_accounts));
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const fansListAPICall = (type = 1) => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    if (userId) {
      formData.append('user_id', userId);
    }
    getFollowListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setusersTotalCount(res.data.follow_count);
          setusersList(res.data.follow_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const handleBecomeFan = (followUserId: any) => {
    // 1 - follow, 2 - unfollow
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', followUserId);
    formData.append('type', 1);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setusersList(preList => {
            let tempList = [...preList];
            let tempIndex = tempList.findIndex(
              sub => sub.user_ref_id === followUserId,
            );
            if (tempIndex !== -1) {
              tempList[tempIndex] = {...tempList[tempIndex], follow: true};
            }
            return tempList;
          });

          dispatch(
            setOtherInfluencersRequestList([
              ...otherInfluencersRequestList,
              followUserId,
            ]),
          );
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  };

  const handleSendFriendRequest = (userRefId: any, userId: any) => {
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_ids', JSON.stringify([userRefId]));
    sendFriendRequestsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setusersList(preList => {
            let tempConnectionList = [...preList];
            let tempIndex = tempConnectionList.findIndex(
              item => item.user_ref_id === userRefId,
            );
            if (tempIndex !== -1) {
              tempConnectionList[tempIndex] = {
                ...tempConnectionList[tempIndex],
                friend_status: 1,
              };
            }
            return tempConnectionList;
          });

          dispatch(
            setOtherConnectionsRequestList([
              ...otherConnectionsRequestList,
              userRefId,
            ]),
          );
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  };

  function getList() {
    if (isExternalListOnly) {
      return list;
    }
    if (listType === 'unclaimed_influencers') {
      return unclaimedAccountsList ? [...unclaimedAccountsList] : [];
    }
    return usersList;
  }

  function getIsShowButton() {
    if (isLoading || isLock || getList().length <= 6) {
      return false;
    }
    return true;
  }

  function getTitle() {
    if (isLock) {
      return title;
    }
    if (listType === 'unclaimed_influencers') {
      return `${title} (${unclaimedAccountsList?.length ?? 0})`;
    }
    return `${title} (${usersTotalCount})`;
    // return `${title} (${getList().length})`;
  }

  function getTopRightIcon(item: any) {
    if (item.user_id !== profile?.user_id) {
      if (
        listType === 'unclaimed_influencers' &&
        (item.unclaimed_status === 1 || item.unclaimed_status === 2)
      ) {
        if (item.unclaimed_status === 1) {
          return 'shield_secondary';
        } else {
          return 'pending_time';
        }
      }
      if (userId) {
        if (
          listType === 'connections' &&
          item.friend_status === 0 &&
          !otherConnectionsRequestList.includes(item.user_ref_id)
        ) {
          return 'user_plus_pink';
        }
        if (
          listType === 'influencers' &&
          !item.follow &&
          !otherInfluencersRequestList.includes(item.user_ref_id)
        ) {
          return 'plus_rounded_fill_primary';
        }
      }
    }
    return undefined;
  }

  return (
    <View style={[styles.mainContainer, {paddingHorizontal}]}>
      <TitleRowContainer
        title={getTitle()}
        isDisplayButton={getIsShowButton()}
        onPressButton={() => {
          /* @ts-ignore */
          navigation.navigate('ProfileSeeAllUsersList', {
            // initialList: [...getList()],
            initialList: [],
            userId: userId,
            listType: listType,
            title: title,
          });
        }}
        buttonType="text"
        isDisplayChat={
          isDisplayChat ? (userId ? false : getList().length > 0) : false
        }
        onPressChat={onPressChat}
        isDisplayEvent={
          isDisplayEvent ? (userId ? false : getList().length > 0) : false
        }
        onPressEvent={onPressEvent}
      />

      {isLoading ? (
        <UsersProfilesDoubleRowListLoader
          containerMarginHorizontal={PROFILE_CONTAINER_MARGIN}
          extraMargin={EXTRA_MARGIN}
          itemSize={PROFILE_SIZE}
        />
      ) : (
        <View style={styles.profilesContainer}>
          {isLock ? (
            [...Array(6)].map((_, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  disabled={isLock}
                  activeOpacity={0.8}
                  style={{
                    alignItems: 'center',
                    marginHorizontal: PROFILE_CONTAINER_MARGIN,
                    marginVertical: 10,
                    width: PROFILE_SIZE + EXTRA_MARGIN,
                  }}>
                  <ProfileWithBadge
                    extraMargin={0}
                    isEnableGradient={false}
                    profileSize={PROFILE_SIZE}
                  />
                  <View style={{flex: 1, paddingTop: 10}}>
                    <StyledText style={{textAlign: 'center'}}>
                      Rawcaster
                    </StyledText>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : getList() && getList().length > 0 ? (
            <View style={styles.profilesContainer}>
              {[...getList()]
                .filter((_, index) => index < 6)
                .map((item: any, index) => {
                  return (
                    <TouchableOpacity
                      key={index.toString()}
                      disabled={isLock}
                      activeOpacity={0.8}
                      onPress={() => {
                        const pushAction = StackActions.push('ProfileStack', {
                          userId:
                            item.user_id === profile?.user_id
                              ? null
                              : item.user_id,
                        });
                        navigation.dispatch(pushAction);
                      }}
                      style={{
                        alignItems: 'center',
                        marginHorizontal: PROFILE_CONTAINER_MARGIN,
                        marginVertical: 10,
                        width: PROFILE_SIZE + EXTRA_MARGIN,
                      }}>
                      <ProfileWithBadge
                        extraMargin={0}
                        isEnableGradient={true}
                        padding={0}
                        profileSize={PROFILE_SIZE}
                        profileImage={item.profile_img}
                        topRightIconAsButton
                        onPressTopRightIcon={() => {
                          if (listType === 'unclaimed_influencers') {
                            if (item.unclaimed_status === 1) {
                              /* @ts-ignore */
                              navigation.navigate('ClaimAccount', {
                                influencerId: item.user_id,
                              });
                            }
                          } else if (userId) {
                            if (listType === 'influencers' && !item.follow) {
                              handleBecomeFan(item.user_ref_id);
                            } else if (
                              listType === 'connections' &&
                              item.friend_status === 0
                            ) {
                              handleSendFriendRequest(
                                item.user_ref_id,
                                item.user_id,
                              );
                            }
                          }
                        }}
                        topRightIcon={getTopRightIcon(item)}
                        topRightIconContainerBackgroundColor={COLORS.white}
                        {...ProfileItemProps}
                      />
                      <View style={{flex: 1, paddingTop: 10}}>
                        <StyledText style={{textAlign: 'center'}}>
                          {getSlicedText(item.display_name.trim(), 15)}
                        </StyledText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 35,
              }}>
              <SVGIcon
                icon="user_list_placeholder"
                height={(35 / 100) * (DIMENSIONS.window.width - 20)}
                width={(35 / 100) * (DIMENSIONS.window.width - 20)}
              />
            </View>
          )}
          {isLock && <BlurOverlay />}
        </View>
      )}
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default ProfilesListContainerWithSeeAll;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  seeAllButtonText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.medium,
  },
  profilesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
