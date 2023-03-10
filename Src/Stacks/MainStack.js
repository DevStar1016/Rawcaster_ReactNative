import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomTabNavigation from '../Navigation/BottomTabNavigation';
import Loader from '../Components/Loader';
import {COLORS} from '../Utilities/Colors';
import {useIsVisibleInfluencers, useToken} from '../Utilities/StoreData';
import InfluencersList from '../Screens/Influencer/InfluencersList';
import {getAuthCode, htmlDecodeText} from '../Utilities/Methods';
import {getMyProfileService} from '../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../Store/Slices/AuthSlice';
import OTPVerification from '../Screens/AuthScreens/OTPVerification';
import PostNugget from '../Screens/MainScreens/NuggetPost/PostNugget';
import MyProfile from '../Screens/MainScreens/MyProfile';
import GlobalSearchStack from './GlobalSearchStack';

const Stack = createStackNavigator();

const MainStack = () => {
  const [isLoading, setisLoading] = useState(true);
  const isVisibleInfluencers = useIsVisibleInfluencers();
  const token = useToken();
  const dispatch = useDispatch();

  useEffect(() => {
    initialAPICall();
  }, []);

  const getCommonFormData = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    return formData;
  };

  const initialAPICall = () => {
    Promise.all([getMyProfileService(getCommonFormData())])
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
      .catch(e => {
        console.log(e, 'INITIAL API ERROR');
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  return isLoading ? (
    <Loader
      loaderText={'Fetching User Profile'}
      isEnableDefaultLoaderBackground={true}
    />
  ) : (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isVisibleInfluencers ? (
        <Stack.Screen name="InfluencersList" component={InfluencersList} />
      ) : (
        <>
          <Stack.Screen
            name="BottomTabNavigationAfterLogin"
            component={BottomTabNavigation}
          />
          <Stack.Screen name="PostNugget" component={PostNugget} />
          <Stack.Screen name="MyProfile" component={MyProfile} />
          <Stack.Screen name="OTPVerification" component={OTPVerification} />
          {/* <Stack.Screen
            name="GlobalSearchStack"
            component={GlobalSearchStack}
          /> */}
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainStack;

const styles = StyleSheet.create({});
