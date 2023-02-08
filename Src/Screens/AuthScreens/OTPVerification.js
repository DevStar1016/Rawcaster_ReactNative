import {StyleSheet, Text} from 'react-native';
import React from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';

const otpVerificationSchema = Yup.object({
  otp: Yup.string().required('Otp is required'),
});

const OTPVerification = () => {
  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpVerificationSchema,
    onSubmit: values => {
      handleOtpVerification(values);
    },
  });

  const handleOtpVerification = data => {
    console.log(data, 'otp verification data');
  };

  return (
    <AuthScreenHOC
      title="Validate your email"
      subTitle="Please enter the One Time Password (OTP) sent to godfrey@gmail.com"
      submitButtonText="Validate"
      isEnableCancelButton
      titleContainerAlignItems="flex-start"
      titleTextAlign="left"
      onPressSubmitButton={handleSubmit}
      isEnableBottomButtonText={false}>
      <OTPInput
        onCodeChanged={handleChange('otp')}
        paddingVertical={20}
        paddingBottom={40}
      />
    </AuthScreenHOC>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({});
