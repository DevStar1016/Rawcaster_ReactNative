import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../../Components/StyledText';

const ResetPasswordOTP = () => {
  return (
    <AuthScreenHOC
      title="Reset Password"
      subTitle="A one time passcode (OTP) has been sent to the email address you provided"
      submitButtonText="Submit"
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login">
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
      />
      <StyledText style={{marginBottom: 40}}>
        We recommend your password to be at least 8 characters long, contain
        uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a
        number (0-9).
      </StyledText>
    </AuthScreenHOC>
  );
};

export default ResetPasswordOTP;

const styles = StyleSheet.create({});
