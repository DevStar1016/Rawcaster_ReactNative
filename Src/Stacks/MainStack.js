import {Modal, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigation from '../Navigation/BottomTabNavigation';
import Loader from '../Components/Loader';
import {
  useIsVisibleInfluencers,
  usePendingFriendRequests,
  useToken,
  useUserData,
} from '../Utilities/StoreData';
import InfluencersList from '../Screens/Influencer/InfluencersList';
import {getAuthCode, htmlDecodeText} from '../Utilities/Methods';
import {
  getInfluencerCategoryService,
  getMyProfileService,
  getUserSettingsService,
  listAllFriendGroupsService,
  listAllFriendRequestsService,
  listAllFriendsService,
} from '../Services/ApiService';
import {useDispatch, useStore} from 'react-redux';
import {setMyProfile, setSettings} from '../Store/Slices/AuthSlice';
import PostEditNugget from '../Screens/MainScreens/NuggetPost/PostEditNugget';
import EditProfile from '../Screens/MainScreens/EditProfile';
import {
  setConnectionsList,
  setGroupsList,
  setInfluencerCategoryList,
  setPendingFriendRequests,
} from '../Store/Slices/HomeSlice';
import ConnectSocket, {socketListen} from '../Services/Socket/Socket';
import ConectionRequestModal from '../Modals/ConectionRequestModal';
import {SocketEvents} from '../Services/Socket/SocketEvents';
import GlobalSearchStack from './GlobalSearchStack';
import SettingsStack from './SettingsStack';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ProfileStack from './ProfileStack';
import moment from 'moment';
import ReferalContactsList from '../Screens/MainScreens/Settings/ReferalContactsList';

const Stack = createStackNavigator();

const MainStack = () => {
  const store = useStore();
  const [isLoading, setisLoading] = useState(true);
  const isVisibleInfluencers = useIsVisibleInfluencers();
  const token = useToken();
  const dispatch = useDispatch();
  const pendingFriendRequests = usePendingFriendRequests();
  const user = useUserData();
  const [isShowFriendRequestModal, setisShowFriendRequestModal] =
    useState(false);
  const [socketFriendRequestData, setsocketFriendRequestData] = useState(null);

  useEffect(() => {
    if (user) {
      ConnectSocket(user.user_id);
    }
    initialAPICall();
  }, []);

  useEffect(() => {
    socketListen.on('connect', () => {
      console.log(socketListen.connected, 'socket status');
    });
    socketListen.on('disconnect', () => {
      console.log('disconnect', 'socket status');
    });

    socketListen.on(
      'message',
      message => {
        console.log(message, 'Socket Received Message');
        switch (message.event) {
          case SocketEvents.friendRequest:
            handleSocketFriendRequests(message?.data);
            break;
          case SocketEvents.friendResponse:
            // FriendResponse(message);
            break;
          case SocketEvents.friendStatus:
            handleSocketFriendOnlineStatus(message);
            break;
        }
      },
      [],
    );

    socketListen.on(
      'groupchatting',
      message => {
        console.log('SocketListen  groupchatting on in Dashboard');

        switch (message.event) {
          case 'groupchatmessage':
            console.log(message, 'GROUP CHAT RECEIVED');
            break;
          case 'groupchatmessagedelete':
            break;
          case 'groupchatmessageupdate':
            break;
          case 'grouptyping':
            break;
          case 'groupchatenable':
            break;
          case 'groupchatmsgtransfer':
            break;
        }
      },
      [],
    );

    return () => {
      console.log('OFF SOCKET');
      socketListen.off('call');
    };
  }, []);

  function handleSocketFriendRequests(data) {
    setsocketFriendRequestData(data);
    setisShowFriendRequestModal(true);
  }

  function handleSocketFriendOnlineStatus(message) {
    let tempFriends = store.getState().home.connectionsList;
    let newFriendList = [...tempFriends];

    const index = newFriendList.findIndex(
      ele => parseInt(ele.user_id) === parseInt(message.friendid),
    );
    if (
      index > -1 &&
      (newFriendList[index].online === 0 || newFriendList[index].online === 1)
    ) {
      let login_from_web = newFriendList[index].login_from_web;
      let login_from_app = newFriendList[index].login_from_app;

      if (message.login_in === 2 && message.status === 1) {
        login_from_app = 1;
      } else if (message.login_in === 2 && message.status === 0) {
        login_from_app = 0;
      }

      if (message.login_in === 1 && message.status === 1) {
        login_from_web = 1;
      } else if (message.login_in === 1 && message.status === 0) {
        login_from_web = 0;
      }
      if (login_from_app === 0 && login_from_web === 0) {
        newFriendList[index].online = 0;
        newFriendList[index].last_seen = message.last_seen;
        newFriendList[index].login_from_app = login_from_app;
        newFriendList[index].login_from_web = login_from_web;
      } else {
        newFriendList[index].online = 1;
        newFriendList[index].last_seen = message.last_seen;
        newFriendList[index].login_from_app = login_from_app;
        newFriendList[index].login_from_web = login_from_web;
      }
    }
    newFriendList.sort((a, b) => {
      // if (a.online !== b.online) {
      //   return a.online ? -1 : 1;
      // }
      return (
        moment(b.last_msg_datetime ? b.last_msg_datetime : '1970-01-02').format(
          'X',
        ) -
        moment(a.last_msg_datetime ? a.last_msg_datetime : '1970-01-02').format(
          'X',
        )
      );
    });
    dispatch(setConnectionsList(newFriendList));
  }

  function getCommonFormData() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    return formData;
  }

  function getFriendsFormData() {
    const formData = getCommonFormData();
    formData.append('allfriends', 1);
    return formData;
  }

  function initialAPICall() {
    Promise.all([
      getMyProfileService(getCommonFormData()),
      getUserSettingsService(getCommonFormData()),
      listAllFriendsService(getFriendsFormData()),
      listAllFriendGroupsService(getCommonFormData()),
      listAllFriendRequestsService(getCommonFormData()),
      getInfluencerCategoryService(getCommonFormData()),
    ])
      .then(res => {
        if (res[0].data.status === 1) {
          console.log(res[0].data.profile, 'PROFILEEEE');
          let profile = {...res[0].data.profile};
          profile = {
            ...profile,
            name: htmlDecodeText(profile?.name),
            first_name: htmlDecodeText(profile?.first_name),
            last_name: htmlDecodeText(profile?.last_name),
            bio_data: htmlDecodeText(profile?.bio_data),
          };
          dispatch(setMyProfile(profile));
        }
        return res;
      })
      .then(res => {
        if (res[1].data.status === 1) {
          dispatch(setSettings(res[1].data.settings));
        }
        return res;
      })
      .then(res => {
        if (res[2].data.status === 1) {
          dispatch(setConnectionsList(res[2].data.friends_list));
        }
        return res;
      })
      .then(res => {
        if (res[3].data.status === 1) {
          dispatch(setGroupsList(res[3].data.friend_group_list));
        }
        return res;
      })
      .then(res => {
        if (res[4].data.status === 1) {
          dispatch(setPendingFriendRequests(res[4].data.pending_requests));
        }
        return res;
      })
      .then(res => {
        if (res[5].data.status === 1) {
          dispatch(setInfluencerCategoryList(res[5].data.influencer_category));
        }
        return res;
      })
      .catch(e => {
        console.log(e, 'INITIAL API ERROR');
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  return isLoading ? (
    <Loader
      loaderText={'Fetching User Profile'}
      isEnableDefaultLoaderBackground={true}
    />
  ) : (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isVisibleInfluencers ? (
          <Stack.Screen name="InfluencersList" component={InfluencersList} />
        ) : (
          <>
            <Stack.Screen
              name="BottomTabNavigationAfterLogin"
              component={BottomTabNavigation}
            />
            <Stack.Screen name="PostEditNugget" component={PostEditNugget} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="SettingsStack" component={SettingsStack} />
            <Stack.Screen
              name="EmailPhoneVerification"
              component={EmailPhoneVerification}
            />
            <Stack.Screen
              name="GlobalSearchStack"
              component={GlobalSearchStack}
            />
            <Stack.Screen name="ProfileStack" component={ProfileStack} />
            <Stack.Screen
              name="ReferalContacts"
              component={ReferalContactsList}
            />
          </>
        )}
      </Stack.Navigator>
      <Modal
        visible={isShowFriendRequestModal}
        onRequestClose={() => {
          setisShowFriendRequestModal(false);
        }}
        transparent>
        <ConectionRequestModal
          onClose={() => {
            setisShowFriendRequestModal(false);
          }}
          socketData={socketFriendRequestData}
        />
      </Modal>
    </>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
