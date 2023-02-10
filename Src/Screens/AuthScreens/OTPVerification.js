import {StyleSheet, Text} from 'react-native';
import React from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useRoute} from '@react-navigation/native';
import {signupVerifyService} from '../../Services/ApiService';
import {SALT_KEY} from '../../Services/ServiceConstants';

const otpVerificationSchema = Yup.object({
  otp: Yup.string().required('Otp is required'),
});

const sha1 = require('sha1');

const OTPVerification = () => {
  let {params} = useRoute();
  console.log(params, '===params');
  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues: {
      otp: '',
      otp_ref_id: params?.state?.otp_ref_id || '',
    },
    validationSchema: otpVerificationSchema,
    onSubmit: values => {
      handleOtpVerification(values);
    },
  });

  const handleOtpVerification = data => {
    console.log(data, 'otp verification data');
    let formData = new FormData();
    formData.append('otp_ref_id', data.otp_ref_id);
    formData.append('otp', data.otp);
    formData.append('auth_code', sha1(SALT_KEY + data.otp_ref_id));
    signupVerifyService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data, 'response');
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        } else if (res.data.status === 0) {
          console.log(res.data);
        }
      })
      .catch(err => {
        console.log(err, '===error');
      });
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
