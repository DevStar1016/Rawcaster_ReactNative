import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch} from 'react-redux';
import {Modal} from 'react-native';
import Events from '../Screens/MainScreens/Events';
import HomeStack from '../Stacks/HomeStack';
import Notifications from '../Screens/MainScreens/Notifications';
import User from '../Screens/MainScreens/User';
import Talkshow from '../Screens/MainScreens/Talkshow';
import CustomBottomTabBar from './CustomBottomTabBar';
import {
  useIsOpenLoginAlert,
  useIsOpenVerifyPopup,
  useProfile,
  useToken,
  useUserData,
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
} from '../Store/Slices/UtilitySlice';

const Tab = createBottomTabNavigator();
export default function BottomTabNavigation() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const user = useUserData();
  const profile = useProfile();
  const isOpenLoginALert = useIsOpenLoginAlert();
  const isOpenVerifyPopup = useIsOpenVerifyPopup();

  const [isOpenVerificationOptions, setisOpenVerificationOptions] =
    useState(false);

  useEffect(() => {
    dispatch(
      setIsOpenVerifyPopup(token && user && user?.acc_verify_status === 0),
    );
  }, [token]);

  const handleAccountVerification = () => {
    dispatch(setIsOpenVerifyPopup(false));
    if (user.acc_verify_status === 0 && profile.is_profile_updated === 1) {
      if (
        profile.two_type_verification === 1 &&
        profile.mobile &&
        profile.email_id
      ) {
        setisOpenVerificationOptions(true);
      } else if (profile.email_id) {
        navigation.navigate('OTPVerification', {
          otpType: 'email',
        });
      } else if (profile.mobile) {
        navigation.navigate('OTPVerification', {
          otpType: 'sms',
        });
      } else {
        Toast.fail('Phone Number and Email ID Missing');
      }
    } else {
      navigation.navigate('EditProfile');
    }
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="HomeStack"
        backBehavior="initialRoute"
        tabBar={props => <CustomBottomTabBar {...props} />}
        screenListeners={{
          focus: e => {
            if (e.target.includes('HomeStack')) {
              dispatch(setIsBottomTabBarAbsolute(true));
            } else {
              dispatch(setIsBottomTabBarAbsolute(false));
            }
          },
        }}
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
        })}>
        <Tab.Screen name="Events" component={Events} />
        <Tab.Screen name="Notifications" component={Notifications} />
        <Tab.Screen name="HomeStack" component={HomeStack} />
        <Tab.Screen name="Talkshow" component={Talkshow} />
        <Tab.Screen name="User" component={User} />
      </Tab.Navigator>
      <Modal onRequestClose={() => {}} transparent visible={isOpenVerifyPopup}>
        <ConfirmationPopup
          isEnableClose={false}
          onPressNegativeButton={() => {
            dispatch(setIsOpenVerifyPopup(false));
          }}
          onPressPositiveButton={handleAccountVerification}
          content={
            user?.acc_verify_status === 0 && profile?.is_profile_updated === 1
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
            navigation.navigate('OTPVerification', {
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
