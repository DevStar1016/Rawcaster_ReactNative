import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch} from 'react-redux';
import {Modal} from 'react-native';
import HomeStack from '../Stacks/HomeStack';
import CustomBottomTabBar from './CustomBottomTabBar';
import {
  useIsOpenLoginAlert,
  useIsOpenVerifyPopup,
  useProfile,
  useSettings,
  useToken,
} from '../Utilities/StoreData';
import ConfirmationPopup from '../Modals/ConfirmationPopup';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import Toast from '../Components/Toast';
import VerificationMethodChoose from '../Modals/VerificationMethodOptions';
import {
  setIsBottomTabBarAbsolute,
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
  setTabNuggetType,
} from '../Store/Slices/UtilitySlice';
import TalkshowStack from '../Stacks/TalkshowStack';
import EventsStack from '../Stacks/EventsStack';
import UsersStack from '../Stacks/UsersStack';
import NotificationsStack from '../Stacks/NotificationsStack';
import {useDashboardProfile} from '../Utilities/Contexts';
import {IS_ENABLE_CHIME_FUNCTIONALITY} from '../Utilities/Constants';

const Tab = createBottomTabNavigator();
export default function BottomTabNavigation() {
  const navigation = useNavigation();
  const settings = useSettings();
  const dispatch = useDispatch();
  const token = useToken();
  const profile = useProfile();
  const isOpenLoginALert = useIsOpenLoginAlert();
  const isOpenVerifyPopup = useIsOpenVerifyPopup();
  const {setswipeEnabled} = useDashboardProfile() ?? {};

  const [isOpenVerificationOptions, setisOpenVerificationOptions] =
    useState(false);

  useEffect(() => {
    dispatch(
      setIsOpenVerifyPopup(
        token && profile && profile?.acc_verify_status === 0,
      ),
    );
  }, [token]);

  /**
   * Handles the account verification process.
   * This function is triggered when the user clicks on the account verification button.
   * It performs the necessary actions based on the user's account verification status and profile information.
   * @returns None
   */
  const handleAccountVerification = () => {
    dispatch(setIsOpenVerifyPopup(false));
    if (profile?.acc_verify_status === 0 && profile?.is_profile_updated === 1) {
      if (
        profile?.two_type_verification === 1 &&
        profile?.mobile &&
        profile?.email_id
      ) {
        setisOpenVerificationOptions(true);
      } else if (profile?.email_id) {
        navigation.navigate('EmailPhoneVerification', {
          otpType: 'email',
        });
      } else if (profile?.mobile) {
        navigation.navigate('EmailPhoneVerification', {
          otpType: 'sms',
        });
      } else {
        Toast.fail('Phone Number and Email ID Missing');
      }
    } else {
      navigation.navigate('EditProfile');
    }
  };

  const getInitialRouteName = () => {
    if (!IS_ENABLE_CHIME_FUNCTIONALITY) {
      return 'HomeStack';
    }
    if (token && settings) {
      switch (
        settings.mobile_default_page // 1-nuggets ( Home ), 2-events,  3-chats
      ) {
        case 2:
          return 'EventsStack';
        case 3:
          return 'UsersStack';
        default:
          return 'HomeStack';
      }
    } else {
      return 'HomeStack';
    }
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName={getInitialRouteName()}
        backBehavior="initialRoute"
        tabBar={props => <CustomBottomTabBar {...props} />}
        screenListeners={{
          focus: e => {
            if (setswipeEnabled) {
              if (e.target.includes('HomeStack')) {
                dispatch(
                  setTabNuggetType({
                    tab_type: 1,
                  }),
                );

                setswipeEnabled(true);
              } else {
                dispatch(
                  setTabNuggetType({
                    tab_type: 2,
                  }),
                );
                setswipeEnabled(false);
              }
            }
          },
        }}
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
        })}>
        {IS_ENABLE_CHIME_FUNCTIONALITY && (
          <Tab.Screen name="EventsStack" component={EventsStack} />
        )}
        <Tab.Screen name="NotificationsStack" component={NotificationsStack} />
        <Tab.Screen name="HomeStack" component={HomeStack} />
        {IS_ENABLE_CHIME_FUNCTIONALITY && (
          <Tab.Screen name="TalkshowStack" component={TalkshowStack} />
        )}
        <Tab.Screen
          name="UsersStack"
          component={UsersStack}
          options={{unmountOnBlur: true}}
        />
      </Tab.Navigator>
      <Modal onRequestClose={() => {}} transparent visible={isOpenVerifyPopup}>
        <ConfirmationPopup
          isEnableClose={false}
          onPressNegativeButton={() => {
            dispatch(setIsOpenVerifyPopup(false));
          }}
          onPressPositiveButton={handleAccountVerification}
          content={
            profile?.acc_verify_status === 0 &&
            profile?.is_profile_updated === 1
              ? 'You need to complete your account validation before you can do this. Do you want to validate it now?'
              : 'Do you want to complete your profile now?'
          }
        />
      </Modal>

      <Modal
        onRequestClose={() => {}}
        transparent
        visible={isOpenVerificationOptions}>
        <VerificationMethodChoose
          onSubmitOption={selectedOption => {
            setisOpenVerificationOptions(false);
            navigation.navigate('EmailPhoneVerification', {
              otpType: selectedOption,
            });
          }}
          onClose={() => {
            setisOpenVerificationOptions(false);
            dispatch(setIsOpenVerifyPopup(true));
          }}
        />
      </Modal>

      <Modal onRequestClose={() => {}} transparent visible={isOpenLoginALert}>
        <ConfirmationPopup
          isEnableClose={false}
          onPressNegativeButton={() => {
            dispatch(setIsOpenLoginAlert(false));
          }}
          positiveButtonText={'Login'}
          negativeButtonText={'Later'}
          onPressPositiveButton={() => {
            dispatch(setIsOpenLoginAlert(false));
            navigation.navigate('Login');
          }}
          content={'You need to Login / Signup Rawcaster Account'}
        />
      </Modal>
    </>
  );
}
