import {Linking, Modal} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Loader from '../Components/Loader';
import {
  useGlobalLoaderData,
  useIsVisibleInfluencers,
  usePremiumAlert,
  useSettings,
  useToken,
} from '../Utilities/StoreData';
import InfluencersList from '../Screens/Influencer/InfluencersList';
import {getAuthCode} from '../Utilities/Methods';
import {
  getInfluencerCategoryService,
  listAllFriendRequestsService,
} from '../Services/ApiService';
import {useDispatch} from 'react-redux';
import PostEditNugget from '../Screens/MainScreens/NuggetPost/PostEditNugget';
import EditProfile from '../Screens/MainScreens/EditProfile';
import {
  setInfluencerCategoryList,
  setPendingFriendRequests,
} from '../Store/Slices/HomeSlice';
import GlobalSearchStack from './GlobalSearchStack';
import SettingsStack from './SettingsStack';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ProfileStack from './ProfileStack';
import CreateEditGroup from '../Screens/MainScreens/User/CreateEditGroup';
import AddUserToGroup from '../Screens/MainScreens/User/AddUserToGroup';
import AddNewConnection from '../Screens/MainScreens/User/AddNewConnection';
import StackAnimation from '../Utilities/StackAnimation';
import {initiateAllNuggetsLoadingTotalPages} from '../Store/Slices/NuggetsListSlice';
import DashboardProfileTopTabNavigation from '../Navigation/TopTabNavigation/DashboardProfileTopTabs/DashboardProfileTopTabNavigation';
import {COLORS} from '../Utilities/Colors';
import UserChat from '../Screens/MainScreens/ChatScreens/UserChat';
import GroupChat from '../Screens/MainScreens/ChatScreens/GroupChat';
import EventHostScreen from '../Screens/MainScreens/Events/EventHost/EventHostScreen';
import ChimeSocketConnectionListener from '../Services/ChimeSocket/ListenerComponent/ChimeSocketConnectionListener';
import PlansAndPrice from '../Screens/MainScreens/PlansAndPrice';
import ConfirmationPopup from '../Modals/ConfirmationPopup';
import {setPremiumAlert} from '../Store/Slices/UtilitySlice';
import {useNavigation} from '@react-navigation/native';
import {
  getAllFriendsGroupsList,
  getAllFriendsList,
} from '../Store/ThunkAPIServices';
import ViewNugget from '../Screens/MainScreens/HomeScreen/ViewNugget';
import EventDetailScreen from '../Screens/MainScreens/EventsAndTalkshowsCommon/EventDetailScreen';
import OpenLinkingUrl from '../Utilities/OpenLinkingUrl';
const Stack = createStackNavigator();

const MainStack = () => {
  const [isLoading, setisLoading] = useState(true);
  const isVisibleInfluencers = useIsVisibleInfluencers();
  const token = useToken();
  const settings = useSettings();
  const dispatch = useDispatch();
  const globalLoaderData = useGlobalLoaderData();
  const navigation = useNavigation();
  const premiumALert = usePremiumAlert();

  useEffect(() => {
    initialAPICall();
  }, []);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', event =>
      OpenLinkingUrl(event.url),
    );
    Linking?.getInitialURL()
      .then(OpenLinkingUrl)
      .catch(e => {
        console.log(e, 'ERROR LINK');
      });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  function getCommonFormData() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    return formData;
  }

  // function getFriendsFormData() {
  //   const formData = getCommonFormData();
  //   formData.append('allfriends', 1);
  //   return formData;
  // }

  function initialAPICall() {
    Promise.all([
      // listAllFriendsService(getFriendsFormData()),
      // listAllFriendGroupsService(getCommonFormData()),
      listAllFriendRequestsService(getCommonFormData()),
      getInfluencerCategoryService(getCommonFormData()),
    ])
      // .then(res => {
      //   if (res[0].data.status === 1) {
      //     dispatch(setConnectionsList(res[0].data.friends_list));
      //   }
      //   return res;
      // })
      // .then(res => {
      //   if (res[1].data.status === 1) {
      //     dispatch(setGroupsList(res[1].data.friend_group_list));
      //   }
      //   return res;
      // })
      .then(res => {
        if (res[0].data.status === 1) {
          dispatch(setPendingFriendRequests(res[0].data.pending_requests));
        }
        return res;
      })
      .then(res => {
        if (res[1].data.status === 1) {
          dispatch(setInfluencerCategoryList(res[1].data.influencer_category));
          dispatch(
            initiateAllNuggetsLoadingTotalPages({
              categoriesList: [...res[1].data.influencer_category],
              isForYouLoading: token
                ? settings.mobile_default_page === 1
                : true,
            }),
          );
        }
        return res;
      })
      .catch(e => {})
      .finally(() => {
        setisLoading(false);
        dispatch(getAllFriendsGroupsList());
        dispatch(getAllFriendsList());
      });
  }

  return isLoading ? (
    <Loader
      loaderText={'Fetching User Profile'}
      isEnableDefaultLoaderBackground={true}
    />
  ) : (
    <>
      {/* <SocketListener /> */}
      <ChimeSocketConnectionListener />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...StackAnimation,
        }}>
        {isVisibleInfluencers ? (
          <Stack.Screen name="InfluencersList" component={InfluencersList} />
        ) : (
          <>
            <Stack.Screen
              name="DashboardProfileTopTabNavigation"
              component={DashboardProfileTopTabNavigation}
            />
            <Stack.Screen name="PostEditNugget" component={PostEditNugget} />
            <Stack.Screen name="ViewNugget" component={ViewNugget} />
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
            <Stack.Screen name="UserChat" component={UserChat} />
            <Stack.Screen name="GroupChat" component={GroupChat} />
            <Stack.Screen
              name="EventHostScreen"
              component={EventHostScreen}
              options={{
                gestureEnabled: false,
              }}
            />

            <Stack.Screen name="CreateEditGroup" component={CreateEditGroup} />
            <Stack.Screen name="AddUserToGroup" component={AddUserToGroup} />
            <Stack.Screen
              name="AddNewConnection"
              component={AddNewConnection}
            />
            <Stack.Screen
              name="EventDetailScreen"
              component={EventDetailScreen}
            />
            <Stack.Screen name="PlansAndPrice" component={PlansAndPrice} />
          </>
        )}
      </Stack.Navigator>
      {globalLoaderData?.status && (
        <Modal transparent visible={globalLoaderData?.status}>
          <Loader
            bgColor={COLORS.transparentDimColor}
            loaderText={globalLoaderData?.text}
          />
        </Modal>
      )}
      {premiumALert?.status && (
        <Modal
          onRequestClose={() => {}}
          // style={{zIndex: 10000}}
          transparent
          visible={premiumALert.status}>
          <ConfirmationPopup
            isEnableClose={false}
            onPressNegativeButton={() => {
              dispatch(
                setPremiumAlert({
                  status: false,
                  text: '',
                }),
              );
            }}
            positiveButtonText={'Upgrade'}
            negativeButtonText={'Later'}
            onPressPositiveButton={() => {
              dispatch(
                setPremiumAlert({
                  status: false,
                  text: '',
                }),
              );
              navigation.navigate('PlansAndPrice');
            }}
            content={premiumALert.text}
          />
        </Modal>
      )}
    </>
  );
};

export default MainStack;
