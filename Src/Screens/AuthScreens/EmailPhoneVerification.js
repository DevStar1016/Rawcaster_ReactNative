import {Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import SloganLogo from '../../Assets/Svg/slogan_logo.svg';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import {resendOTPService, signupVerifyService} from '../../Services/ApiService';
import {getAuthCode, storeToken, storeUserData} from '../../Utilities/Methods';
import {useProfile, useToken, useUserData} from '../../Utilities/StoreData';
import Toast from '../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../../Store/Slices/AuthSlice';
import Loader from '../../Components/Loader';
import {COLORS} from '../../Utilities/Colors';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ReplaceStatusBar from '../../Components/ReplaceStatusBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {FONTS} from '../../Utilities/Fonts';
import StyledText from '../../Components/StyledText';
import PoliciesFooter from '../../Components/PoliciesFooter';
import SubmitButton from '../../Components/SubmitButton';
import {setIsVisibleInfluencers} from '../../Store/Slices/UtilitySlice';

const otpVerificationSchema = Yup.object({
  otp: Yup.string()
    .required('Otp is required')
    .min(6, 'Enter valid OTP')
    .max(6, 'Enter valid OTP'),
});

var isMount = true;
const EmailPhoneVerification = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const user = useUserData();
  const {
    otpType,
    emailMobile,
    isGoBack,
    isFromLoginSignup,
    otp_ref_id,
    alt_token_id,
    remaining_seconds,
  } = route.params ?? {};
  const [otpRefId, setotpRefId] = useState(otp_ref_id);
  const [timer, settimer] = useState(
    remaining_seconds ? parseInt(remaining_seconds) : 0,
  );
  const profile = useProfile();
  const [isLoading, setisLoading] = useState(false);

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpVerificationSchema,
    onSubmit: values => {
      handleOtpVerification(values);
    },
  });
  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    if (!isFromLoginSignup) {
      resendOTPAPICall();
    }
  }, []);

  const resendOTPAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(otpRefId ?? 'Rawcaster'));
    if (token) {
      formData.append('token', token);
    }
    if (otpRefId) {
      formData.append('otp_ref_id', otpRefId);
    }
    if (otpType) {
      formData.append('otp_flag', otpType);
    }
    resendOTPService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg, {visibilityTime: 4000});
          if (isMount) {
            setotpRefId(res.data.otp_ref_id);
            settimer(parseInt(res.data.remaining_seconds));
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const handleOtpVerification = values => {
    if (isMount) {
      setisLoading(true);
    }
    let formData = new FormData();
    formData.append('auth_code', getAuthCode(otpRefId));
    formData.append('otp_ref_id', otpRefId);
    formData.append('otp', values.otp);
    if (otpType) {
      formData.append('otp_flag', otpType);
    }
    if (alt_token_id) {
      formData.append('alt_token_id', alt_token_id);
    }
    console.log(formData, 'FORMDATA SIGNUP VERIFY');
    signupVerifyService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isFromLoginSignup) {
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
          } else {
            if (otpType) {
              if (otpType === 'sms') {
                dispatch(
                  setMyProfile({
                    ...profile,
                    is_mobile_no_verified: 1,
                    acc_verify_status: 1,
                  }),
                );
              } else {
                dispatch(
                  setMyProfile({
                    ...profile,
                    is_email_id_verified: 1,
                    acc_verify_status: 1,
                  }),
                );
              }
            } else {
              dispatch(
                setMyProfile({
                  ...profile,
                  is_email_id_verified: 1,
                  acc_verify_status: 1,
                }),
              );
            }
            const userData = {...user, acc_verify_status: 1};
            storeUserData(userData, dispatch);
            if (isGoBack) {
              navigation.goBack();
            } else {
              navigation.reset({
                routes: [{name: 'BottomTabNavigationAfterLogin'}],
              });
            }
          }
          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const getOtpSendedCommunication = () => {
    if (isFromLoginSignup) {
      return emailMobile;
    }
    if (otpType === 'sms') {
      return profile?.mobile;
    }
    return profile?.email_id;
  };

  return (
    <View style={styles.mainContainer}>
      <ReplaceStatusBar />

      <KeyboardAwareScrollView
        extraScrollHeight={10}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SloganLogo />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <StyledText style={styles.title}>
              Validate your {otpType === 'sms' ? 'phone number' : 'email'}
            </StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'left'}}>
              {`Please enter the One Time Password (OTP) sent to ${getOtpSendedCommunication()}`}
            </StyledText>
          </View>

          <OTPInput
            onCodeChanged={handleChange('otp')}
            seconds={timer}
            onResendOtp={() => {
              if (isMount) {
                settimer(0);
              }
              resendOTPAPICall();
            }}
            errorText={errors.otp && touched.otp ? errors.otp : ''}
            paddingVertical={20}
            paddingBottom={40}
          />

          <SubmitButton buttonText={'Validate'} onPress={handleSubmit} />

          <SubmitButton
            buttonText={'Cancel'}
            onPress={() => {
              navigation.goBack();
            }}
            bgColor={COLORS.white}
            textColor={COLORS.secondary}
          />

          <PoliciesFooter />
        </View>
      </KeyboardAwareScrollView>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default EmailPhoneVerification;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  contentContainer: {
    paddingVertical: 15,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'flex-start',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
    paddingVertical: 5,
    textAlign: 'left',
  },
  logoContainer: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  signUpText: {
    color: COLORS.dimColor,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 17,
    paddingVertical: 5,
  },
});
