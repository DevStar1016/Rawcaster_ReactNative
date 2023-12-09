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
import React, {useEffect, useRef, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {StackActions, useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {
  useOtherConnectionsRequestList,
  useOtherInfluencersRequestList,
  useProfile,
  useToken,
  useUnclaimedAccountsList,
} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getFollowListService,
  listAllFriendsService,
  listUnClaimAccountService,
  nuggetAndCommentLikedUserListService,
  sendFriendRequestsService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import FilterProfileSeeAllUsers from '../../../Modals/FilterProfileSeeAllUsers';
import {
  setOtherConnectionsRequestList,
  setOtherInfluencersRequestList,
  setUnclaimedAccountsList,
} from '../../../Store/Slices/HomeSlice';
import {useDispatch} from 'react-redux';
import SVGIcon from '../../../Components/SVGIcon';
import Loader from '../../../Components/Loader';
import DefaultBackground from '../../../Components/DefaultBackground';
import {RAWCASTER_DEFAULT_MESSAGE} from '../../../Utilities/Constants';

type Props = {
  initialList: [];
  userId?: any;
  listType:
    | 'connections'
    | 'influencers'
    | 'fans'
    | 'unclaimed_influencers'
    | 'nugget_agreed_users';
  title: string;
  nuggetId?: any;
};

const ProfileSeeAllUsersList = ({route}: any) => {
  const {initialList, userId, listType, title, nuggetId}: Props =
    route.params ?? {};
  const isMount = useRef(true);
  const currentPage = useRef(1);
  const totalPages = useRef(1);
  const dispatch = useDispatch();
  const unclaimedAccountsList = useUnclaimedAccountsList();
  const otherInfluencersRequestList = useOtherInfluencersRequestList();
  const otherConnectionsRequestList = useOtherConnectionsRequestList();

  const [isActionLoading, setisActionLoading] = useState(false);
  const [filterData, setfilterData] = useState(null);
  const [isOpenFilterModal, setisOpenFilterModal] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const token = useToken();
  const [isLoading, setisLoading] = useState(
    userId || initialList.length <= 0 ? true : false,
  );
  const [usersList, setusersList] = useState<any[]>(initialList ?? []);
  const navigation = useNavigation();
  const profile = useProfile();

  useEffect(() => {
    isMount.current = true;
    currentPage.current = 1;
    totalPages.current = 1;

    if (token && (userId || initialList.length <= 0)) {
      if (listType) {
        if (isMount.current) {
          setisLoading(true);
        }
        listApiCalls(1);
      } else {
        if (isMount.current) {
          setisLoading(false);
        }
      }
    } else {
      if (isMount.current) {
        setisLoading(false);
      }
    }

    return () => {
      isMount.current = false;
      currentPage.current = 1;
      totalPages.current = 1;
    };
  }, []);

  function listApiCalls(pageNumber = 1, dataToFilter?: any) {
    switch (listType) {
      case 'connections':
        connectionsListAPICall(pageNumber, dataToFilter);
        return;
      case 'fans':
        fansListAPICall(pageNumber, 2, dataToFilter);
        return;
      case 'influencers':
        fansListAPICall(pageNumber, 1, dataToFilter);
        return;
      case 'nugget_agreed_users':
        nuggetAndCommentLikedUserListAPICall(pageNumber);
        return;
      case 'unclaimed_influencers':
        unclaimedInfluencersListAPICall(pageNumber, dataToFilter);
        return;
      default:
        if (isMount.current) {
          setisLoading(false);
        }
        break;
    }
  }
  const getList = () => {
    if (listType === 'unclaimed_influencers') {
      return unclaimedAccountsList ? [...unclaimedAccountsList] : [];
    }
    return [...usersList];
  };
  function setLoaders(status = true) {
    if (isMount.current) {
      setisLoading(status);
      setisRefreshing(status);
      setisLoadMore(status);
    }
  }

  function connectionsListAPICall(pageNumber = 1, dataToFilter: any) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    if (userId) {
      formData.append('user_id', userId);
    }
    formData.append('allfriends', 1);
    formData.append('page_number', pageNumber);

    if (dataToFilter) {
      if (dataToFilter?.country) {
        formData.append('location', dataToFilter?.country?.name);
      }
      if (dataToFilter?.gender) {
        formData.append('gender', dataToFilter?.gender?.id);
      }
      if (dataToFilter?.age) {
        formData.append('age', dataToFilter?.age);
      }
    }

    listAllFriendsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount.current) {
            if (pageNumber === 1) {
              totalPages.current = parseInt(res.data.total_pages);
              setusersList(res.data.friends_list);
            } else {
              setusersList(preList => [...preList, ...res.data.friends_list]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount.current) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount.current) {
          setusersList([]);
        }
      })
      .finally(() => {
        setLoaders(false);
      });
  }

  function fansListAPICall(pageNumber = 1, type = 1, dataToFilter: any) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    if (userId) {
      formData.append('user_id', userId);
    }
    formData.append('page_number', pageNumber);
    if (dataToFilter) {
      if (dataToFilter?.country) {
        formData.append('location', dataToFilter?.country?.name);
      }
      if (dataToFilter?.gender) {
        formData.append('gender', dataToFilter?.gender?.id);
      }
      if (dataToFilter?.age) {
        formData.append('age', dataToFilter?.age);
      }
    }

    getFollowListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount.current) {
            if (pageNumber === 1) {
              totalPages.current = parseInt(res.data.total_pages);
              setusersList(res.data.follow_list);
            } else {
              setusersList(preList => [...preList, ...res.data.follow_list]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount.current) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount.current) {
          setusersList([]);
        }
      })
      .finally(() => {
        setLoaders(false);
      });
  }

  const unclaimedInfluencersListAPICall = (
    pageNumber = 1,
    dataToFilter: any,
  ) => {
    const formData = new FormData();
    formData.append('token', token);
    if (userId) {
      formData.append('user_id', userId);
    }
    formData.append('page_number', pageNumber);
    if (dataToFilter) {
      if (dataToFilter?.country) {
        formData.append('location', dataToFilter?.country?.name);
      }
      if (dataToFilter?.gender) {
        formData.append('gender', dataToFilter?.gender?.id);
      }
      if (dataToFilter?.age) {
        formData.append('age', dataToFilter?.age);
      }
    }
    listUnClaimAccountService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount.current) {
            if (pageNumber === 1) {
              totalPages.current = parseInt(res.data.total_pages);
              dispatch(setUnclaimedAccountsList(res.data.unclaim_accounts));
            } else {
              if (unclaimedAccountsList) {
                dispatch(
                  setUnclaimedAccountsList([
                    ...unclaimedAccountsList,
                    ...res.data.unclaim_accounts,
                  ]),
                );
              }
            }
          }
        }
      })
      .catch(e => {})
      .finally(() => {
        setLoaders(false);
      });
  };

  const nuggetAndCommentLikedUserListAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    if (nuggetId) {
      formData.append('id', nuggetId);
    }
    formData.append('type', 1);
    nuggetAndCommentLikedUserListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount.current) {
            if (pageNumber === 1) {
              totalPages.current = parseInt(res.data.total_pages);
              setusersList(res.data.userlist);
            } else {
              setusersList(preList => [...preList, ...res.data.userlist]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount.current) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount.current) {
          setusersList([]);
        }
      })
      .finally(() => {
        setLoaders(false);
      });
  };
  const handleSendFriendRequest = (userRefId: any, user_id: any) => {
    if (isMount.current) {
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
                friend_status: 0,
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
        if (isMount.current) {
          setisActionLoading(false);
        }
      });
  };

  const handleFollowUnfollow = (
    followUserId: any,
    type: number /* 1 - follow, 2 - unfollow */,
  ) => {
    // 1 - follow, 2 - unfollow
    if (isMount.current) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', followUserId);
    formData.append('type', type);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);

          setusersList(preList => {
            let tempList = [...preList];
            if (type === 1) {
              let tempIndex = tempList.findIndex(
                sub => sub.user_ref_id === followUserId,
              );
              if (tempIndex !== -1) {
                tempList[tempIndex] = {...tempList[tempIndex], follow: true};
              }
            } else {
              tempList = [...tempList].filter(
                item => item.user_ref_id !== followUserId,
              );
            }
            return tempList;
          });
          let tempInfluencersRequestList = [...otherInfluencersRequestList];
          if (type === 1) {
            tempInfluencersRequestList = [
              ...tempInfluencersRequestList,
              followUserId,
            ];
          } else {
            tempInfluencersRequestList = [...tempInfluencersRequestList].filter(
              userRefId => userRefId !== followUserId,
            );
          }
          dispatch(
            setOtherInfluencersRequestList([...tempInfluencersRequestList]),
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
          setisActionLoading(false);
        }
      });
  };

  function getRightIcon(item: any) {
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
      if (
        listType === 'nugget_agreed_users' &&
        item.friend_request_status === 1
      ) {
        return 'user_plus_pink';
      }
      {
        if (userId) {
          if (listType === 'connections' && item.friend_status === 0) {
            return 'user_plus_pink';
          }
          if (listType === 'influencers' && !item.follow) {
            return 'plus_rounded_fill_primary';
          }
        } else {
          if (listType === 'influencers') {
            return 'close_black';
          }
        }
      }
      return undefined;
    }
    return undefined;
  }

  // const handleUnfollow = (userRefId:string) => {
  //   if (isMount.current) {
  //     setisActionLoading(true);
  //   }
  //   const formData = new FormData();
  //   formData.append('token', token);
  //   formData.append('follow_userid', userRefId);
  //   formData.append('type', 2);
  //   followAndUnfollowService(formData)
  //     .then(res => {
  //       if (res.data.status === 1) {
  //         Toast.success(res.data.msg);
  //         dispatch(
  //           removeFollowingUser({
  //             user_id: othersProfile.user_id,
  //           }),
  //         );
  //         // dispatch(
  //         //   setFollowingUsersList(
  //         //     [...followingUsersList].filter(
  //         //       item => item.user_id !== othersProfile.user_id,
  //         //     ),
  //         //   ),
  //         // );
  //         if (isMount.current) {
  //           setothersProfile(pre => {
  //             return {...pre, follow: false};
  //           });
  //         }
  //       } else if (res.data.status === 0) {
  //         Toast.fail(res.data.msg);
  //       }
  //     })
  //     .catch(e => {
  //       Toast.fail(e.message);
  //     })
  //     .finally(() => {
  //       if (isMount.current) {
  //         setActionLoader(false);
  //       }
  //     });
  // };

  function getRightIconAction(item: any) {
    if (item.user_id !== profile?.user_id) {
      if (listType === 'unclaimed_influencers') {
        if (item.unclaimed_status === 1) {
          //@ts-ignore
          navigation.navigate('ClaimAccount', {
            influencerId: item.user_id,
          });
        }
      }
      if (
        listType === 'nugget_agreed_users' &&
        item.friend_request_status === 1
      ) {
        handleSendFriendRequest(item.user_ref_id, item.user_id);
      }
      {
        if (userId) {
          if (listType === 'connections' && item.friend_status === 0) {
            handleSendFriendRequest(item.user_ref_id, item.user_id);
          }
          if (listType === 'influencers' && !item.follow) {
            handleFollowUnfollow(item.user_ref_id, 1);
          }
        } else {
          if (listType === 'influencers') {
            Alert.alert(
              'UnFollow!',
              RAWCASTER_DEFAULT_MESSAGE.UNFOLLOW_MESSAGE,
              // `Are you sure to unfollow ${getSlicedText(
              //   item.display_name,
              //   20,
              // )}?`,
              [
                {
                  text: 'Cancel',
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    handleFollowUnfollow(item.user_ref_id, 2);
                  },
                },
              ],
              {cancelable: false},
            );
          }
        }
      }
    }
  }

  function onPressFilter() {
    if (isMount.current) {
      setisOpenFilterModal(true);
    }
  }

  const onRefresh = () => {
    currentPage.current = 1;
    totalPages.current = 1;
    if (isMount.current) {
      setisRefreshing(true);
      listApiCalls(1, filterData);
    }
  };

  const onEndReached = () => {
    currentPage.current = currentPage.current + 1;
    if (currentPage.current <= totalPages.current) {
      if (isMount.current) {
        setisLoadMore(true);
        listApiCalls(currentPage.current, filterData);
      }
    }
  };

  function onApplyFilter(filteredData: any) {
    currentPage.current = 1;
    totalPages.current = 1;
    if (isMount.current) {
      setisOpenFilterModal(false);
      setfilterData(filteredData);
      setisLoading(true);
      listApiCalls(1, filteredData);
    }
  }

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderItem = ({item}: any) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.7}
        onPress={() => {
          if (listType !== 'nugget_agreed_users') {
            const pushAction = StackActions.push('ProfileStack', {
              userId: item.user_id === profile?.user_id ? null : item.user_id,
            });
            navigation.dispatch(pushAction);
          }
        }}>
        <ProfileWithBadge
          profileImage={
            listType !== 'nugget_agreed_users'
              ? item.profile_img
              : item.profile_image
          }
          extraMargin={0}
          isEnableGradient
          padding={0}
          profileSize={50}
          containerStyle={{marginHorizontal: 10}}
        />
        <View style={styles.displayTextContainer}>
          <StyledText>
            {getSlicedText(
              listType !== 'nugget_agreed_users'
                ? item.display_name?.trim()
                : item.name?.trim(),
              15,
            )}
          </StyledText>
        </View>
        {getRightIcon(item) && (
          <View style={styles.actionButtonsContainer}>
            <SVGIcon
              icon={getRightIcon(item)}
              isButton
              onPress={() => {
                getRightIconAction(item);
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  function renderEmptyComponent() {
    return (
      <View style={[styles.emptyComponent]}>
        {/* <DefaultBackground /> */}
        <StyledText style={{color: COLORS.black, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack
        title={title}
        isEnableSafeArea
        isEnableRightIcon={
          // listType !== 'unclaimed_influencers' &&
          listType !== 'nugget_agreed_users'
        }
        rightIcon="filter_line_white"
        rightIconSize={18}
        onPressRightIcon={onPressFilter}
      />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <StyledText>{`Fetching ${title}`}</StyledText>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={getList()}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 25,
            }}
            ItemSeparatorComponent={() => {
              return <View style={{height: 10}} />;
            }}
            keyboardShouldPersistTaps={'handled'}
            onEndReachedThreshold={0.2}
            onEndReached={onEndReached}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                tintColor={COLORS.secondary}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            }
            ListEmptyComponent={renderEmptyComponent}
          />
        </View>
      )}

      <Modal
        visible={isOpenFilterModal}
        transparent
        onRequestClose={() => {
          setisOpenFilterModal(false);
        }}>
        <FilterProfileSeeAllUsers
          onSubmit={onApplyFilter}
          setModal={setisOpenFilterModal}
          preFilterData={filterData}
          //@ts-ignore
          listType={listType}
        />
      </Modal>
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default ProfileSeeAllUsersList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
  },
  displayTextContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {},
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
