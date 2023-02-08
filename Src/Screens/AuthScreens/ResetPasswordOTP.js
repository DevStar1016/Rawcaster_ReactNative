import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PASSWORD_REGEX} from '../../Utilities/Constants';

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
