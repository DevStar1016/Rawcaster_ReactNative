import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  useBlockedUserIds,
  useConnectionsList,
  useConnectionsListLoading,
  usePendingFriendRequests,
  useToken,
} from '../../../Utilities/StoreData';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import SVGIcon from '../../../Components/SVGIcon';
import {useMyConnections} from '../../../Utilities/Contexts';
import {useDispatch} from 'react-redux';
import {
  listAllFriendRequestsService,
  listAllFriendsService,
} from '../../../Services/ApiService';
import {
  setConnectionsList,
  setPendingFriendRequests,
} from '../../../Store/Slices/HomeSlice';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {respondToFriendRequestsService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {useNavigation} from '@react-navigation/native';
import DefaultBackground from '../../../Components/DefaultBackground';

var isMount = true;
const ConnectionsList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const blockedUserIds = useBlockedUserIds();
  const pendingConnectionRequests = usePendingFriendRequests();
  const connectionsList = useConnectionsList();
  const isLoadingConnectionsList = useConnectionsListLoading();
  const {searchText} = useMyConnections();
  const [refreshing, setrefreshing] = useState(false);
  const [actionLoaderText, setactionLoaderText] = useState('');
  const [isActionLoading, setisActionLoading] = useState(false);
  const [isShowAddButton, setisShowAddButton] = useState(true);
  const listViewOffset = useRef(0);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const handleResponseFriendRequest = (
    friendRequestId,
    responseType, // 1-accept, 2 - reject, 3 - block
  ) => {
    if (isMount) {
      setactionLoaderText(
        `${responseType === 1 ? 'Accepting ' : 'Rejecting'} Friend Request`,
      );
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('friend_request_id', friendRequestId);
    formData.append('response', responseType);
    respondToFriendRequestsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (responseType === 1) {
            dispatch(
              setConnectionsList([
                {...res.data.friend_details},
                ...connectionsList,
              ]),
            );
          }
          dispatch(
            setPendingFriendRequests(
              [...pendingConnectionRequests].filter(
                item => item.friend_request_id !== friendRequestId,
              ),
            ),
          );
        } else {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
          setactionLoaderText('');
        }
      });
  };

  function listAPICalls() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('allfriends', 1);
    Promise.all([
      listAllFriendsService(formData),
      listAllFriendRequestsService(formData),
    ])
      .then(res => {
        if (res[0].data.status === 1) {
          dispatch(setConnectionsList(res[0].data.friends_list));
        }

        if (res[1].data.status === 1) {
          dispatch(setPendingFriendRequests(res[1].data.pending_requests));
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setrefreshing(false);
        }
      });
  }

  function onRefresh() {
    if (isMount) {
      setrefreshing(true);
      listAPICalls();
    }
  }

  const onScrollEvent = event => {
    const CustomLayoutAnimation = {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    };

    let currentOffset = event.nativeEvent.contentOffset.y;
    const direction =
      currentOffset > 0 && currentOffset > listViewOffset.current
        ? 'down'
        : 'up';
    const isEnableButton = direction === 'up';
    if (isEnableButton !== isShowAddButton) {
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      setisShowAddButton(isEnableButton);
    }
    listViewOffset.current = currentOffset;
  };

  function getList() {
    let tempConnectionsList = [
      ...pendingConnectionRequests,
      ...connectionsList,
    ];
    if (blockedUserIds && blockedUserIds.length > 0) {
      tempConnectionsList = [...tempConnectionsList].filter(
        item => !blockedUserIds.includes(item.user_id),
      );
    }

    if (searchText && searchText.trim()) {
      return [...tempConnectionsList].filter(item =>
        item.display_name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...tempConnectionsList];
  }

  function keyExtractor(item, index) {
    return index.toString();
    // return item.user_id.toString();
  }

  function renderItem({item, index}) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        disabled={typeof item.online === typeof undefined}
        onPress={() => {
          navigation.navigate('UserChat', {
            userData: item,
          });
        }}>
        <View style={styles.subContainer}>
          <ProfileWithBadge
            profileImage={item.profile_img}
            padding={0}
            isEnableOnlineOfflineStatus={
              typeof item.online !== typeof undefined
            }
            isOnline={parseInt(item.online) === 1}
            topRightIconContainerStyle={{
              top: 2,
              right: 0,
            }}
            profileSize={50}
            extraMargin={0}
          />
          <View style={styles.titleTextContainer}>
            <StyledText style={styles.nameText}>
              {getSlicedText(item.display_name, 20)}
            </StyledText>
            <StyledText style={styles.messageText}>
              {/* {getSlicedText(item.last_msg, 30)} */}Lorem ipsum dolor sit
              ame ...
            </StyledText>
          </View>
        </View>

        <View style={styles.actionIconsContainer}>
          {typeof item.online === typeof undefined ? (
            <>
              <RoundedIconButton
                buttonSize={23}
                bgColor={COLORS.green}
                icon="tick"
                iconSize={16}
                onPress={() => {
                  handleResponseFriendRequest(item.friend_request_id, 1);
                }}
              />
              <RoundedIconButton
                buttonSize={23}
                bgColor={COLORS.white}
                icon="close_black"
                iconSize={18}
                buttonStyle={{marginLeft: 10}}
                onPress={() => {
                  handleResponseFriendRequest(item.friend_request_id, 2);
                }}
              />
            </>
          ) : (
            <>
              <SVGIcon
                icon="audio_call_white"
                height={22}
                width={22}
                isButton
                marginLeft={10}
              />
              <SVGIcon isButton icon="video_call_white" marginLeft={20} />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {isLoadingConnectionsList || getList().length <= 0 ? (
        <View style={styles.emptyListContainer}>
          {isLoadingConnectionsList ? (
            <>
              <ActivityIndicator size={'large'} color={COLORS.white} />
              <StyledText style={{color: COLORS.white}}>
                Fetching Connections
              </StyledText>
            </>
          ) : (
            <StyledText style={styles.emptyListText}>
              No connections found
            </StyledText>
          )}
        </View>
      ) : (
        <FlatList
          data={getList()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          onScroll={onScrollEvent}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
      {/* {getList().length > 0 ? (
        <FlatList
          data={getList()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          onScroll={onScrollEvent}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <View style={styles.emptyListContainer}>
          {isLoadingConnectionsList ? (
            <ActivityIndicator size={'large'} color={COLORS.white} />
          ) : (
            <StyledText style={styles.emptyListText}>No data found</StyledText>
          )}
        </View>
      )} */}
      {isShowAddButton && (
        <RoundedPlusButton
          style={styles.addButton}
          onPress={() => {
            navigation.navigate('AddNewConnection');
          }}
        />
      )}
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={actionLoaderText}
        />
      </Modal>
    </View>
  );
};

export default ConnectionsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    paddingHorizontal: 10,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    marginVertical: 2,
  },
  messageText: {
    color: COLORS.white,
    opacity: 0.7,
    marginVertical: 2,
  },
  actionIconsContainer: {
    flexDirection: 'row',
  },
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
