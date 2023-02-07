import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';

const ForgotPassword = () => {
  const navigation = useNavigation();
  return (
    <AuthScreenHOC
      title="Forgot Password"
      subTitle="Please enter your email address to search for your account"
      submitButtonText="Send"
      buttonBottomTextAlignment="flex-start"
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      isEnableBackButton={true}
      onPressSubmitButton={() => {
        navigation.navigate('ResetPasswordOTP');
      }}
      onPressBackButton={() => {
        navigation.goBack();
      }}
      onPressButtonBottomText={() => {
        navigation.goBack();
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your phone number or email address"
        title="Login ID"
      />
    </AuthScreenHOC>
  );
};

export default ForgotPassword;
