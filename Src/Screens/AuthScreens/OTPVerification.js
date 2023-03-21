import {Modal, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import OTPInput from '../../Components/OTPInput';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import {resendOTPService, signupVerifyService} from '../../Services/ApiService';
import {getAuthCode} from '../../Utilities/Methods';
import {useProfile, useToken} from '../../Utilities/StoreData';
import Toast from '../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../../Store/Slices/AuthSlice';
import Loader from '../../Components/Loader';
import {COLORS} from '../../Utilities/Colors';

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
  const profile = useProfile();
  const [isLoading, setisLoading] = useState(false);

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
    setisLoading(true);
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
          console.log(timer, 'TIMER');
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  const handleOtpVerification = values => {
    setisLoading(true);
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
              dispatch(setMyProfile({...profile, is_mobile_no_verified: 1}));
            } else {
              dispatch(setMyProfile({...profile, is_email_id_verified: 1}));
            }
          } else {
            dispatch(setMyProfile({...profile, is_email_id_verified: 1}));
          }
          Toast.success(res.data.msg);
          // navigation.reset({
          //   routes: [{name: 'HomeStack'}],
          // });
          navigation.reset({
            routes: [{name: 'BottomTabNavigationAfterLogin'}],
          });
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  const getOtpSendedCommunication = () => {
    if (
      route.params &&
      route.params.otpType &&
      route.params.otpType === 'sms'
    ) {
      return profile.mobile;
    }
    return profile.email_id;
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
          settimer(0);
          resendOTPAPICall();
        }}
        errorText={errors.otp && touched.otp ? errors.otp : ''}
        paddingVertical={20}
        paddingBottom={40}
      />
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </AuthScreenHOC>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({});
