import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useDispatch} from 'react-redux';
import {Modal} from 'react-native';
import HomeStack from '../Stacks/HomeStack';
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
import TalkshowStack from '../Stacks/TalkshowStack';
import EventsStack from '../Stacks/EventsStack';
import UsersStack from '../Stacks/UsersStack';
import NotificationsStack from '../Stacks/NotificationsStack';

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
      setIsOpenVerifyPopup(
        token &&
          user &&
          user?.acc_verify_status === 0 &&
          profile?.acc_verify_status === 0,
      ),
    );
  }, [token]);

  const handleAccountVerification = () => {
    dispatch(setIsOpenVerifyPopup(false));
    if (user.acc_verify_status === 0 && profile?.is_profile_updated === 1) {
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

  return (
    <>
      <Tab.Navigator
        initialRouteName="HomeStack"
        backBehavior="initialRoute"
        tabBar={props => <CustomBottomTabBar {...props} />}
        screenListeners={{
          focus: e => {
            // if (e.target.includes('UsersStack')) {
            //   dispatch(setIsBottomTabBarAbsolute(false));
            // } else {
            dispatch(setIsBottomTabBarAbsolute(true));
            // }
          },
        }}
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: false,
        })}>
        <Tab.Screen name="EventsStack" component={EventsStack} />
        <Tab.Screen name="NotificationsStack" component={NotificationsStack} />
        <Tab.Screen name="HomeStack" component={HomeStack} />
        <Tab.Screen name="TalkshowStack" component={TalkshowStack} />
        <Tab.Screen name="UsersStack" component={UsersStack} />
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
