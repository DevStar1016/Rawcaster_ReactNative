import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ProfileTopSection from './ProfileTopSection';
import ProfileNameBioContainer from './ProfileNameBioContainer';
import ProfileIntroContainer from './ProfileIntroContainer';
import {COLORS} from '../../../Utilities/Colors';
import {
  useBlockedUserIds,
  useConnectionsList,
  useDeletedNuggetsIds,
  useEditedNuggetsList,
  useFollowingUsersList,
  useInsets,
  useProfile,
  useSavedNuggetsList,
  useToken,
  useTranslatedNuggetsList,
  useUnclaimedAccountsList,
  useUploadingNuggets,
} from '../../../Utilities/StoreData';
import {
  getAuthCode,
  getSlicedText,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getMyProfileService,
  getOthersProfileService,
  listNuggetsService,
  sendFriendRequestsService,
  unfriendService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ProfilesListContainerWithSeeAll from './ProfilesListContainerWithSeeAll';
import DefaultBackground from '../../../Components/DefaultBackground';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import Loader from '../../../Components/Loader';
import {
  NuggetParentActionsContext,
  useDashboardProfile,
} from '../../../Utilities/Contexts';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Nugget from '../HomeScreen/Nugget';
import SVGIcon from '../../../Components/SVGIcon';
import {
  DIMENSIONS,
  RAWCASTER_DEFAULT_MESSAGE,
} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
import {useDispatch} from 'react-redux';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {
  removeFollowingUser,
  setConnectionsList,
  setFollowingUsersList,
  setUnreadNotificationCount,
} from '../../../Store/Slices/HomeSlice';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {
  becomeFan,
  getInfluencersCategoriesList,
} from '../../../Store/ThunkAPIServices';
import {setPremiumAlert} from '../../../Store/Slices/UtilitySlice';
import {setMyProfile} from '../../../Store/Slices/AuthSlice';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';
const PADDING_HORIZONTAL = 10;
var currentPage = 1;
var totalPages = 1;

const Profile = ({route}) => {
  let profileController = undefined;
  let nuggetsController = undefined;
  const isMount = useRef(true);
  const dispatch = useDispatch();
  const profile = useProfile();
  const isFocused = useIsFocused();
  const [isunclaimeduserAlert, setisunclaimeduserAlert] = useState({
    status: false,
    text: '',
  });
  const uploadingNuggets = useUploadingNuggets();
  const deletedNuggetsIds = useDeletedNuggetsIds();
  const editedNuggetsList = useEditedNuggetsList();
  const translatedNuggetsList = useTranslatedNuggetsList();
  const {focusedNuggetUserId} = useDashboardProfile() ?? {};
  const navigation = useNavigation();
  const token = useToken();
  const savedNuggetsList = useSavedNuggetsList();
  const blockedUserIds = useBlockedUserIds();
  const unclaimedAccountsList = useUnclaimedAccountsList();
  const insets = useInsets();
  const followingUsersList = useFollowingUsersList();

  const [userId, setuserId] = useState(
    route.params ? route.params?.userId : focusedNuggetUserId ?? null,
  );
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [selectedTab, setselectedTab] = useState(1); // 1 - my nuggets, 2 - favorites
  const connections = useConnectionsList();
  const [nuggetsList, setnuggetsList] = useState([]);
  const flatlistRef = useRef(null);

  const [nuggetsCount, setnuggetsCount] = useState(0);
  const [isMuted, setisMuted] = useState(true);
  const [isLoading, setisLoading] = useState(userId ? true : false);
  const [isActionLoading, setisActionLoading] = useState({
    status: false,
    text: '',
  });
  const [othersProfile, setothersProfile] = useState(null);
  const [emptyText, setemptyText] = useState(null);
  const [viewableItem, setviewableItem] = useState({
    nugget_id: '',
    viewed: false,
  });
  const [isReadMuted, setisReadMuted] = useState(false);
  const audioPlayerRef = useRef(new AudioRecorderPlayer());
  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 500,
    viewAreaCoveragePercentThreshold: 70,
  });
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0) {
      setviewableItem({
        nugget_id: viewableItems.viewableItems[0].item.nugget_id || 0,
        viewed: viewableItems.viewableItems[0].item.viewed,
      });
    }
  });
  const nuggetContentController = useRef(null);

  const Divider = () => {
    return <View style={styles.divider} />;
  };
  useEffect(() => {
    if (!isFocused) {
      if (nuggetContentController.current) {
        nuggetContentController.current.abort();
      }
      handleStopAudio();
    }
  }, [isFocused]);

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    isMount.current = true;

    return () => {
      isMount.current = false;
      currentPage = 1;
      totalPages = 1;
      if (profileController) {
        profileController.abort();
      }
      if (nuggetsController) {
        nuggetsController.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!route.params?.userId) {
      if (isMount.current) {
        setuserId(focusedNuggetUserId);
      }
    }
  }, [focusedNuggetUserId]);

  useEffect(() => {
    if (userId) {
      if (isMount.current) {
        setisLoading(true);
      }
      getOthersProfileAPI();
    }
  }, [userId]);

  useEffect(() => {
    if (
      (userId && othersProfile && parseInt(othersProfile.lock_nugget) === 0) ||
      (!userId && profile)
    ) {
      if (isMount.current) {
        setisListLoading(true);
        setnuggetsCount(0);
        setnuggetsList([]);
      }
      listNuggetsAPICall(1);
    }
  }, [userId, othersProfile]);

  const getMyProfileAPI = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    getMyProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let profile = {...res.data.profile};
          profile = {
            ...profile,
            name: htmlDecodeText(profile?.name),
            first_name: htmlDecodeText(profile?.first_name),
            last_name: htmlDecodeText(profile?.last_name),
            bio_data: htmlDecodeText(profile?.bio_data),
          };

          dispatch(setMyProfile(profile));
          dispatch(
            setUnreadNotificationCount(
              profile?.unread_notification_count ?? null,
            ),
          );
        } else if (res.data.status === 0) {
          if (isMount.current) {
            setemptyText(res.data.msg);
          }
        }
      })
      .catch(e => {
        if (isMount.current) {
          setemptyText(e.message);
        }
      })
      .finally(() => {
        if (isMount.current) {
          setisLoading(false);
          setisRefreshing(false);
        }
      });
  };

  const onRefresh = () => {
    if (isMount.current) {
      setisLoading(true);
      setisRefreshing(true);
      setisListLoading(true);
    }
    currentPage = 1;
    totalPages = 1;
    listNuggetsAPICall(1);
    if (userId) {
      getOthersProfileAPI();
    } else {
      getMyProfileAPI();
    }
  };

  const getOthersProfileAPI = () => {
    if (profileController) {
      profileController.abort();
    }
    profileController = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_id', userId);
    getOthersProfileService(formData, profileController.signal)
      .then(res => {
        if (res.data.status === 1) {
          const tempProfile = {
            ...res.data.profile,
            first_name: htmlDecodeText(res.data.profile?.first_name),
            name: htmlDecodeText(res.data.profile?.name),
            last_name: htmlDecodeText(res.data.profile?.last_name),
          };
          if (res.data.profile.unclaimed_status === 1) {
            setisunclaimeduserAlert({
              status: true,
              text: RAWCASTER_DEFAULT_MESSAGE.DEFAULT_UNCLAIM_MESSAGE,
            });
            setTimeout(() => {
              setisunclaimeduserAlert({
                status: false,
                text: '',
              });
            }, 5000);
          }

          if (isMount.current) {
            setothersProfile({...tempProfile});
          }
          if (tempProfile.follow) {
            dispatch(
              setFollowingUsersList([
                {
                  user_id: tempProfile.user_id,
                  follow_count: parseInt(tempProfile.followers_count),
                },
              ]),
            );
          }
        } else if (res.data.status === 0) {
          if (isMount.current) {
            setemptyText(res.data.msg);
          }
        }
        if (isMount.current) {
          setisLoading(false);
          setisRefreshing(false);
        }
      })
      .catch(e => {
        if (isMount.current) {
          if (e.message.includes('canceled')) {
            setothersProfile(null);
          } else {
            setemptyText(e.message);
            setisLoading(false);
            setisRefreshing(false);
          }
        }
      });
  };

  const setActionLoader = (status = false, text = '') => {
    setisActionLoading({
      status,
      text,
    });
  };

  const sendFriendRequestsAPICall = () => {
    if (isMount.current) {
      setActionLoader(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_ids', JSON.stringify([othersProfile?.user_ref_id]));
    sendFriendRequestsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isMount.current) {
            setothersProfile(pre => {
              return {...pre, friend_status: 1};
            });
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount.current) {
          setActionLoader(false);
        }
      });
  };

  function handleBecomeFan(userId, userRefId, followCount) {
    dispatch(
      becomeFan({
        user_id: userId,
        follow_count: followCount,
        user_ref_id: userRefId,
      }),
    );
  }

  const listNuggetsAPICall = (pageNumber = 1, tab = selectedTab) => {
    if (nuggetsController) {
      nuggetsController.abort();
    }
    nuggetsController = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', pageNumber);
    if (userId || profile?.user_id) {
      formData.append('user_id', userId ?? profile?.user_id);
    }
    if (tab === 2) {
      formData.append('saved', 1);
    }
    listNuggetsService(formData, nuggetsController.signal)
      .then(res => {
        if (isMount.current) {
          if (res.data.status === 1) {
            let decodedNuggetList = [...res.data.nuggets_list].map(item => {
              return {
                ...item,
                content: htmlDecodeText(item.content),
                original_user_name: htmlDecodeText(item.original_user_name),
                user_name: htmlDecodeText(item.user_name),
                translated_content: '',
              };
            });

            if (isMount.current) {
              if (pageNumber === 1) {
                totalPages = parseInt(res.data.total_pages);
                setnuggetsList(decodedNuggetList);
                setnuggetsCount(res.data.nuggets_count);
              } else {
                setnuggetsList(preList => [...preList, ...decodedNuggetList]);
              }
            }
          } else if (res.data.status === 0) {
            if (isMount.current) {
              setnuggetsCount(0);
              setnuggetsList([]);
            }
          }
          if (isMount.current) {
            setisLoadMore(false);
            setisRefreshing(false);
            setisListLoading(false);
          }
        }
      })
      .catch(e => {
        if (isMount.current) {
          setnuggetsCount(0);
          setnuggetsList([]);
          if (!e.message.includes('cancel')) {
            setisLoadMore(false);

            setisListLoading(false);
          }
        }
      });
  };

  const handleRemoveFriend = () => {
    if (isMount.current) {
      setActionLoader(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_id', othersProfile?.user_ref_id);
    unfriendService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isMount.current) {
            setothersProfile(pre => {
              return {...pre, friend_status: null};
            });
          }

          dispatch(
            setConnectionsList(
              [...connections].filter(
                item => item.user_ref_id !== othersProfile?.user_ref_id,
              ),
            ),
          );
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount.current) {
          setActionLoader(false);
        }
      });
  };

  const handleUnfollow = () => {
    if (isMount.current) {
      setActionLoader(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', othersProfile?.user_ref_id);
    formData.append('type', 2);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          dispatch(
            removeFollowingUser({
              user_id: othersProfile.user_id,
            }),
          );
          dispatch(getInfluencersCategoriesList());
          // dispatch(
          //   setFollowingUsersList(
          //     [...followingUsersList].filter(
          //       item => item.user_id !== othersProfile.user_id,
          //     ),
          //   ),
          // );
          if (isMount.current) {
            setothersProfile(pre => {
              return {...pre, follow: false};
            });
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount.current) {
          setActionLoader(false);
        }
      });
  };

  const onUnfollow = () => {
    if (userId) {
      Alert.alert(
        'UnFollow!',
        RAWCASTER_DEFAULT_MESSAGE.UNFOLLOW_MESSAGE,
        // `Are you sure to unfollow ${getSlicedText(othersProfile?.name, 20)}?`,
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              handleUnfollow();
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  const isShowProfile = () => {
    if (userId) {
      if (othersProfile) {
        return true;
      }
      return false;
    } else if (profile) {
      return true;
    }
    return false;
  };

  const getProfileData = () => {
    if (userId) {
      return othersProfile ?? {};
    }
    return profile ?? {};
  };

  const getNuggetsList = () => {
    let tempNuggetsList = [...nuggetsList];
    if (blockedUserIds && blockedUserIds.length > 0) {
      tempNuggetsList = [...tempNuggetsList].filter(
        item => !blockedUserIds.includes(item.user_id),
      );
    }
    if (deletedNuggetsIds && deletedNuggetsIds.length > 0) {
      tempNuggetsList = [...nuggetsList].filter(
        item => !deletedNuggetsIds.includes(item.nugget_id),
      );
    }
    if (editedNuggetsList && editedNuggetsList.length > 0) {
      tempNuggetsList = [...tempNuggetsList].reduce((resultList, item) => {
        let tempEditedItem = [...editedNuggetsList].find(
          subItem => subItem.nugget_id === item.nugget_id,
        );
        if (tempEditedItem) {
          resultList.push(tempEditedItem);
        } else {
          resultList.push(item);
        }

        return [...resultList];
      }, []);
    }
    if (translatedNuggetsList && translatedNuggetsList.length > 0) {
      tempNuggetsList = [...tempNuggetsList].reduce((resultList, item) => {
        let tempTranslatedItem = [...translatedNuggetsList].find(
          subItem => subItem.nugget_id === item.nugget_id,
        );
        if (tempTranslatedItem) {
          resultList.push({
            ...item,
            translated_content: tempTranslatedItem.translated_content,
          });
        } else {
          resultList.push(item);
        }

        return [...resultList];
      }, []);
    }
    return [...tempNuggetsList];
  };

  function getClaimAccountStatus() {
    if (unclaimedAccountsList && unclaimedAccountsList.length > 0) {
      let tempUnclaimedList = [...unclaimedAccountsList];
      const tempUnclaimedUser = tempUnclaimedList.find(
        item => item.user_id === getProfileData().user_id,
      );
      if (tempUnclaimedUser) {
        return tempUnclaimedUser.unclaimed_status;
      }
    }
    if (userId && othersProfile) {
      return othersProfile.unclaimed_status;
    }

    return 0;
  }

  function getIsDisplayVerifyAccount() {
    if (!userId && profile && parseInt(profile?.account_verify_type) !== 2) {
      return true;
    }
    return false;
  }

  function getIsDisableVerifyAccount() {
    if (profile && parseInt(profile.account_verify_type) === 1) {
      return true;
    }
    return false;
  }

  function getVerifyAccountButtonText() {
    if (profile && parseInt(profile.account_verify_type) === 1) {
      return 'Verification Pending';
    }
    return 'Verify My Account';
  }

  const keyExtractor = useCallback((item, _) => item.nugget_id.toString(), []);
  const getItemLayout = useCallback(
    (_, index) => ({
      length: insets.mediaHeight,
      offset: insets.mediaHeight * index,
      index,
    }),
    [],
  );

  function scrollNuggetsListToTop() {
    // flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  }

  const handlePlayAudio = async url => {
    handleStopAudio();
    try {
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition) === 0) {
          if (isMount.current) {
            setisReadMuted(true);
          }
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      if (isMount.current) {
        setisReadMuted(false);
      }
    }
  };

  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      if (isMount.current) {
        setisReadMuted(false);
      }
    }
  };

  const nuggetActions = {
    headerContainerHeight: 0,
    isMuted: isMuted,
    setisMuted: setisMuted,
    isAutoPlay: false,
    isFrom: 'profile',
    isFocused,
    profileFocused: isFocused,
    categoryName: 'forYou',
    scrollNuggetsListToTop: scrollNuggetsListToTop,
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: viewableItem?.nugget_id,
    isFromGlobalSearch: false,
    isEnableADDButton: false,
    isEnableTopInsetsPadding: true,
    textNuggetNumberOfLines: 15,
    isEnableHeaderContainerHeightforTopButtons: true,
    nuggetContentController: nuggetContentController,
    isReadMuted: isReadMuted,
    handlePlayAudio: handlePlayAudio,
    handleStopAudio: handleStopAudio,
    onFinishPlaying: index => {
      // if (index < nuggetsList.length - 1) {
      //   flatlistRef.current.scrollToIndex({
      //     index: index + 1,
      //   });
      // }
    },
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount.current) {
        setisLoadMore(true);
      }
      listNuggetsAPICall(currentPage);
    }
  };

  const renderNuggetItem = useCallback(renderItem, [
    getNuggetsList(),
    isMuted,
    viewableItem,
  ]);

  function renderItem({item, index}) {
    return <Nugget nugget={item} nuggetIndex={index} />;
  }

  const renderFooter = () => {
    return isLoadMore ? (
      <View style={{flex: 1, backgroundColor: COLORS.primary}}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  };

  const renderHeader = useMemo(
    () => (
      <View style={{flex: 1, backgroundColor: COLORS.white, paddingBottom: 10}}>
        <ProfileTopSection
          userId={userId}
          profile={getProfileData()}
          isEnableRemoveFriend={
            userId && othersProfile && othersProfile.friend_status === 1
          }
          isEnableFansList={
            !(userId ? Boolean(parseInt(getProfileData().lock_fans)) : false)
          }
          paddingHorizontal={PADDING_HORIZONTAL}
          onRemoveFriend={() => {
            if (userId) {
              handleRemoveFriend();
            }
          }}
          onUnfollow={onUnfollow}
        />
        <ProfileNameBioContainer
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
          claimAccountStatus={getClaimAccountStatus()}
          onPressBecomeFan={() => {
            handleBecomeFan(
              othersProfile.user_id,
              othersProfile.user_ref_id,
              othersProfile.followers_count,
            );
          }}
          onPressClaimAccount={() => {
            navigation.navigate('ClaimAccount', {
              influencerId: userId,
            });
          }}
        />
        <Divider />
        <ProfileIntroContainer
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
          isDisplayVerifyAccount={getIsDisplayVerifyAccount()}
          isDisableVerifyAccount={getIsDisableVerifyAccount()}
          verifyAccountButtonText={getVerifyAccountButtonText()}
          onPressVerifyAccount={() => {
            if (parseInt(profile?.user_status_id) === 4) {
              navigation.navigate('ClaimAccount', {
                isVerifyAccount: true,
              });
            } else {
              dispatch(
                setPremiumAlert({
                  status: true,
                  text: RAWCASTER_DEFAULT_MESSAGE.VERIFY_UPGRADE_MESSAGE,
                }),
              );
            }
          }}
        />

        {!userId ? (
          <>
            <Divider />
            <ProfilesListContainerWithSeeAll
              listType="unclaimed_influencers"
              // list={unclaimedAccountsList ?? []}
              // isExternalListOnly
              title={'Unclaimed Influencers'}
              paddingHorizontal={PADDING_HORIZONTAL}
              ProfileItemProps={{
                topRightIconContainerStyle: {
                  backgroundColor: COLORS.transparent,
                  height: 30,
                  width: 30,
                },
                topRightIconSize: 30,
              }}
            />
          </>
        ) : (
          false
        )}
        <Divider />

        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId
              ? Boolean(parseInt(getProfileData().lock_my_influencer))
              : false
          }
          listType="influencers"
          title={'Influencers'}
          paddingHorizontal={PADDING_HORIZONTAL}
        />
        <Divider />
        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId ? Boolean(parseInt(getProfileData().lock_fans)) : false
          }
          listType="fans"
          title={'Fans'}
          paddingHorizontal={PADDING_HORIZONTAL}
          isDisplayChat
          isDisplayEvent
          onPressChat={() => {
            navigation.navigate('MyFansChat');
          }}
        />
        <Divider />

        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId
              ? Boolean(parseInt(getProfileData().lock_my_connection))
              : false
          }
          list={userId ? [] : connections}
          listType="connections"
          title={'Connections'}
          paddingHorizontal={PADDING_HORIZONTAL}
        />

        {!userId ? (
          <>
            <Divider />
            <View style={styles.nuggetFilterComponent}>
              <TouchableOpacity
                style={styles.nuggetFilter}
                onPress={() => {
                  if (isMount.current) {
                    setselectedTab(1);
                    setisListLoading(true);

                    setnuggetsCount(0);
                    setnuggetsList([]);
                  }

                  listNuggetsAPICall(1, 1);
                }}>
                <StyledText
                  style={[
                    styles.nuggetFilterText,
                    {color: selectedTab === 1 ? COLORS.black : COLORS.grey},
                  ]}>
                  My Nuggets{' '}
                  {selectedTab === 1 && nuggetsCount > 0
                    ? `(${nuggetsCount})`
                    : ''}
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nuggetFilter}
                onPress={() => {
                  if (isMount.current) {
                    setselectedTab(2);
                    setisListLoading(true);

                    setnuggetsCount(0);
                    setnuggetsList([]);
                  }
                  listNuggetsAPICall(1, 2);
                }}>
                <SVGIcon icon="save_yellow" height={18} />
                <StyledText
                  style={[
                    styles.nuggetFilterText,
                    {color: selectedTab === 2 ? COLORS.black : COLORS.grey},
                  ]}>
                  Favorites{' '}
                  {selectedTab === 2 && nuggetsCount > 0
                    ? `(${nuggetsCount})`
                    : ''}
                </StyledText>
              </TouchableOpacity>
            </View>
            <Divider />

            {uploadingNuggets && uploadingNuggets.length > 0 && (
              <View style={styles.uploadingNuggetItemConteiner}>
                <ActivityIndicator size={'small'} />
                <View style={styles.uploadTextContainer}>
                  <StyledText>{`${
                    uploadingNuggets.length > 1
                      ? uploadingNuggets.length + ' '
                      : ''
                  }Nugget${
                    uploadingNuggets.length > 1 ? 's' : ''
                  } being uploaded...`}</StyledText>
                </View>
              </View>
            )}
          </>
        ) : (
          false
        )}
      </View>
    ),
    [
      userId,
      focusedNuggetUserId,
      // getProfileData(),
      // getClaimAccountStatus(),
      unclaimedAccountsList,
      othersProfile,
      profile,
      connections,
      isFocused,
      selectedTab,
      nuggetsCount,
      savedNuggetsList,
    ],
  );

  return (
    <NuggetParentActionsContext.Provider value={nuggetActions}>
      <View style={{flex: 1}}>
        <View
          style={
            !isLoading &&
            !isShowProfile() && {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }
          }>
          <CustomHomeHeader
            isEnableProfile={false}
            isEnableSearch={false}
            isEnableSettings={true}
            isEnableLive={false}
            isEnableReward
            onPressRewardButton={() => {
              navigation.navigate('ReferalSocialList');
            }}
            isEnableBack
            isEnableSafeArea
            bgColor={COLORS.primary}
            isEnableAddUserButton={
              userId &&
              othersProfile &&
              (othersProfile.friend_status === null ||
                othersProfile.friend_status === '' ||
                othersProfile.friend_status === 2)
                ? true
                : false
            }
            onPressAddUserButton={() => {
              sendFriendRequestsAPICall();
            }}
          />
        </View>
        {((focusedNuggetUserId && isFocused) || !focusedNuggetUserId) && (
          <>
            {isLoading ? (
              <Loader
                indicatorColor={COLORS.primary}
                loaderText={'Fetching Profile'}
                loaderTextColor={COLORS.primary}
              />
            ) : isShowProfile() ? (
              <FlatList
                ref={flatlistRef}
                showsVerticalScrollIndicator={false}
                data={getNuggetsList()}
                extraData={{editedNuggetsList, deletedNuggetsIds}}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                  // paddingBottom: 20,
                  backgroundColor: COLORS.white,
                }}
                refreshControl={
                  <RefreshControl
                    tintColor={COLORS.secondary}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                  />
                }
                // pagingEnabled
                // getItemLayout={getItemLayout}
                renderItem={renderNuggetItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={() => {
                  return isListLoading ? (
                    <View style={{alignItems: 'center'}}>
                      <ActivityIndicator color={COLORS.primary} size="large" />
                    </View>
                  ) : parseInt(getProfileData().lock_nugget) === 1 ? (
                    <View style={styles.lockNuggetsContainer}>
                      <SVGIcon icon="logo_R" width={'50%'} height={'50%'} />
                      <BlurOverlay />
                    </View>
                  ) : (
                    <View style={styles.lockNuggetsContainer}>
                      <StyledText style={{color: COLORS.white}}>
                        No Data Found
                      </StyledText>
                      {/* <BlurOverlay hideLock /> */}
                    </View>
                  );
                }}
                ListFooterComponent={renderFooter}
                onEndReachedThreshold={0.5}
                onEndReached={onEndReached}
              />
            ) : emptyText ? (
              <View style={styles.emptyComponent}>
                <DefaultBackground centerText={emptyText} />
              </View>
            ) : null}
            <Modal
              onRequestClose={() => {}}
              transparent
              visible={isActionLoading.status}>
              <Loader bgColor={COLORS.transparentDimColor} />
            </Modal>
          </>
        )}

        {isunclaimeduserAlert?.status && (
          <Modal
            onRequestClose={() => {}}
            // style={{zIndex: 10000}}
            transparent
            visible={isunclaimeduserAlert.status}>
            <ConfirmationPopup
              isEnableClose={false}
              isEnableNegativeButton={false}
              positiveButtonText={'Ok'}
              onPressPositiveButton={() => {
                setisunclaimeduserAlert({
                  status: false,
                  text: '',
                });
              }}
              content={isunclaimeduserAlert.text}
            />
          </Modal>
        )}

        {!isFocused && <DefaultBackground />}
      </View>
    </NuggetParentActionsContext.Provider>
  );
};

export default Profile;

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginVertical: 12,
  },
  emptyComponent: {
    flex: 1,
    backgroundColor: 'green',
  },
  lockNuggetsContainer: {
    height: DIMENSIONS.window.height,
    width: DIMENSIONS.window.width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  nuggetFilterComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    // justifyContent: 'space-between',
  },
  nuggetFilter: {
    flexDirection: 'row',
    marginRight: 10,
  },
  nuggetFilterText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 16,
  },
  uploadingNuggetItemConteiner: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  uploadTextContainer: {
    flex: 1,
    paddingLeft: 10,
  },
});
