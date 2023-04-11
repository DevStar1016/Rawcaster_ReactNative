import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import {COLORS} from '../../Utilities/Colors';
import TextBox from '../../Components/TextBox';
import SloganLogo from '../../Assets/Svg/slogan_logo.svg';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {forgotPasswordService} from '../../Services/ApiService';
import Toast from '../../Components/Toast';
import {getAuthCode} from '../../Utilities/Methods';
import Loader from '../../Components/Loader';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ReplaceStatusBar from '../../Components/ReplaceStatusBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SVGIcon from '../../Components/SVGIcon';
import {FONTS} from '../../Utilities/Fonts';
import StyledText from '../../Components/StyledText';
import SubmitButton from '../../Components/SubmitButton';
import PoliciesFooter from '../../Components/PoliciesFooter';

const forgotPasswordSchema = Yup.object({
  login_id: Yup.string().required('Phone number or email is required'),
});

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [isLoading, setisLoading] = useState(false);
  const {handleSubmit, handleChange, values, errors} = useFormik({
    initialValues: {
      login_id: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: values => {
      setisLoading(true);
      handleForgotPassword(values);
    },
  });
  useEffect(() => {
    AvoidSoftInput.setAdjustResize();
  }, []);

  function handleForgotPassword(data) {
    let formData = new FormData();
    formData.append('username', data.login_id?.trim());
    formData.append('auth_code', getAuthCode(data.login_id));
    forgotPasswordService(formData)
      .then(res => {
        if (res.data.status === 1) {
          navigation.navigate('ResetPasswordOTP', {
            otp_ref_id: res.data.otp_ref_id,
            remaining_seconds: parseInt(res.data.remaining_seconds),
          });
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
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
    <View style={styles.mainContainer}>
      <ReplaceStatusBar />
      <KeyboardAwareScrollView
        extraScrollHeight={55}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <View style={styles.headerContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => {
                navigation.goBack();
              }}>
              <SVGIcon icon="back" width="100%" height="100%" />
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <SloganLogo />
          </View>
          <View style={{width: '20%'}} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <StyledText style={styles.title}>Forgot Password</StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'center'}}>
              Please enter your email address to search for your account
            </StyledText>
          </View>

          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your phone number or email address"
            title="Login ID"
            onChangeText={handleChange('login_id')}
            errorText={errors.login_id ? errors.login_id : ''}
            value={values.login_id}
          />
          <SubmitButton buttonText={'Send'} onPress={handleSubmit} />
          <View style={styles.signUpContainer}>
            <StyledText style={styles.signUpText}>
              Already Registered?
            </StyledText>
            <StyledText
              onPress={() => {
                navigation.goBack();
              }}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              Login
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

export default ForgotPassword;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  backButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  backButton: {
    borderWidth: 1,
    borderColor: COLORS.white,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
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
  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
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
