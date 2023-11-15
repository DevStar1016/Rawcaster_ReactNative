import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import BottomTabNavigation from '../Navigation/BottomTabNavigation';
import EmailPhoneVerification from '../Screens/AuthScreens/EmailPhoneVerification';
import ForgotPassword from '../Screens/AuthScreens/ForgotPassword';
import Login from '../Screens/AuthScreens/Login';
import ResetPasswordOTP from '../Screens/AuthScreens/ResetPasswordOTP';
import Signup from '../Screens/AuthScreens/SignupScreens/Signup';
import SignupWithPhone from '../Screens/AuthScreens/SignupScreens/SignupWithPhone';
import StackAnimation from '../Utilities/StackAnimation';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ChimeSocketConnectionListener from '../Services/ChimeSocket/ListenerComponent/ChimeSocketConnectionListener';
import { useDispatch } from 'react-redux';
import { setMeetInviteRefId } from '../Store/Slices/MeetInviteRefIdSlice';
import OpenLinkingUrl from '../Utilities/OpenLinkingUrl';
import DashboardProfileTopTabNavigation from '../Navigation/TopTabNavigation/DashboardProfileTopTabs/DashboardProfileTopTabNavigation';
import EventHostScreen from '../Screens/MainScreens/Events/EventHost/EventHostScreen';

const Stack = createStackNavigator();

const RootStack = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentRout = useRoute();

  useEffect(() => {
    const subscription = Linking.addEventListener('url', event => {

      if (event.url?.includes('https://dev.rawcaster.com/join/event') || event.url?.includes('https://dev.rawcaster.com/join/talkshow')) {
        setTimeout(() => {
          console.log('from here 123')
          handleOpenUrl(event.url)
        }, 3000);
      }
      else {
        ////////// Change from indian team
        //////////////////////
        OpenLinkingUrl(event.url)
        ///////
        //////////
      }

    }
    );
    Linking?.getInitialURL()
      .then((url) => {
        if (url?.includes('https://dev.rawcaster.com/join/event') || url?.includes('https://dev.rawcaster.com/join/talkshow')) {
          setTimeout(() => {
            console.log('from here')
            handleOpenUrl(url);
          }, 3000);
        } else {
          ////////// Change from indian team
          //////////////////////
          OpenLinkingUrl(url);
          ////////////
        }

      })
      .catch(e => {
        console.log(e, 'ERROR LINK');
      });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);
  const handleOpenUrl = url => {
    console.log('url_received', url);



    if (url && !url.includes('rawcaster://')) {
      if (url?.includes('share')) {
        const parsed = queryString.parseUrl(url);
        Linking.openURL(`rawcaster://viewnugget/${decode(parsed.query.id)}`)
          .then(res => {
            console.log(res, 'LINKING RESPONSEE');
          })
          .catch(e => {
            console.log(e, 'ERROR   CATCH');
          });
        // Linking.openURL()
      } else {
        if (url?.includes('https://dev.rawcaster.com/join/event')) {
          console.log('incluededddddd');
          const ref_id = url.replace('https://dev.rawcaster.com/join/event/', '').trim();
          console.log('ref_id', ref_id);
          console.log('route_name', currentRout.name);

          if (currentRout.name == 'RootStack') {
            dispatch(setMeetInviteRefId(ref_id));

          } else {
            setTimeout(() => {
              dispatch(setMeetInviteRefId(ref_id));
            }, 4000);
          }
          navigation.navigate('DashboardProfileTopTabNavigation', {
            screen: 'BottomTabNavigationBeforeLogin',
            params: {
              screen: 'EventsStack',
              params: {
                screen: 'EventsPublic',
                params: {
                  ref_id: ref_id
                },
              },
            },
          });
        } else {
          if (url?.includes('https://dev.rawcaster.com/join/talkshow')) {
            const ref_id = url.replace('https://dev.rawcaster.com/join/talkshow/', '').trim();
            console.log('ref_id', ref_id);
            navigation.navigate('DashboardProfileTopTabNavigation', {
              screen: 'BottomTabNavigationBeforeLogin',
              params: {
                screen: 'TalkshowStack',
                params: {
                  screen: 'Talkshow',
                  params: {
                    ref_id: ref_id
                  },
                },
              },
            });

          }
        }
      }
    }
  };

  return (
    <>
      <ChimeSocketConnectionListener />
      <Stack.Navigator screenOptions={{ headerShown: false, ...StackAnimation }}>
        <Stack.Screen
          name="BottomTabNavigationBeforeLogin"
          component={BottomTabNavigation}
        />
        <Stack.Screen
          name="DashboardProfileTopTabNavigation"
          component={DashboardProfileTopTabNavigation}
        />

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="SignupWithPhone" component={SignupWithPhone} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen
          name="EventHostScreen"
          component={EventHostScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="EmailPhoneVerification"
          component={EmailPhoneVerification}
        />
        <Stack.Screen name="ResetPasswordOTP" component={ResetPasswordOTP} />
      </Stack.Navigator>
    </>
  );
};

export default RootStack;
