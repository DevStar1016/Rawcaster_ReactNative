import {Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../../Components/StyledText';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import {StoreToken} from '../../Store/Slices/AuthSlice';
import {DEVICE_ID, SALT_KEY} from '../../Services/ServiceConstants';
import {loginService} from '../../Services/ApiService';

const loginSchema = Yup.object({
  login_id: Yup.string().required('Phone number or email is required'),
  password: Yup.string().required('Password is required'),
});

const sha1 = require('sha1');

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      login_id: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: values => {
      handleLogin(values);
    },
  });

  const handleLogin = data => {
    let formData = new FormData();
    formData.append('username', data.login_id);
    formData.append('auth_code', sha1(SALT_KEY + data.login_id));
    formData.append('password', data.password);
    formData.append('app_type', Platform.OS === 'ios' ? 2 : 1);
    formData.append('device_id', 'abcd');
    console.log(formData);
    loginService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(StoreToken(true));
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
      title="Welcome to Rawcaster"
      subTitle="Log in now to access the latest insights, experience for your social
    media performance."
      submitButtonText="Login"
      buttonBottomLeftText="Don’t have an account?  "
      buttonBottomRightText="Sign up"
      onPressButtonBottomText={() => {
        navigation.navigate('Signup');
      }}
      onPressSubmitButton={() => {
        handleSubmit();
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Phone number or Email address"
        title="Login ID"
        onChangeText={handleChange('login_id')}
        errorText={errors.login_id && touched.login_id ? errors.login_id : ''}
        value={values.login_id}
      />
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        onChangeText={handleChange('password')}
        errorText={errors.password && touched.password ? errors.password : ''}
        value={values.password}
        isSecure
      />
      <View style={styles.forgotPasswordContainer}>
        <StyledText
          isButton={true}
          paddingVertical={0}
          onPress={() => {
            navigation.navigate('ForgotPassword');
          }}
          style={styles.forgotPasswordText}>
          Forgot Password?
        </StyledText>
      </View>
    </AuthScreenHOC>
  );
};

export default Login;

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontWeight: 500,
  },
});
