import {Modal, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Loader from '../Components/Loader';
import {
  useGlobalLoaderData,
  useIsVisibleInfluencers,
  useToken,
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
  listUnClaimAccountService,
} from '../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setMyProfile, setSettings} from '../Store/Slices/AuthSlice';
import PostEditNugget from '../Screens/MainScreens/NuggetPost/PostEditNugget';
import EditProfile from '../Screens/MainScreens/EditProfile';
import {
  setConnectionsList,
  setGroupsList,
  setInfluencerCategoryList,
  setPendingFriendRequests,
  setUnclaimedAccountsList,
  setUnreadNotificationCount,
} from '../Store/Slices/HomeSlice';
import GlobalSearchStack from './GlobalSearchStack';
import SettingsStack from './SettingsStack';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ProfileStack from './ProfileStack';
import ReferalContactsList from '../Screens/MainScreens/Settings/ReferalContactsList';
import SocketListener from '../Components/SocketListener';
import CreateEditGroup from '../Screens/MainScreens/User/CreateEditGroup';
import AddUserToGroup from '../Screens/MainScreens/User/AddUserToGroup';
import AddNewConnection from '../Screens/MainScreens/User/AddNewConnection';
import StackAnimation from '../Utilities/StackAnimation';
import {initiateAllNuggetsLoadingTotalPages} from '../Store/Slices/NuggetsListSlice';
import DashboardProfileTopTabNavigation from '../Navigation/TopTabNavigation/DashboardProfileTopTabs/DashboardProfileTopTabNavigation';
import {COLORS} from '../Utilities/Colors';
import UserChat from '../Screens/MainScreens/ChatScreens/UserChat';

const Stack = createStackNavigator();

const MainStack = () => {
  const [isLoading, setisLoading] = useState(true);
  const isVisibleInfluencers = useIsVisibleInfluencers();
  const token = useToken();
  const dispatch = useDispatch();
  const globalLoaderData = useGlobalLoaderData();

  useEffect(() => {
    initialAPICall();
  }, []);
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
      listUnClaimAccountService(getCommonFormData()),
    ])
      .then(res => {
        if (res[0].data.status === 1) {
          let profile = {...res[0].data.profile};
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
          dispatch(
            initiateAllNuggetsLoadingTotalPages(
              res[5].data.influencer_category,
            ),
          );
        }
        return res;
      })
      .then(res => {
        if (res[6].data.status === 1) {
          dispatch(setUnclaimedAccountsList(res[6].data.unclaim_accounts));
        }
        return res;
      })
      .catch(e => {
        console.log(e?.response, 'ERROR');
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
      <SocketListener />
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

            <Stack.Screen name="CreateEditGroup" component={CreateEditGroup} />
            <Stack.Screen name="AddUserToGroup" component={AddUserToGroup} />
            <Stack.Screen
              name="AddNewConnection"
              component={AddNewConnection}
            />

            <Stack.Screen
              name="ReferalContacts"
              component={ReferalContactsList}
            />
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
    </>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
