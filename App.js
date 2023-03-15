import {AppState, Modal} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import ToastContainer from 'react-native-toast-message';
import Geocode from 'react-geocode';
import LoginIntro from './Src/Screens/IntroScreens.js/LoginIntro';
import {
  INTRO_SCREEN_SEEN,
  ISLOGIN,
  USER_DATA,
} from './Src/Utilities/EncryptedStoreConstants';
import {setToken, setUserData} from './Src/Store/Slices/AuthSlice';
import {useIsGlobalLoading, useToken} from './Src/Utilities/StoreData';
import MainStack from './Src/Stacks/MainStack';
import RootStack from './Src/Stacks/RootStack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './Src/Components/CustomStatusBar';
import {COLORS} from './Src/Utilities/Colors';
import ToastConfig from './Src/Utilities/ToastConfig';
import Loader from './Src/Components/Loader';
import axios from 'axios';
import {removeToken} from './Src/Utilities/Methods';
import Toast from './Src/Components/Toast';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  GOOGLE_PLACES_API_KEY,
  GOOGLE_SIGNIN_IOS_CLIENT_ID,
} from './Src/Services/ServiceConstants';
import {createStackNavigator} from '@react-navigation/stack';
import {setInsets, setIsAppForeground} from './Src/Store/Slices/UtilitySlice';
import {IS_IOS} from './Src/Utilities/Constants';
import AsyncFetchIntro from './Src/Screens/IntroScreens.js/AsyncFetchIntro';

const Stack = createStackNavigator();
var tokenFetchingTimer = undefined;
const App = () => {
  const [isIntroSeen, setisIntroSeen] = useState(false);
  const dispatch = useDispatch();
  const token = useToken();
  const isGlobalLoading = useIsGlobalLoading();
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
    return () => tokenFetchingTimer && clearTimeout(tokenFetchingTimer);
  }, []);

  useEffect(() => {
    if (!IS_IOS) {
      SplashScreen.hide();
    }
    const getIsIntroSeen = async () => {
      try {
        const intro = await EncryptedStorage.getItem(INTRO_SCREEN_SEEN);
        if (intro) {
          setisIntroSeen(true);
        }
        const token = await EncryptedStorage.getItem(ISLOGIN);
        const userData = await EncryptedStorage.getItem(USER_DATA);
        if (token) {
          dispatch(setToken(token));
        }
        if (userData) {
          dispatch(setUserData(JSON.parse(userData)));
        }
        setTokenFetched();
      } catch (e) {
        setTokenFetched();
      }
    };
    getIsIntroSeen();
  }, []);

  const setTokenFetched = () => {
    tokenFetchingTimer = setTimeout(() => {
      setisFetchingToken(false);
      clearTimeout(tokenFetchingTimer);
    }, 1000);
  };

  const onSkipIntro = async () => {
    setisIntroSeen(true);
    try {
      await EncryptedStorage.setItem(INTRO_SCREEN_SEEN, 'true');
    } catch (error) {}
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
        <AsyncFetchIntro />
      ) : isIntroSeen ? (
        <NavigationContainer>
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
      <ToastContainer
        visibilityTime={3000}
        config={ToastConfig}
        topOffset={40}
      />
      <Modal onRequestClose={() => {}} transparent visible={isGlobalLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </SafeAreaProvider>
  );
};

export default App;
