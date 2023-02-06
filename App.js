import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useDispatch} from 'react-redux';
import LoginIntro from './Src/Screens/IntroScreens.js/LoginIntro';
import {
  INTRO_SCREEN_SEEN,
  ISLOGIN,
} from './Src/Utilities/EncryptedStoreConstants';
import {StoreToken} from './Src/Store/Slices/AuthSlice';
import {useStatusBarColor, useToken} from './Src/Utilities/StoreData';
import MainStack from './Src/Stacks/MainStack';
import RootStack from './Src/Stacks/RootStack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import CustomStatusBar from './Src/Components/CustomStatusBar';
import {COLORS} from './Src/Utilities/Colors';

const App = () => {
  const [isIntroSeen, setisIntroSeen] = useState(false);
  const dispatch = useDispatch();
  const token = useToken();
  const statusBarColor = useStatusBarColor();

  useEffect(() => {
    const getIsIntroSeen = async () => {
      try {
        const intro = await EncryptedStorage.getItem(INTRO_SCREEN_SEEN);
        if (intro) {
          setisIntroSeen(true);
        }
        const token = await EncryptedStorage.getItem(ISLOGIN);
        if (token) {
          dispatch(StoreToken(token));
        }
      } catch (e) {}
      RNBootSplash.hide({fade: true, duration: 100});
    };
    getIsIntroSeen();
  }, []);

  const onSkipIntro = async () => {
    setisIntroSeen(true);
    try {
      await EncryptedStorage.setItem(INTRO_SCREEN_SEEN, 'true');
    } catch (error) {}
  };

  return (
    <SafeAreaProvider>
      <CustomStatusBar
        barBackgroundColor={statusBarColor ? statusBarColor : COLORS.white}
        isContentLight={statusBarColor ? true : false}
      />
      {isIntroSeen ? (
        <NavigationContainer>
          {token ? <MainStack /> : <RootStack />}
        </NavigationContainer>
      ) : (
        <LoginIntro onSkipIntro={onSkipIntro} />
      )}
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
