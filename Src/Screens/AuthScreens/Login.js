import {Keyboard, Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../../Components/StyledText';
import TextBox from '../../Components/TextBox';
import SloganLogo from '../../Assets/Svg/slogan_logo.svg';
import {useNavigation} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import {DEVICE_ID} from '../../Services/ServiceConstants';
import {loginService} from '../../Services/ApiService';
import {getAuthCode, storeToken} from '../../Utilities/Methods';
import {IS_IOS} from '../../Utilities/Constants';
import Toast from '../../Components/Toast';
import {FONTS} from '../../Utilities/Fonts';
import Loader from '../../Components/Loader';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ReplaceStatusBar from '../../Components/ReplaceStatusBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SubmitButton from '../../Components/SubmitButton';
import PoliciesFooter from '../../Components/PoliciesFooter';

const validationSchema = Yup.object({
  login_id: Yup.string().required('Phone number or email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [pushId, setpushId] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      login_id: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      setisLoading(true);

      handleLogin(values);
    },
  });

  useEffect(() => {
    AvoidSoftInput.setAdjustResize();
  }, []);

  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false;
      Keyboard.dismiss();
    };
  }, []);

  useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        setpushId(token);
      })
      .catch(e => {});
  }, []);

  function handleLogin(data) {
    let formData = new FormData();
    formData.append('auth_code', getAuthCode(data.login_id));
    formData.append('username', data.login_id?.trim());
    formData.append('password', data.password);
    formData.append('device_id', DEVICE_ID);
    formData.append('push_id', pushId);
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
          Toast.fail(res.data.msg);
        } else if (res.data.status === 2) {
          Toast.fail(res.data.msg);
          navigation.navigate('SignupWithPhone', {
            loginId: data.login_id,
            signUpType: res.data.type, // 1 - Email, 2 - Phone
          });
        }
      })
      .catch(err => {
        Toast.fail(err.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}>
      <ReplaceStatusBar />

      <KeyboardAwareScrollView
        extraScrollHeight={10}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SloganLogo />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <StyledText style={styles.title}>Welcome to Rawcaster</StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'center'}}>
              Log in now to access the latest insights, experience for your
              social media performance.
            </StyledText>
          </View>

          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Phone number or Email address"
            title="Login ID"
            onChangeText={handleChange('login_id')}
            errorText={
              errors.login_id && touched.login_id ? errors.login_id : ''
            }
            value={values.login_id}
          />
          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your password"
            title="Password"
            onChangeText={handleChange('password')}
            errorText={
              errors.password && touched.password ? errors.password : ''
            }
            value={values.password}
            isSecure
          />
          <View style={styles.forgotPasswordContainer}>
            <StyledText
              onPress={() => {
                navigation.navigate('ForgotPassword');
              }}
              style={styles.forgotPasswordText}>
              Forgot Password?
            </StyledText>
          </View>

          <SubmitButton buttonText={'Login'} onPress={handleSubmit} />

          <View style={styles.signUpContainer}>
            <StyledText style={styles.signUpText}>
              Don’t have an account?
            </StyledText>
            <StyledText
              onPress={() => {
                navigation.navigate('Signup', {pushId: pushId});
              }}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              Sign up
            </StyledText>
          </View>

          <PoliciesFooter />
        </View>
      </KeyboardAwareScrollView>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  contentContainer: {
    paddingVertical: 15,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
    paddingVertical: 5,
    textAlign: 'center',
  },
  logoContainer: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.medium,
  },
  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  signUpText: {
    color: COLORS.dimColor,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 17,
    paddingVertical: 5,
  },
});
