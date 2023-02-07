import {StyleSheet} from 'react-native';
import React from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import OTPInput from '../../Components/OTPInput';

const OTPVerification = () => {
  return (
    <AuthScreenHOC
      title="Validate your email"
      subTitle="Please enter the One Time Password (OTP) sent to godfrey@gmail.com"
      submitButtonText="Validate"
      isEnableCancelButton
      titleContainerAlignItems="flex-start"
      titleTextAlign="left"
      isEnableBottomButtonText={false}>
      <OTPInput
        onCodeChanged={() => {}}
        paddingVertical={20}
        paddingBottom={40}
      />
    </AuthScreenHOC>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({});
