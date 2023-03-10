import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import TextBox from '../../Components/TextBox';
import {COLORS} from '../../Utilities/Colors';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {PASSWORD_REGEX} from '../../Utilities/Constants';
import {DEVICE_ID} from '../../Services/ServiceConstants';
import {
  resendOTPService,
  verifyOtpAndResetPassword,
} from '../../Services/ApiService';
import {getAuthCode, setIsGlobalLoading} from '../../Utilities/Methods';
import {useDispatch} from 'react-redux';
import Toast from '../../Components/Toast';

const resetPasswordSchema = Yup.object({
  otp: Yup.string()
    .required('Otp is required')
    .min(6, 'Enter valid OTP')
    .max(6, 'Enter valid OTP'),
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

const ResetPasswordOTP = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {otp_ref_id, remaining_seconds} = route.params;
  const [timer, settimer] = useState(remaining_seconds);

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      otp: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: values => {
      setIsGlobalLoading(true, dispatch);
      handleVerifyOtpResetPassword(values);
    },
  });

  const onResendOtp = () => {
    setIsGlobalLoading(true, dispatch);
    handleResendOTP();
  };

  const handleResendOTP = () => {
    const formData = new FormData();
    formData.append('otp_ref_id', otp_ref_id);
    formData.append('auth_code', getAuthCode(otp_ref_id));
    resendOTPService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          settimer(parseInt(res.data.remaining_seconds));
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setIsGlobalLoading(false, dispatch);
      });
  };

  const handleVerifyOtpResetPassword = values => {
    let formData = new FormData();
    formData.append('otp_ref_id', otp_ref_id);
    formData.append('otp', values.otp);
    formData.append('new_password', values.password);
    formData.append('confirm_password', values.confirm_password);
    formData.append('auth_code', getAuthCode(otp_ref_id));
    formData.append('device_id', DEVICE_ID);
    verifyOtpAndResetPassword(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'Login'}],
          });
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setIsGlobalLoading(false, dispatch);
      });
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
      <OTPInput
        onCodeChanged={handleChange('otp')}
        seconds={timer}
        onResendOtp={onResendOtp}
        errorText={errors.otp && touched.otp ? errors.otp : ''}
      />
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
