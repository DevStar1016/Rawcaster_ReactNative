import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
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
  NAME_REGEX,
  PASSWORD_REGEX,
} from '../../../Utilities/Constants';
import {useDispatch} from 'react-redux';
import {signupService} from '../../../Services/ApiService';

const SignupWithPhone = () => {
  const navigation = useNavigation();

  const [isEnablePhoneNumber, setisEnablePhoneNumber] = useState(true);

  const signupWithPhoneSchema = Yup.object({
    name: Yup.string()
      .matches(NAME_REGEX, 'Enter valid name')
      .required('Name is required'),
    password: Yup.string()
      .min(8, 'Password to be at least 8 characters long')
      .matches(
        PASSWORD_REGEX,
        'Password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
      )
      .required('Password is required'),
    phone_or_email: isEnablePhoneNumber
      ? Yup.string().required('Phone number is required')
      : Yup.string()
          .matches(EMAIL_REGEX, 'Enter valid email')
          .required('Email is required'),
    dob: Yup.string().required('Date of birth is required'),
  });

  const {handleSubmit, handleChange, values, errors, setFieldValue, touched} =
    useFormik({
      initialValues: {
        name: '',
        phone_or_email: '',
        password: '',
        dob: '',
      },
      validationSchema: signupWithPhoneSchema,
      onSubmit: values => {
        handleSignupWithPhone(values);
      },
    });

  const handleSignupWithPhone = data => {
    console.log(data, 'signup with phone');
    let formData = new FormData();
    formData.append('first_name', data.name);
    formData.append('display_name', data.name);
    formData.append('email_id', data.phone_or_email);
    formData.append('password', data.password);
    formData.append('confirm_password', data.password);
    formData.append('dob', data.dob);
    signupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data, 'response');
          navigation.navigate('OTPVerification');
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
          isButton
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
        onChangeText={handleChange('phone_or_email')}
        errorText={errors.password && touched.password ? errors.password : ''}
        value={values.password}
        isSecure
        isEnablePasswordConditionText
      />
      <DOBPicker onSelect={handleChange('dob')} />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15}}>
        <StyledText style={{fontSize: 17}} paddingVertical={0}>
          {"By Signing up you agree with Rawcaster's "}
        </StyledText>
        <StyledText
          style={{color: COLORS.secondary, fontSize: 17}}
          isButton
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
