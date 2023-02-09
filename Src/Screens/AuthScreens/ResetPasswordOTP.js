import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PASSWORD_REGEX} from '../../Utilities/Constants';
import {SALT_KEY} from '../../Services/ServiceConstants';
import {verifyOtpAndResetPassword} from '../../Services/ApiService';

const resetPasswordSchema = Yup.object({
  otp: Yup.string().required('Otp is required'),
  password: Yup.string()
    .min(8, 'Password to be at least 8 characters long')
    .matches(
      PASSWORD_REGEX,
      'Password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
    )
    .required('Password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .matches(
      PASSWORD_REGEX,
      'Re-enter password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
    )
    .required('Confirm password is required'),
});

const sha1 = require('sha1');

const ResetPasswordOTP = () => {
  const navigation = useNavigation();

  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues: {
      otp: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: values => {
      handleResetOtp(values);
    },
  });

  const handleResetOtp = data => {
    console.log(data, 'reset otp data');
    let formData = new FormData();
    formData.append('otp_ref_id', '');
    formData.append('otp_code', data.otp);
    formData.append('new_password', data.password);
    formData.append('confirm_password', data.confirm_password);
    formData.append('auth_code', sha1(SALT_KEY + ''));
    formData.append('device_id', 'abcd');
    verifyOtpAndResetPassword(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data, 'response');
        } else {
          console.log(res.data.msg);
        }
      })
      .catch(err => {
        console.log(err, '===error');
      });
  };

  return (
    <AuthScreenHOC
      title="Reset Password"
      subTitle="A one time passcode (OTP) has been sent to the email address you provided"
      submitButtonText="Submit"
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      onPressSubmitButton={handleSubmit}
      onPressButtonBottomText={() => {
        navigation.reset({
          routes: [{name: 'Login'}],
        });
      }}>
      <OTPInput onCodeChanged={handleChange('otp')} />
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
    </AuthScreenHOC>
  );
};

export default ResetPasswordOTP;
