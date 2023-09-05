import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SloganLogo from '../../Assets/Svg/slogan_logo.svg';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {DEVICE_ID} from '../../Services/ServiceConstants';
import {
  resendOTPService,
  verifyOtpAndResetPassword,
} from '../../Services/ApiService';
import {getAuthCode} from '../../Utilities/Methods';
import Toast from '../../Components/Toast';
import Loader from '../../Components/Loader';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ReplaceStatusBar from '../../Components/ReplaceStatusBar';
import StyledText from '../../Components/StyledText';
import PoliciesFooter from '../../Components/PoliciesFooter';
import {FONTS} from '../../Utilities/Fonts';
import SubmitButton from '../../Components/SubmitButton';

const resetPasswordSchema = Yup.object({
  otp: Yup.string()
    .required('Otp is required')
    .min(6, 'Enter valid OTP')
    .max(6, 'Enter valid OTP'),
  password: Yup.string()
    .min(8, 'Password to be at least 8 characters long')
    .trim('Password cannot include leading and trailing spaces')
    .strict(true),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPasswordOTP = ({route}) => {
  const navigation = useNavigation();
  const {otp_ref_id, remaining_seconds} = route.params;
  const [timer, settimer] = useState(remaining_seconds);
  const [isLoading, setisLoading] = useState(false);

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      otp: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: values => {
      setisLoading(true);
      handleVerifyOtpResetPassword(values);
    },
  });

  useEffect(() => {
    AvoidSoftInput.setAdjustResize();
  }, []);

  /**
   * Function to handle the resend OTP functionality.
   * It resets the timer, sets the isLoading state to true, and calls the handleResendOTP function.
   * @returns None
   */
  function onResendOtp() {
    settimer(0);
    setisLoading(true);
    handleResendOTP();
  }

  /**
   * Handles the resend OTP functionality.
   * Creates a new FormData object and appends the otp_ref_id and auth_code to it.
   * Calls the resendOTPService function with the formData.
   * If the response status is 1, displays a success toast message and updates the timer.
   * If the response status is 0, displays a failure toast message.
   * If there is an error, displays a failure toast message with the error message.
   * Finally, sets the isLoading state to false.
   * @returns None
   */
  function handleResendOTP() {
    const formData = new FormData();
    formData.append('otp_ref_id', otp_ref_id);
    formData.append('auth_code', getAuthCode(otp_ref_id));
    resendOTPService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          settimer(parseInt(res.data.remaining_seconds));
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  /**
   * Handles the verification of OTP and resetting of password.
   * @param {Object} values - An object containing the values needed for verification and password reset.
   * @returns None
   */
  function handleVerifyOtpResetPassword(values) {
    let formData = new FormData();
    formData.append('otp_ref_id', otp_ref_id);
    formData.append('otp', values.otp);
    formData.append('new_password', values.password);
    formData.append('confirm_password', values.confirm_password);
    formData.append('auth_code', getAuthCode(otp_ref_id));
    formData.append('device_id', DEVICE_ID);
    verifyOtpAndResetPassword(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  }

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
            <StyledText style={styles.title}>Reset Password</StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'center'}}>
              A one time passcode (OTP) has been sent to the email address you
              provided
            </StyledText>
          </View>

          <OTPInput
            onCodeChanged={handleChange('otp')}
            seconds={timer}
            onResendOtp={onResendOtp}
            errorText={errors.otp && touched.otp ? errors.otp : ''}
          />
          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your password"
            title="Password"
            onChangeText={handleChange('password')}
            errorText={errors.password ? errors.password : ''}
            value={values.password}
            isSecure
          />
          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your password"
            title="Re-Enter your password"
            onChangeText={handleChange('confirm_password')}
            errorText={errors.confirm_password ? errors.confirm_password : ''}
            value={values.confirm_password}
            isSecure
            isEnablePasswordConditionText
            passwordConditionTextStyle={{marginBottom: 40}}
          />

          <SubmitButton buttonText={'Submit'} onPress={handleSubmit} />

          <View style={styles.signUpContainer}>
            <StyledText style={styles.signUpText}>
              {'Already Registered? '}
            </StyledText>
            <StyledText
              onPress={() => {
                navigation.reset({
                  routes: [{name: 'Login'}],
                });
              }}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              Login
            </StyledText>
          </View>

          <PoliciesFooter />
        </View>
      </KeyboardAwareScrollView>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default ResetPasswordOTP;

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
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
    paddingVertical: 5,
    textAlign: 'center',
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
