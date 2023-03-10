import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
// import {TwitterLogin} from 'react-native-login-twitter';
import {useDispatch} from 'react-redux';
import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {
  DEVICE_TYPE,
  IS_IOS,
  SIGNUP_TYPE,
  SOCIAL_SIGN_IN_LIST,
} from '../../../Utilities/Constants';
import {FONTS} from '../../../Utilities/Fonts';
import {DEVICE_ID} from '../../../Services/ServiceConstants';
import {
  getAuthCode,
  getLocationAddress,
  setIsGlobalLoading,
  storeToken,
} from '../../../Utilities/Methods';
import {useLocationDetails} from '../../../Utilities/StoreData';
import {setLocationDetails} from '../../../Store/Slices/UtilitySlice';
import {socialMediaLoginService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import jwt_decode from 'jwt-decode';

const Signup = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {pushId} = route.params;
  const locationDetails = useLocationDetails();

  useEffect(() => {
    getLocationAddress()
      .then(res => {
        dispatch(setLocationDetails(res));
      })
      .catch(e => {});
  }, []);

  const handleSocialSignupAPICall = (values, signin_type) => {
    setIsGlobalLoading(true, dispatch);
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(values.login_id));
    formData.append('signin_type', signin_type); // 1 - Email, 2 - Phone
    formData.append('first_name', values.name);
    formData.append('display_name', values.name);
    formData.append('email_id', values.login_id?.trim());
    if (locationDetails && locationDetails.geoLocation) {
      formData.append('geo_location', locationDetails.geoLocation);
    }
    formData.append('device_id', DEVICE_ID);
    formData.append('push_id', pushId);
    // formData.append("voip_token", IS_IOS ? "" : null);
    formData.append('app_type', IS_IOS ? 2 : 1);
    socialMediaLoginService(formData)
      .then(res => {
        if (res.data.status === 1) {
          const userData = {
            name: res.data.name,
            user_id: res.data.user_id,
            profile_image: res.data.profile_image,
            acc_verify_status: res.data.acc_verify_status,
          };
          storeToken(res.data.token, userData, dispatch);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        } else if (res.data.status === 2) {
          Toast.fail(res.data.msg);
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        }
      })
      .catch(e => {})
      .finally(() => {
        setIsGlobalLoading(false, dispatch);
      });
  };

  const googleSignUp = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const values = {
        login_id: userInfo.user.email,
        name: userInfo.user.name,
      };
      handleSocialSignupAPICall(values, SIGNUP_TYPE.google);
    } catch (error) {
      const typedError = error;
      console.log(error, 'KLKLKLK');

      switch (typedError.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // sign in was cancelled
          break;
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          Toast.fail('In Progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          Toast.fail('Play Services not available or outdated');
          break;
        default:
          Toast.fail('Something went wrong');
          console.log('Something went wrong', typedError.toString());
      }
    }
  };

  const instagramSignUp = async () => {};

  const twitterSignUp = async () => {
    // TwitterLogin.init(
    //   'qWPj1TXbreMX1SsDvdiQTaF7Y',
    //   '4t0cRfGWXZvySIa5sS0M38AnT8a8B8hwcX2lZiaStSWStD4B4Z',
    // );
    // TwitterLogin.logIn()
    //   .then(res => {
    //     console.log(res, 'RESPONSE');
    //   })
    //   .catch(e => {
    //     console.log(e, 'ERRORRRR');
    //   });
  };

  const appleSignUp = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      const values = {
        login_id: appleAuthRequestResponse.email,
        name: appleAuthRequestResponse.fullName.givenName,
        id: appleAuthRequestResponse.user,
      };
      handleSocialSignupAPICall(values, SIGNUP_TYPE.apple);
      let tempToken = jwt_decode(appleAuthRequestResponse.identityToken);
      console.log(tempToken, 'REPONSE');
    } catch (err) {
      console.log(err, 'error');
    }
  };

  const onPressSocialSignup = id => {
    switch (id) {
      case SIGNUP_TYPE.google:
        googleSignUp();
        return;
      case SIGNUP_TYPE.apple:
        appleSignUp();
        return;
      case SIGNUP_TYPE.instagram:
        instagramSignUp();
        return;
      case SIGNUP_TYPE.twitter:
        twitterSignUp();
        return;
    }
  };

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  const SignupTypeButton = ({buttonText = '', icon, onPress}) => {
    return (
      <SubmitButton
        buttonText={buttonText}
        bgColor={COLORS.white}
        onPress={onPress}
        buttonTextStyle={{fontFamily: FONTS.DMSans.regular, fontSize: 17}}
        textColor={COLORS.black}
        icon={icon}
        iconSize={23}
        borderColor={COLORS.borderColor}
      />
    );
  };

  return (
    <AuthScreenHOC
      title="Join Rawcaster Family"
      subTitle="Join now to access the latest insights, experience for your social media performance."
      isEnableSubmitButton={false}
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      onPressButtonBottomText={() => {
        navigation.goBack();
      }}>
      <SubmitButton
        buttonText="Signup with phone number or email"
        buttonTextStyle={{fontSize: 17}}
        onPress={() => {
          navigation.navigate('SignupWithPhone', {pushId: pushId});
        }}
      />
      <View style={styles.dividerContainer}>
        <Divider />
        <View style={styles.orTextContainer}>
          <StyledText style={{fontSize: 17, paddingVertical: 5}}>OR</StyledText>
        </View>
        <Divider />
      </View>
      {SOCIAL_SIGN_IN_LIST.filter(item =>
        item.deviceType.includes(DEVICE_TYPE),
      ).map(item => {
        return (
          <SignupTypeButton
            key={item.id.toString()}
            buttonText={`Signup with ${item.platformName}`}
            icon={item.iconName}
            onPress={() => {
              onPressSocialSignup(item.id);
            }}
          />
        );
      })}
    </AuthScreenHOC>
  );
};

export default Signup;

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.borderColor,
    width: '43%',
  },
  orTextContainer: {
    width: '10%',
    alignItems: 'center',
  },
});
