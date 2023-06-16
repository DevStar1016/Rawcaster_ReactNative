import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
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
  useConnectionsList,
  useInsets,
  useProfile,
  useSavedNuggetsCount,
  useSavedNuggetsList,
  useToken,
  useUnclaimedAccountsList,
} from '../../../Utilities/StoreData';
import {getAuthCode, htmlDecodeText} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getOthersProfileService,
  listNuggetsService,
  sendFriendRequestsService,
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
import {DIMENSIONS} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
import {friendRequestSocket} from '../../../Services/Socket/SocketRequests';
import {useDispatch} from 'react-redux';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {
  setSavedNuggetsCount,
  setSavedNuggetsList,
} from '../../../Store/Slices/HomeSlice';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const PADDING_HORIZONTAL = 10;

const Profile = ({route}) => {
  let isMount = true;
  let currentPage = 1;
  let totalPages = 1;
  let controller = undefined;
  const dispatch = useDispatch();
  const profile = useProfile();
  const isFocused = useIsFocused();
  const {focusedNuggetUserId} = useDashboardProfile() ?? {};
  const [userId, setuserId] = useState(
    route.params ? route.params?.userId : focusedNuggetUserId ?? null,
  );

  const navigation = useNavigation();
  const token = useToken();
  const savedNuggetsList = useSavedNuggetsList();
  const savedNuggetsCount = useSavedNuggetsCount();
  const unclaimedAccountsList = useUnclaimedAccountsList();
  const insets = useInsets();
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [isFavourites, setisFavourites] = useState(false);
  const connections = useConnectionsList();
  const flatlistRef = useRef(null);

  const [nuggetsList, setnuggetsList] = useState([]);
  const [nuggetsCount, setnuggetsCount] = useState(0);
  const [isMuted, setisMuted] = useState(true);
  const [isLoading, setisLoading] = useState(userId ? true : false);
  const [isActionLoading, setisActionLoading] = useState(false);
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
    isMount = true;

    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
      if (controller) {
        controller.abort();
      }
      controller = undefined;
      // dispatch(setOtherConnectionsList([]));
      // dispatch(setOtherInfluencersList([]));
    };
  }, []);

  useEffect(() => {
    if (!route.params?.userId) {
      setuserId(focusedNuggetUserId);
    }
  }, [focusedNuggetUserId]);

  useEffect(() => {
    if (userId) {
      if (isMount) {
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
      if (isMount) {
        setisListLoading(true);
        if (!isFavourites) {
          setnuggetsList([]);
        }
      }
      listNuggetsAPICall(1);
    }
  }, [userId, othersProfile, isFavourites]);

  const getOthersProfileAPI = () => {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_id', userId);
    getOthersProfileService(formData, controller.signal)
      .then(res => {
        if (res.data.status === 1) {
          setothersProfile({
            ...res.data.profile,
            first_name: htmlDecodeText(res.data.profile?.first_name),
            name: htmlDecodeText(res.data.profile?.name),
            last_name: htmlDecodeText(res.data.profile?.last_name),
          });
        } else if (res.data.status === 0) {
          setemptyText(res.data.msg);
        }
        if (isMount) {
          setisLoading(false);
        }
      })
      .catch(e => {
        if (e.message.includes('canceled')) {
          setothersProfile(null);
        } else {
          setemptyText(e.message);
          if (isMount) {
            setisLoading(false);
          }
        }
        console.log(e, 'ERROR OTHER PROFILE ');
      });
  };

  const sendFriendRequestsAPICall = () => {
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_ids', JSON.stringify([othersProfile?.user_ref_id]));
    sendFriendRequestsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setothersProfile(pre => {
            return {...pre, friend_status: '1'};
          });
          if (res.data?.friend_request_ids?.length > 0) {
            let data = {
              friend_request_id: res.data.friend_request_ids[0],
              display_name: profile?.name,
              profile_img: profile?.profile_image,
              user_id: profile?.user_id,
            };
            friendRequestSocket({user_id: userId, data: data});
          }
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

  function handleBecomeFan() {
    // 1 - follow, 2 - unfollow
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', othersProfile.user_ref_id);
    formData.append('type', 1);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setothersProfile(preData => {
            return {
              ...preData,
              follow: true,
            };
          });
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
  }

  const listNuggetsAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', pageNumber);
    if (userId || profile?.user_id) {
      formData.append('user_id', userId ?? profile?.user_id);
    }
    if (isFavourites) {
      formData.append('saved', 1);
    }
    listNuggetsService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedNuggetList = [...res.data.nuggets_list].map(item => {
              return {
                ...item,
                content: htmlDecodeText(item.content),
                original_user_name: htmlDecodeText(item.original_user_name),
                user_name: htmlDecodeText(item.user_name),
              };
            });

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              if (isFavourites) {
                dispatch(setSavedNuggetsCount(res.data.nuggets_count));
                dispatch(setSavedNuggetsList(decodedNuggetList));
              } else {
                setnuggetsCount(res.data.nuggets_count);
                setnuggetsList(decodedNuggetList);
              }
            } else {
              if (isFavourites) {
                dispatch(
                  setSavedNuggetsList([
                    ...savedNuggetsList,
                    ...decodedNuggetList,
                  ]),
                );
              } else {
                setnuggetsList(preList => [...preList, ...decodedNuggetList]);
              }
            }
          } else if (res.data.status === 0) {
            if (isFavourites) {
              dispatch(setSavedNuggetsList([]));
              dispatch(setSavedNuggetsCount(0));
            } else {
              setnuggetsList([]);
              setnuggetsCount(0);
            }
          }
        }
      })
      .catch(e => {
        if (isMount) {
          if (isFavourites) {
            dispatch(setSavedNuggetsList([]));
            dispatch(setSavedNuggetsCount(0));
          } else {
            setnuggetsList([]);
            setnuggetsCount(0);
          }
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisRefreshing(false);
          setisListLoading(false);
        }
      });
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

  const getNuggetList = () => {
    if (!userId && isFavourites) {
      return [...savedNuggetsList];
    }
    return [...nuggetsList];
  };

  const onFinishClaiming = () => {
    setothersProfile(pre => {
      return {...pre, unclaimed_status: 1};
    });
  };
  const onFinishDelete = nuggetId => {
    let tempSavedList = [...savedNuggetsList];
    let tempIndex = tempSavedList.findIndex(ele => ele.nugget_id === nuggetId);
    if (tempIndex !== -1) {
      dispatch(setSavedNuggetsCount(savedNuggetsCount - 1));
      dispatch(
        setSavedNuggetsList(
          tempSavedList.filter(item => item.nugget_id !== nuggetId),
        ),
      );
    }
    setnuggetsCount(pre => pre - 1);
    setnuggetsList(preList => {
      let tempList = [...preList].filter(item => item.nugget_id !== nuggetId);
      return tempList;
    });
  };

  const onFinishSave = (nuggetId, status) => {
    let tempList = [...nuggetsList];
    let tempIndex = tempList.findIndex(ele => ele.nugget_id === nuggetId);
    if (tempIndex !== -1) {
      tempList[tempIndex] = {...tempList[tempIndex], saved: status};
    }
    setnuggetsList(tempList);
  };

  function getIsEnableClaimAccount() {
    let tempUnclaimedList = [...unclaimedAccountsList];
    const tempUnclaimedUser = tempUnclaimedList.find(
      item => item.user_id === getProfileData().user_id,
    );
    if (tempUnclaimedUser) {
      return tempUnclaimedUser.unclaimed_status === 0;
    }
    return false;
  }

  function getIsDisplayVerifyAccount() {
    if (
      !userId &&
      profile &&
      parseInt(profile?.account_verify_type) !== 2 &&
      parseInt(profile?.user_status_id) === 4
    ) {
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
          setisReadMuted(true);
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      setisReadMuted(false);
    }
  };

  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      setisReadMuted(false);
    }
  };

  const nuggetActions = {
    headerContainerHeight: 0,
    isMuted: isMuted,
    setisMuted: setisMuted,
    isAutoPlay: false,
    isFrom: 'profile',
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
      if (isMount) {
        setisLoadMore(true);
        listNuggetsAPICall(currentPage);
      }
    }
  };

  const renderNuggetItem = useCallback(renderItem, [
    nuggetsList,
    isMuted,
    viewableItem,
  ]);

  function renderItem({item, index}) {
    return (
      <Nugget
        nugget={item}
        nuggetIndex={index}
        isFromProfile={true}
        onFinishDelete={onFinishDelete}
        onFinishSave={onFinishSave}
      />
    );
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
          isEnableFansList={
            !(userId ? Boolean(parseInt(getProfileData().lock_fans)) : false)
          }
          paddingHorizontal={PADDING_HORIZONTAL}
        />
        <ProfileNameBioContainer
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
          isEnableClaimAccount={getIsEnableClaimAccount()}
          onPressBecomeFan={() => {
            handleBecomeFan();
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
            navigation.navigate('ClaimAccount', {
              isVerifyAccount: true,
            });
          }}
        />

        {!userId ? (
          <>
            <Divider />
            <ProfilesListContainerWithSeeAll
              listType="unclaimed_influencers"
              list={unclaimedAccountsList}
              isExternalListOnly
              title={'Unclaimed Influencers Account'}
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
          list={userId ? [] : [...connections]}
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
                  if (isFavourites) {
                    setisFavourites(false);
                  }
                }}>
                <StyledText
                  style={[
                    styles.nuggetFilterText,
                    {color: !isFavourites ? COLORS.black : COLORS.grey},
                  ]}>
                  My Nuggets {nuggetsCount > 0 ? `(${nuggetsCount})` : ''}
                </StyledText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nuggetFilter}
                onPress={() => {
                  if (!isFavourites) {
                    setisFavourites(true);
                  }
                }}>
                <SVGIcon icon="save_yellow" height={18} />
                <StyledText
                  style={[
                    styles.nuggetFilterText,
                    {color: isFavourites ? COLORS.black : COLORS.grey},
                  ]}>
                  Favorites{' '}
                  {savedNuggetsCount > 0 ? `(${savedNuggetsCount})` : ''}
                </StyledText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          false
        )}
      </View>
    ),
    [
      userId,
      focusedNuggetUserId,
      getProfileData(),
      getIsEnableClaimAccount(),
      unclaimedAccountsList,
      connections,
      isFocused,
      isFavourites,
      nuggetsCount,
      savedNuggetsCount,
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
            isEnableBack
            onPressBack={() => {
              navigation.goBack();
            }}
            isEnableSafeArea
            bgColor={
              !isLoading && !isShowProfile()
                ? COLORS.transparent
                : COLORS.primary
            }
            isEnableAddUserButton={
              userId &&
              othersProfile &&
              (othersProfile.friend_status === null ||
                othersProfile.friend_status === '')
                ? true
                : false
            }
            onPressAddUserButton={() => {
              sendFriendRequestsAPICall();
            }}
          />
        </View>
        {isFocused && (
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
                data={getNuggetList()}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                  // paddingBottom: 20,
                  backgroundColor: COLORS.white,
                }}
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
                renderFooter={renderFooter}
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
              visible={isActionLoading}>
              <Loader bgColor={COLORS.transparentDimColor} />
            </Modal>
          </>
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
});
