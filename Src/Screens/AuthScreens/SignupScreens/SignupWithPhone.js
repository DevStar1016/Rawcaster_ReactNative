import {Keyboard, Modal, SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';

import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../../Components/TextBox';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import CustomDateMonthYearPicker from '../../../Components/CustomDateMonthYearPicker';
import {IS_IOS, PASSWORD_REGEX} from '../../../Utilities/Constants';
import {signupService} from '../../../Services/ApiService';
import {
  DEVICE_ID,
  TERMS_CONDTION_URL,
} from '../../../Services/ServiceConstants';
import Toast from '../../../Components/Toast';
import {getAuthCode, storeToken} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import {useLocationDetails} from '../../../Utilities/StoreData';
import {setIsVisibleInfluencers} from '../../../Store/Slices/UtilitySlice';
import WebUrlLoaderModal from '../../../Modals/WebUrlLoaderModal';
import Loader from '../../../Components/Loader';

let isMount = true;
const SignupWithPhone = ({route}) => {
  const navigation = useNavigation();
  const locationDetails = useLocationDetails();
  const dispatch = useDispatch();
  const {loginId, signUpType, pushId /* 1 - Email, 2 - Phone*/} =
    route.params ?? {};

  const [isEnablePhoneNumber, setisEnablePhoneNumber] = useState(
    signUpType === 2 ? true : false,
  );
  const [isLoading, setisLoading] = useState(false);

  const [isOpenTermsAndConditionsModal, setisOpenTermsAndConditionsModal] =
    useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    password: Yup.string()
      .min(8, 'Password to be at least 8 characters long')
      // .matches(
      //   PASSWORD_REGEX,
      //   'Password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
      // )
      .required('Password is required'),
    login_id: isEnablePhoneNumber
      ? Yup.string().required('Phone number is required')
      : Yup.string().email('Enter valid email').required('Email is required'),
    dob: Yup.string().required('Date of birth is required'),
  });

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      name: '',
      login_id: loginId ?? '',
      password: '',
      dob: '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      dispatch(setIsVisibleInfluencers(true));
      setisLoading(true);

      handleSignupWithPhone(values);
    },
  });

  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false;
      Keyboard.dismiss();
    };
  }, []);

  const handleSignupWithPhone = values => {
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(values.login_id));
    formData.append('signup_type', isEnablePhoneNumber ? 2 : 1); // 1 - Email, 2 - Phone
    formData.append('first_name', values.name);
    formData.append('display_name', values.name);
    formData.append('dob', values.dob);
    formData.append('email_id', values.login_id?.trim());
    formData.append('password', values.password);
    formData.append('confirm_password', values.password);
    if (locationDetails && locationDetails.geoLocation) {
      formData.append('geo_location', locationDetails.geoLocation);
    }
    formData.append('ref_id', '');
    formData.append('device_id', DEVICE_ID);
    formData.append('push_id', pushId);
    // formData.append("voip_token", IS_IOS ? "" : null);
    formData.append('app_type', IS_IOS ? 2 : 1);

    signupService(formData)
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
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        }
      })
      .catch(err => {
        Toast.fail(err.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  return (
    <AuthScreenHOC
      title="Join Rawcaster Family"
      subTitle="Join now to access the latest insights, experience for your social media performance."
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      submitButtonText="Join Rawcaster Family"
      onPressSubmitButton={handleSubmit}
      onPressButtonBottomText={() => {
        navigation.reset({
          routes: [{name: 'Login'}],
        });
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your name"
        title="Name"
        onChangeText={handleChange('name')}
        errorText={errors.name && touched.name ? errors.name : ''}
        value={values.name}
      />
      {isEnablePhoneNumber ? (
        <TextBox
          iconColor={COLORS.placeHolderColor}
          placeHolder="Enter your phone number"
          title="Phone Number"
          keyboardType="number-pad"
          maxLength={13}
          onChangeText={handleChange('login_id')}
          errorText={errors.login_id && touched.login_id ? errors.login_id : ''}
          value={values.login_id}
        />
      ) : (
        <TextBox
          iconColor={COLORS.placeHolderColor}
          placeHolder="Enter your email address"
          title="Email Address"
          keyboardType="email-address"
          onChangeText={handleChange('login_id')}
          errorText={errors.login_id && touched.login_id ? errors.login_id : ''}
          value={values.login_id}
        />
      )}

      <View style={{alignItems: 'flex-end'}}>
        <StyledText
          style={styles.emailFieldToggleButtonText}
          onPress={() => {
            if (isMount) {
              setisEnablePhoneNumber(pre => !pre);
            }
          }}>
          {`Use ${isEnablePhoneNumber ? 'Email' : 'Phone Number'} instead`}
        </StyledText>
      </View>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isEditable
        onChangeText={handleChange('password')}
        errorText={errors.password && touched.password ? errors.password : ''}
        value={values.password}
        isSecure
        isEnablePasswordConditionText
      />
      <CustomDateMonthYearPicker
        onSelect={handleChange('dob')}
        errorText={errors.dob && touched.dob ? errors.dob : ''}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15}}>
        <StyledText style={{fontSize: 17}}>
          {"By Signing up you agree with Rawcaster's "}
        </StyledText>
        <StyledText
          style={{color: COLORS.secondary, fontSize: 17}}
          onPress={() => {
            setisOpenTermsAndConditionsModal(true);
          }}>
          terms and conditions
        </StyledText>
      </View>
      <Modal
        visible={isOpenTermsAndConditionsModal}
        transparent
        // statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {
          setisOpenTermsAndConditionsModal(false);
        }}>
        <SafeAreaView style={{flex: 1}}>
          <WebUrlLoaderModal
            url={TERMS_CONDTION_URL}
            setModal={setisOpenTermsAndConditionsModal}
          />
        </SafeAreaView>
      </Modal>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </AuthScreenHOC>
  );
};

export default SignupWithPhone;

const styles = StyleSheet.create({
  emailFieldToggleButtonText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.medium,
  },
});
