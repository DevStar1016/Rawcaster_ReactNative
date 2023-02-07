import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import OTPInput from '../../Components/OTPInput';

const ResetPasswordOTP = () => {
  const navigation = useNavigation();
  return (
    <AuthScreenHOC
      title="Reset Password"
      subTitle="A one time passcode (OTP) has been sent to the email address you provided"
      submitButtonText="Submit"
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      onPressButtonBottomText={() => {
        navigation.reset({
          routes: [{name: 'Login'}],
        });
      }}>
      <OTPInput onCodeChanged={() => {}} />
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isSecure
      />
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Re-Enter your password"
        isSecure
        isEnablePasswordConditionText
        passwordConditionTextStyle={{marginBottom: 40}}
      />
    </AuthScreenHOC>
  );
};

export default ResetPasswordOTP;
