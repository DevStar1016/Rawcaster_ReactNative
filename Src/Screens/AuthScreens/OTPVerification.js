import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigation, useRoute} from '@react-navigation/native';
import {resendOTPService, signupVerifyService} from '../../Services/ApiService';
import {getAuthCode, setIsGlobalLoading} from '../../Utilities/Methods';
import {useMyProfile, useToken} from '../../Utilities/StoreData';
import Toast from '../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../../Store/Slices/AuthSlice';

const otpVerificationSchema = Yup.object({
  otp: Yup.string()
    .required('Otp is required')
    .min(6, 'Enter valid OTP')
    .max(6, 'Enter valid OTP'),
});

const OTPVerification = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const [otpRefId, setotpRefId] = useState(null);
  const [timer, settimer] = useState(0);
  const myProfile = useMyProfile();

  const {handleSubmit, handleChange, values, errors, touched} = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: otpVerificationSchema,
    onSubmit: values => {
      handleOtpVerification(values);
    },
  });

  useEffect(() => {
    resendOTPAPICall();
  }, []);

  const resendOTPAPICall = () => {
    setIsGlobalLoading(true, dispatch);
    const formData = new FormData();
    formData.append('auth_code', getAuthCode('Rawcaster'));
    formData.append('token', token);
    if (route.params && route.params.otpType) {
      formData.append('otp_flag', route.params.otpType);
    }
    resendOTPService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg, 4000);
          setotpRefId(res.data.otp_ref_id);
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

  const handleOtpVerification = values => {
    setIsGlobalLoading(true, dispatch);
    let formData = new FormData();
    formData.append('auth_code', getAuthCode(otpRefId));
    formData.append('otp_ref_id', otpRefId);
    formData.append('otp', values.otp);
    if (route.params && route.params.otpType) {
      formData.append('otp_flag', route.params.otpType);
    }
    signupVerifyService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (route.params && route.params.otpType) {
            if (route.params.otpType === 'sms') {
              dispatch(setMyProfile({...myProfile, is_mobile_no_verified: 1}));
            } else {
              dispatch(setMyProfile({...myProfile, is_email_id_verified: 1}));
            }
          } else {
            dispatch(setMyProfile({...myProfile, is_email_id_verified: 1}));
          }
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'HomeStack'}],
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

  const getOtpSendedCommunication = () => {
    if (
      route.params &&
      route.params.otpType &&
      route.params.otpType === 'sms'
    ) {
      return myProfile.mobile;
    }
    return myProfile.email_id;
  };

  return (
    <AuthScreenHOC
      title="Validate your email"
      subTitle={`Please enter the One Time Password (OTP) sent to ${getOtpSendedCommunication()}`}
      submitButtonText="Validate"
      isEnableCancelButton
      onPressCancelButton={() => {
        navigation.goBack();
      }}
      titleContainerAlignItems="flex-start"
      titleTextAlign="left"
      onPressSubmitButton={handleSubmit}
      isEnableBottomButtonText={false}>
      <OTPInput
        onCodeChanged={handleChange('otp')}
        seconds={timer}
        onResendOtp={() => {
          resendOTPAPICall();
        }}
        errorText={errors.otp && touched.otp ? errors.otp : ''}
        paddingVertical={20}
        paddingBottom={40}
      />
    </AuthScreenHOC>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({});
