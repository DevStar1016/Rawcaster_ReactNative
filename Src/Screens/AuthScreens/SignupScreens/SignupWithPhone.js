import {Platform, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import TextBox from '../../../Components/TextBox';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import DOBPicker from '../../../Components/CustomDateMonthYearPicker';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {
  EMAIL_REGEX,
  IS_IOS,
  NAME_REGEX,
  PASSWORD_REGEX,
  SHA1,
} from '../../../Utilities/Constants';
import {signupService} from '../../../Services/ApiService';
import {DEVICE_ID, SALT_KEY} from '../../../Services/ServiceConstants';

let isMount = true;
const SignupWithPhone = ({route}) => {
  const navigation = useNavigation();
  const {loginId, signUpType /* 1 - Email, 2 - Phone*/} = route.params ?? {};
  const [isEnablePhoneNumber, setisEnablePhoneNumber] = useState(
    signUpType === 2 ? true : false,
  );
  const [isLoading, setisLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    password: Yup.string()
      .min(8, 'Password to be at least 8 characters long')
      .matches(
        PASSWORD_REGEX,
        'Password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
      )
      .required('Password is required'),
    phone_or_email: isEnablePhoneNumber
      ? Yup.string().required('Phone number is required')
      : Yup.string().email('Enter valid email').required('Email is required'),
    dob: Yup.string().required('Date of birth is required'),
  });

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      name: '',
      phone_or_email: loginId ?? '',
      password: '',
      dob: '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      if (isMount) {
        setisLoading(true);
      }
      handleSignupWithPhone(values);
    },
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const handleSignupWithPhone = values => {
    let formData = new FormData();
    formData.append('auth_code', SHA1(SALT_KEY + values.login_id));
    formData.append('signup_type', isEnablePhoneNumber ? 2 : 1); // 1 - Email, 2 - Phone
    formData.append('first_name', values.name);
    formData.append('display_name', values.name);
    formData.append('dob', values.dob);
    formData.append('email_id', values.phone_or_email);
    formData.append('password', values.password);
    formData.append('confirm_password', values.password);
    // formData.append('geo_location', "");
    postData.append('ref_id', '');
    formData.append('device_id', DEVICE_ID);
    // postData.append("push_id", "");
    // postData.append("voip_token", IS_IOS ? "" : null);
    formData.append('app_type', IS_IOS ? 2 : 1);

    signupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          navigation.navigate('OTPVerification', {
            state: {
              otp_ref_id: res.data.otp_ref_id,
            },
          });
        } else if (res.data.status === 0) {
        } else if (res.data.status === 2) {
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        } else if (res.data.status === 2) {
          navigation.reset({
            routes: [{name: 'Login'}],
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
      title="Join Rawcaster Family"
      subTitle="Join now to access the latest insights, experience for your social media performance."
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      submitButtonText="Join Rawcaster Family"
      isLoading={isLoading}
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
        isEditable={!isLoading}
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
          isEditable={!isLoading}
          onChangeText={handleChange('phone_or_email')}
          errorText={
            errors.phone_or_email && touched.phone_or_email
              ? errors.phone_or_email
              : ''
          }
          value={values.phone_or_email}
        />
      ) : (
        <TextBox
          iconColor={COLORS.placeHolderColor}
          placeHolder="Enter your email address"
          title="Email Address"
          keyboardType="email-address"
          isEditable={!isLoading}
          onChangeText={handleChange('phone_or_email')}
          errorText={
            errors.phone_or_email && touched.phone_or_email
              ? errors.phone_or_email
              : ''
          }
          value={values.phone_or_email}
        />
      )}

      <View style={{alignItems: 'flex-end'}}>
        <StyledText
          isButton={!isLoading}
          paddingVertical={0}
          style={styles.emailFieldToggleButtonText}
          onPress={() => {
            setisEnablePhoneNumber(pre => !pre);
          }}>
          {`Use ${isEnablePhoneNumber ? 'Email' : 'Phone Number'} instead`}
        </StyledText>
      </View>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isEditable={!isLoading}
        onChangeText={handleChange('password')}
        errorText={errors.password && touched.password ? errors.password : ''}
        value={values.password}
        isSecure
        isEnablePasswordConditionText
      />
      <DOBPicker
        onSelect={handleChange('dob')}
        isDisabled={isLoading}
        errorText={errors.dob && touched.dob ? errors.dob : ''}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15}}>
        <StyledText style={{fontSize: 17}} paddingVertical={0}>
          {"By Signing up you agree with Rawcaster's "}
        </StyledText>
        <StyledText
          style={{color: COLORS.secondary, fontSize: 17}}
          isButton={!isLoading}
          paddingVertical={0}
          onPress={() => {}}>
          terms and conditions
        </StyledText>
      </View>
    </AuthScreenHOC>
  );
};

export default SignupWithPhone;

const styles = StyleSheet.create({
  emailFieldToggleButtonText: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
});
