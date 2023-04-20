import {Keyboard, Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import TextBox from '../../../Components/TextBox';
import SubmitButton from '../../../Components/SubmitButton';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Loader from '../../../Components/Loader';
import {useToken} from '../../../Utilities/StoreData';
import {getAuthCode} from '../../../Utilities/Methods';
import {changePasswordService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {useNavigation} from '@react-navigation/native';
import TitleDescriptionContainer from '../../../Components/TitleDescriptionContainer';

const resetPasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'New Password to be at least 8 characters long')
    .trim()
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});
var isMount = true;
const ChangePassword = () => {
  const navigation = useNavigation();
  const token = useToken();
  const [isLoading, setisLoading] = useState(false);
  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: () => {
      Keyboard.dismiss();
      if (isMount) {
        setisLoading(true);
      }
      changePasswordAPICall();
    },
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function changePasswordAPICall() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('old_password', values.currentPassword);
    formData.append('new_password', values.newPassword);
    formData.append('confirm_password', values.confirmPassword);
    formData.append('auth_code', getAuthCode(token));
    changePasswordService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.goBack();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Change Password" isEnableSafeArea />
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <View style={styles.contentContainer}>
          <TitleDescriptionContainer
            title="Create a new password"
            description="Replace your existing password. Do not share password with anyone else. Use special characters and alphanumeric for a stronger password."
            titleStyle={{fontSize: 15}}
            containerStyle={{paddingVertical: 0, paddingTop: 10}}
          />
          <TextBox
            value={values.currentPassword}
            title="Current Password"
            mainContainerMarginVertical={5}
            inputContainerMarginVertical={2}
            titlePaddingVertical={3}
            onChangeText={handleChange('currentPassword')}
            errorText={
              touched.currentPassword && errors.currentPassword
                ? errors.currentPassword
                : ''
            }
            titleStyle={styles.titleText}
            isSecure
            placeHolder="Current Password"
          />
          <TextBox
            value={values.newPassword}
            title="New Password"
            mainContainerMarginVertical={5}
            inputContainerMarginVertical={2}
            titlePaddingVertical={3}
            onChangeText={handleChange('newPassword')}
            errorText={
              touched.newPassword && errors.newPassword
                ? errors.newPassword
                : ''
            }
            titleStyle={styles.titleText}
            isSecure
            placeHolder="New Password"
          />
          <TextBox
            value={values.confirmPassword}
            title="Confirm Password"
            mainContainerMarginVertical={5}
            inputContainerMarginVertical={2}
            titlePaddingVertical={3}
            onChangeText={handleChange('confirmPassword')}
            errorText={
              touched.confirmPassword && errors.confirmPassword
                ? errors.confirmPassword
                : ''
            }
            titleStyle={styles.titleText}
            isSecure
            placeHolder="Confirm Password"
          />
          <StyledText style={{fontSize: 12}}>
            We recommend your password to be at least 8 characters long, contain
            uppercase letter(A-Z), lowercase letter (a-z), symbol(!@#$%) and a
            number (0-9).
          </StyledText>
          <SubmitButton
            buttonText="Reset Password"
            padding={0}
            marginBottom={0}
            marginHorizontal={0}
            marginTop={15}
            paddingHorizontal={10}
            paddingVertical={10}
            borderRadius={15}
            textPaddingVertical={0}
            bgColor={COLORS.primary}
            borderColor={COLORS.primary}
            onPress={handleSubmit}
            buttonTextStyle={{fontSize: 14}}
          />
        </View>
      </KeyboardAwareScrollView>
      <Modal visible={isLoading} transparent>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Changing Password'}
        />
      </Modal>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  TitleDescriptionContainerContainer: {
    paddingTop: 10,
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
