import {StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../../Components/StyledText';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import {DEVICE_ID, SALT_KEY} from '../../Services/ServiceConstants';
import {loginService} from '../../Services/ApiService';
import {storeToken, toastService} from '../../Utilities/Methods';
import {IS_IOS, SHA1} from '../../Utilities/Constants';

let isMount = true;

const validationSchema = Yup.object({
  login_id: Yup.string().required('Phone number or email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isLoading, setisLoading] = useState(false);

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      login_id: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      if (isMount) {
        setisLoading(true);
      }
      handleLogin(values);
    },
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const handleLogin = data => {
    let formData = new FormData();
    formData.append('auth_code', SHA1(SALT_KEY + data.login_id));
    formData.append('username', data.login_id);
    formData.append('password', data.password);
    formData.append('device_id', DEVICE_ID);
    // formData.append('push_id', "");
    formData.append('device_type', IS_IOS ? 2 : 1);
    // formData.append('voip_token', "");
    formData.append('app_type', IS_IOS ? 2 : 1);
    loginService(formData)
      .then(res => {
        if (res.data.status === 1) {
          const userData = {
            name: res.data.name,
            user_id: res.data.user_id,
            profile_image: res.data.profile_image,
            acc_verify_status: res.data.acc_verify_status,
          };
          storeToken(res.data.token, userData, dispatch);
        } else if (res.data.status === 0) {
          toastService(res.data.msg);
        } else if (res.data.status === 2) {
          navigation.navigate('SignupWithPhone', {
            loginId: data.login_id,
            signUpType: res.data.type, // 1 - Email, 2 - Phone
          });
        }
      })
      .catch(err => {
        console.log(err, '===error');
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
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
      isLoading={isLoading}
      onPressSubmitButton={() => {
        handleSubmit();
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Phone number or Email address"
        title="Login ID"
        isEditable={!isLoading}
        onChangeText={handleChange('login_id')}
        errorText={errors.login_id && touched.login_id ? errors.login_id : ''}
        value={values.login_id}
      />
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isEditable={!isLoading}
        onChangeText={handleChange('password')}
        errorText={errors.password && touched.password ? errors.password : ''}
        value={values.password}
        isSecure
      />
      <View style={styles.forgotPasswordContainer}>
        <StyledText
          isButton={!isLoading}
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
