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
  getMyProfileService,
  getUserSettingsService,
  listAllFriendGroupsService,
  listAllFriendRequestsService,
  listAllFriendsService,
} from '../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setMyProfile, setSettings} from '../Store/Slices/AuthSlice';
import OTPVerification from '../Screens/AuthScreens/OTPVerification';
import PostEditNugget from '../Screens/MainScreens/NuggetPost/PostEditNugget';
import EditProfile from '../Screens/MainScreens/EditProfile';
import {
  setConnectionsList,
  setGroupsList,
  setPendingFriendRequests,
} from '../Store/Slices/HomeSlice';
import ConnectSocket, {socketListen} from '../Services/Socket/Socket';
import ConectionRequestModal from '../Modals/ConectionRequestModal';
import {SocketEvents} from '../Services/Socket/SocketEvents';
import GlobalSearchStack from './GlobalSearchStack';
import SettingsStack from './SettingsStack';

const Stack = createStackNavigator();

const MainStack = () => {
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
            // friendStatusHandler(message);
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
    ])
      .then(res => {
        if (res[0].data.status === 1) {
          let profile = {...res[0].data.profile};
          profile = {
            ...profile,
            name: htmlDecodeText(profile.name),
            first_name: htmlDecodeText(profile.first_name),
            last_name: htmlDecodeText(profile.last_name),
            bio_data: htmlDecodeText(profile.bio_data),
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
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
            <Stack.Screen
              name="GlobalSearchStack"
              component={GlobalSearchStack}
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
