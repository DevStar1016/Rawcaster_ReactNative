import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {StackActions, useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import {friendRequestSocket} from '../../../Services/Socket/SocketRequests';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {
  getFollowListService,
  listAllFriendsService,
  sendFriendRequestsService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';

type Props = {
  initialList: [];
  userId?: any;
  listType: 'connections' | 'influencers' | 'fans';
  title: string;
};

const ProfileSeeAllUsersList = ({route}: any) => {
  let isMount = true;
  let currentPage = 1;
  let totalPages = 1;
  const {initialList, userId, listType, title}: Props = route.params ?? {};
  const [isActionLoading, setisActionLoading] = useState(false);
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
    isMount = true;
    currentPage = 1;
    totalPages = 1;
    if (token && (userId || initialList.length <= 0)) {
      if (listType) {
        if (isMount) {
          setisLoading(true);
        }
        listApiCalls(1);
      }
    }

    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  function listApiCalls(pageNumber = 1) {
    switch (listType) {
      case 'connections':
        connectionsListAPICall(pageNumber);
        return;
      case 'fans':
        fansListAPICall(pageNumber);
      case 'influencers':
        fansListAPICall(pageNumber, 2);
        return;
    }
  }

  function setLoaders(status = true) {
    if (isMount) {
      setisLoading(status);
      setisRefreshing(status);
      setisLoadMore(status);
    }
  }

  function connectionsListAPICall(pageNumber = 1) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    if (userId) {
      formData.append('group_ids', JSON.stringify([userId]));
    } else {
      formData.append('allfriends', 1);
    }
    formData.append('page_number', pageNumber);
    listAllFriendsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setusersList(res.data.friends_list);
            } else {
              setusersList(preList => [...preList, ...res.data.friends_list]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setusersList([]);
        }
      })
      .finally(() => {
        setLoaders(false);
      });
  }

  function fansListAPICall(pageNumber = 1, type = 1) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    if (userId) {
      formData.append('user_id', userId);
    }
    formData.append('page_number', pageNumber);
    getFollowListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setusersList(res.data.follow_list);
            } else {
              setusersList(preList => [...preList, ...res.data.follow_list]);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            setusersList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setusersList([]);
        }
      })
      .finally(() => {
        setLoaders(false);
      });
  }

  const handleSendFriendRequest = (userRefId: any, user_id: any) => {
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
          // setprofileList(preList => {
          //   let tempProfileList = [...preList];
          //   let tempIndex = [...preList].findIndex(
          //     item => item.user_ref_id === userRefId,
          //   );
          //   if (tempIndex !== -1) {
          //     tempProfileList[tempIndex] = {
          //       ...tempProfileList[tempIndex],
          //       friend_request_status: '1',
          //     };
          //   }
          //   return tempProfileList;
          // });
          if (res.data?.friend_request_ids?.length > 0) {
            let data = {
              friend_request_id: res.data.friend_request_ids[0],
              display_name: profile.name,
              profile_img: profile.profile_image,
              user_id: profile.user_id,
            };
            friendRequestSocket(user_id, data);
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

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
      listApiCalls(1);
    }
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listApiCalls(currentPage);
      }
    }
  };

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
          const pushAction = StackActions.push('ProfileStack', {
            userId: item.user_id,
          });
          navigation.dispatch(pushAction);
        }}>
        <ProfileWithBadge
          profileImage={item.profile_img}
          extraMargin={0}
          isEnableGradient
          padding={0}
          profileSize={50}
          containerStyle={{marginHorizontal: 10}}
        />
        <View style={styles.displayTextContainer}>
          <StyledText>{getSlicedText(item.display_name.trim(), 15)}</StyledText>
        </View>
        {/* {listType === 'connections' && (
          <View style={styles.actionButtonsContainer}>
            <RoundedPlusButton
              iconSize={20}
              style={{height: 35, width: 35, borderRadius: 35 / 2}}
              onPress={() => {
                console.log(item, 'OIPPOOI');
              }}
            />
          </View>
        )} */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title={title} isEnableSafeArea />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <StyledText>{`Fetching ${title}`}</StyledText>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={[...usersList]}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
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
          />
        </View>
      )}
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
});
