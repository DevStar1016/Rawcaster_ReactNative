import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  DEVICE_TYPE,
  IS_IOS,
  SIGNUP_TYPE,
  SOCIAL_SIGN_IN_LIST,
} from '../../Utilities/Constants';
import SubmitButton from '../../Components/SubmitButton';
import {COLORS} from '../../Utilities/Colors';
import {FONTS} from '../../Utilities/Fonts';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
// import {TwitterLogin} from 'react-native-login-twitter';
import jwt_decode from 'jwt-decode';
import Toast from '../../Components/Toast';
import Loader from '../../Components/Loader';
import {
  getAuthCode,
  getLocationAddress,
  storeToken,
} from '../../Utilities/Methods';
import {useLocationDetails} from '../../Utilities/StoreData';
import {DEVICE_ID} from '../../Services/ServiceConstants';
import {socialMediaLoginService} from '../../Services/ApiService';
import {
  setIsVisibleInfluencers,
  setLocationDetails,
} from '../../Store/Slices/UtilitySlice';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const SocialSignin = ({pushId, isLogin = false}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const locationDetails = useLocationDetails();
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    getLocationAddress()
      .then(res => {
        dispatch(setLocationDetails(res));
      })
      .catch(e => {});
  }, []);

  const handleSocialSignupAPICall = (values, signin_type) => {
    setisLoading(true);
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(values.login_id));
    formData.append('signin_type', signin_type); // 1 - Email, 2 - Phone
    formData.append('first_name', values.name);
    formData.append('display_name', values.name);
    formData.append('email_id', values.login_id?.trim());
    if (locationDetails && locationDetails?.geoLocation) {
      formData.append('geo_location', locationDetails?.geoLocation);
    }
    formData.append('device_id', DEVICE_ID);
    formData.append('push_id', pushId);
    // formData.append("voip_token", IS_IOS ? "" : null);
    formData.append('app_type', IS_IOS ? 2 : 1);
    socialMediaLoginService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (parseInt(res.data.first_time) === 1) {
            dispatch(setIsVisibleInfluencers(true));
          }
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
        setisLoading(false);
      });
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
      }
    }
  };

  const appleSignUp = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      let values = {
        login_id: appleAuthRequestResponse.email,
        name: appleAuthRequestResponse.fullName.givenName,
        id: appleAuthRequestResponse.user,
      };
      // if (!values.login_id) {
      //   const tempToken = jwt_decode(appleAuthRequestResponse.identityToken);
      //   values = {...values, login_id: tempToken.email, name: ''};
      // }
      handleSocialSignupAPICall(values, SIGNUP_TYPE.apple);
      const tempToken = jwt_decode(appleAuthRequestResponse.identityToken);
      console.log(values, tempToken, 'REPONSE');
    } catch (err) {
      console.log(err, 'error');
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

  const SignupTypeButton = ({buttonText = '', icon, onPress, index}) => {
    return (
      <SubmitButton
        buttonText={buttonText}
        bgColor={COLORS.white}
        onPress={onPress}
        buttonTextStyle={{fontFamily: FONTS.DMSans.regular, fontSize: 17}}
        textColor={COLORS.black}
        icon={icon}
        marginTop={index === 0 ? 0 : 15}
        iconSize={23}
        borderColor={COLORS.borderColor}
      />
    );
  };

  return (
    <>
      {SOCIAL_SIGN_IN_LIST.filter(item =>
        item.deviceType.includes(DEVICE_TYPE),
      ).map((item, index) => {
        return (
          <SignupTypeButton
            key={item.id.toString()}
            index={index}
            buttonText={`${isLogin ? 'Signin' : 'Signup'} with ${
              item.platformName
            }`}
            icon={item.iconName}
            onPress={() => {
              onPressSocialSignup(item.id);
            }}
          />
        );
      })}
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </>
  );
};

export default SocialSignin;

const styles = StyleSheet.create({});
