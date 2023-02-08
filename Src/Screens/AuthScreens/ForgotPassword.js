import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';

const forgotPasswordSchema = Yup.object({
  login_id: Yup.string().required('Phone number or email is required'),
});

const ForgotPassword = () => {
  const navigation = useNavigation();
  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues: {
      login_id: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: values => {
      handleForgotPassword(values);
    },
  });

  const handleForgotPassword = data => {
    console.log(data, 'forgot password data');
  };

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
        // handleSubmit();
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
        onChangeText={handleChange('login_id')}
        errorText={errors.login_id ? errors.login_id : ''}
        value={values.login_id}
      />
    </AuthScreenHOC>
  );
};

export default ForgotPassword;
