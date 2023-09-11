import {AppState} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import Geocode from 'react-geocode';
import LoginIntro from './Src/Screens/IntroScreens.js/LoginIntro';
import {
  INTRO_SCREEN_SEEN,
  ISLOGIN,
} from './Src/Utilities/EncryptedStoreConstants';
import {
  setMyProfile,
  setSettings,
  setToken,
} from './Src/Store/Slices/AuthSlice';
import {useToken} from './Src/Utilities/StoreData';
import MainStack from './Src/Stacks/MainStack';
import RootStack from './Src/Stacks/RootStack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './Src/Components/CustomStatusBar';
import axios from 'axios';
import {
  getAuthCode,
  htmlDecodeText,
  removeToken,
} from './Src/Utilities/Methods';
import Toast from './Src/Components/Toast';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {createStackNavigator} from '@react-navigation/stack';
import {setInsets, setIsAppForeground} from './Src/Store/Slices/UtilitySlice';
import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_SIGNIN_IOS_CLIENT_ID,
} from './Src/Services/APIKeysIds';
import DefaultBackground from './Src/Components/DefaultBackground';
import {
  getMyProfileService,
  getUserSettingsService,
} from './Src/Services/ApiService';
import {setUnreadNotificationCount} from './Src/Store/Slices/HomeSlice';
import {deeplinking1} from './Src/Utilities/LinkingConfig';

const Stack = createStackNavigator();
// var tokenFetchingTimer = undefined;
const App = () => {
  const [isIntroSeen, setisIntroSeen] = useState(false);
  const dispatch = useDispatch();
  const token = useToken();
  const [isFetchingToken, setisFetchingToken] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        dispatch(setIsAppForeground(true));
      } else if (
        (appState.current.match(/active/) && nextAppState === 'inactive') ||
        nextAppState === 'background'
      ) {
        dispatch(setIsAppForeground(false));
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: GOOGLE_SIGNIN_IOS_CLIENT_ID,
    });
    Geocode.setApiKey(GOOGLE_PLACES_API_KEY);
    // return () => tokenFetchingTimer && clearTimeout(tokenFetchingTimer);
  }, []);

  useEffect(() => {
    async function getIsIntroSeen() {
      try {
        const intro = await EncryptedStorage.getItem(INTRO_SCREEN_SEEN);
        if (intro) {
          setisIntroSeen(true);
        }
        const token = await EncryptedStorage.getItem(ISLOGIN);
        if (token) {
          dispatch(setToken(token));
        } else {
          setisFetchingToken(false);
          SplashScreen.hide();
        }

        // setTokenFetched();
      } catch (e) {
        // setTokenFetched();
        setisFetchingToken(false);
      }
    }
    getIsIntroSeen();
  }, []);

  useEffect(() => {
    if (token) {
      splashAPICalls(token);
    }
  }, [token]);

  // function setTokenFetched() {
  //   tokenFetchingTimer = setTimeout(() => {
  //     setisFetchingToken(false);
  //     clearTimeout(tokenFetchingTimer);
  //   }, 1000);
  // }

  async function onSkipIntro() {
    setisIntroSeen(true);
    try {
      await EncryptedStorage.setItem(INTRO_SCREEN_SEEN, 'true');
    } catch (error) {}
  }

  const splashAPICalls = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    Promise.all([
      getMyProfileService(formData),
      getUserSettingsService(formData),
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
          console.log(profile, 'PROFILE');

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
      .catch(e => {})
      .finally(() => {
        setisFetchingToken(false);
        SplashScreen.hide();
      });
  };

  axios.interceptors.response.use(
    async response => {
      if (response.data.status === -1) {
        removeToken(dispatch);
        Toast.fail(response.data.msg);
      }
      return response;
    },
    error => Promise.reject(error),
  );

  return (
    <SafeAreaProvider
      style={{flex: 1}}
      onLayout={e => {
        dispatch(
          setInsets({
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            mediaHeight: e.nativeEvent.layout.height,
          }),
        );
      }}>
      <CustomStatusBar />

      {isFetchingToken ? (
        <DefaultBackground />
      ) : // <AsyncFetchIntro />
      isIntroSeen ? (
        <NavigationContainer linking={deeplinking1}>
          <Stack.Navigator>
            {token ? (
              <Stack.Screen
                options={{headerShown: false}}
                name="MainStack"
                component={MainStack}
              />
            ) : (
              <Stack.Screen
                options={{headerShown: false}}
                name="RootStack"
                component={RootStack}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <LoginIntro onSkipIntro={onSkipIntro} />
      )}
    </SafeAreaProvider>
  );
};

export default App;
