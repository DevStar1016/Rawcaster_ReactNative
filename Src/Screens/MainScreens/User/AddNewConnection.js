import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import SearchInput from '../../../Components/SearchInput';
import {
  getAuthCode,
  getFilteredDuplicatesList,
  getIsEnableFriendRequest,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  searchRawcasterUsersService,
  sendFriendRequestsService,
} from '../../../Services/ApiService';
import UserItem from './UserItem';
import {setFollowingUsersList} from '../../../Store/Slices/HomeSlice';
import {becomeFan} from '../../../Store/ThunkAPIServices';
import {useNavigation} from '@react-navigation/native';
import DefaultBackground from '../../../Components/DefaultBackground';
import Toast from '../../../Components/Toast';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const AddNewConnection = () => {
  const navigation = useNavigation();
  const token = useToken();
  const profile = useProfile();
  const dispatch = useDispatch();
  const [isActionLoading, setisActionLoading] = useState(false);
  const [actionLoaderText, setactionLoaderText] = useState('');
  const [usersList, setusersList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isListLoading, setisListLoading] = useState(true);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [selectedConnectionsIds, setselectedConnectionsIds] = useState([]);
  const [searchText, setsearchText] = useState('');

  useEffect(() => {
    isMount = true;

    return () => {
      currentPage = 1;
      totalPages = 1;
      isMount = false;
    };
  }, []);

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    Keyboard.dismiss();
    if (isMount) {
      setusersList([]);
      setisListLoading(true);
    }
    usersListAPICall(1);
  }, [searchText]);

  function handleSelectUnselectUser(id) {
    let tempSelectedIdsList = [...selectedConnectionsIds];
    if (tempSelectedIdsList.includes(id)) {
      tempSelectedIdsList = tempSelectedIdsList.filter(userId => userId !== id);
    } else {
      tempSelectedIdsList.push(id);
    }
    if (isMount) {
      setselectedConnectionsIds(tempSelectedIdsList);
    }
  }

  function isSelected(id) {
    return [...selectedConnectionsIds].includes(id);
  }

  function keyExtractor(item, index) {
    return item.user_id.toString();
  }

  const usersListAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_key', searchText.trim());
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', pageNumber);
    searchRawcasterUsersService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedUsersList = [...res.data.users_list].map(item => {
              return {
                ...item,
                display_name: htmlDecodeText(item.display_name),
                first_name: htmlDecodeText(item.first_name),
                last_name: htmlDecodeText(item.last_name),
              };
            });

            const tempFollowingUsersList = getFilteredDuplicatesList(
              [...decodedUsersList],
              'user_id',
            )
              .filter(item => item.follow)
              .map(item => ({
                user_id: item.user_id,
                follow_count: item.follow_count,
              }));
            dispatch(setFollowingUsersList([...tempFollowingUsersList]));
            // getIsEnableFriendRequest(item.friend_request_status)
            const tempUsersList = [...decodedUsersList].filter(item =>
              getIsEnableFriendRequest(item.friend_request_status),
            );
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setusersList(tempUsersList);
            } else {
              setusersList(preList => [...preList, ...tempUsersList]);
            }
          } else if (res.data.status === 0) {
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
        if (isMount) {
          setisLoadMore(false);
          setisListLoading(false);
          setisRefreshing(false);
        }
      });
  };

  const handleBecomeFan = (userId, userRefId, followCount) => {
    dispatch(
      becomeFan({
        user_id: userId,
        follow_count: followCount,
        user_ref_id: userRefId,
        isEnableToast: true,
      }),
    );
  };

  const handleSendFriendRequest = (userRefId, user_id) => {
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
            let tempUserList = [...preList];
            let tempIndex = [...preList].findIndex(
              item => item.user_ref_id === userRefId,
            );
            if (tempIndex !== -1) {
              tempUserList[tempIndex] = {
                ...tempUserList[tempIndex],
                friend_request_status: 1,
              };
            }
            return tempUserList;
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
  };

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    usersListAPICall(currentPage);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        usersListAPICall(currentPage);
      }
    }
  }

  function renderFooter() {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.white} />
    ) : null;
  }

  function renderItem({item}) {
    return (
      <UserItem
        item={item}
        isSelected={isSelected(item.user_id)}
        isGroup={false}
        onPressItem={() => {
          handleSelectUnselectUser(item.user_id);
        }}
        onBecomeFan={() => {
          handleBecomeFan(item.user_id, item.user_ref_id, item.follow_count);
        }}
        onConnectionRequest={() => {
          handleSendFriendRequest(item.user_ref_id, item.user_id);
        }}
        isProfileButton
        onPressProfile={() => {
          /* @ts-ignore*/
          navigation.navigate('ProfileStack', {
            userId: item.user_id,
          });
        }}
      />
    );
  }

  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `Add New Connection`,
        isTitleCenter: true,
      }}
      isLoading={isActionLoading}
      loaderProps={{loaderText: actionLoaderText}}
      isEnableSafeArea={false}
      isEnableDefaultBackground={false}
      defaultBackgroundProps={{
        bgColor: COLORS.primaryDark,
        isEnableLoading: isListLoading,
        centerText: isListLoading
          ? 'Fetching Users List'
          : usersList.length <= 0
          ? 'No users found'
          : '',
      }}
      paddingBottom={0}
      isEnableRLogo={usersList.length <= 0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
      <DefaultBackground
        isEnableRLogo={isListLoading || usersList.length === 0}
        bgColor={COLORS.primaryDark}
        isEnableLoading={isListLoading}
        centerText={
          isListLoading
            ? 'Fetching Users List'
            : usersList.length <= 0
            ? 'No users found'
            : ''
        }
      />
      <SearchInput
        searchButtonColor={COLORS.secondary}
        marginVertical={10}
        editable={!isListLoading}
        searchWhenClickedButton={true}
        placeHolderText="Search User"
        marginHorizontal={15}
        onSearch={setsearchText}
      />
      <View style={{flex: 1}}>
        <FlatList
          bounces={false}
          data={usersList}
          renderItem={renderItem}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{
            paddingBottom: 10,
            paddingTop: 10,
            paddingHorizontal: 15,
          }}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
        />
      </View>
    </HOCView>
  );
};

export default AddNewConnection;

const styles = StyleSheet.create({});
