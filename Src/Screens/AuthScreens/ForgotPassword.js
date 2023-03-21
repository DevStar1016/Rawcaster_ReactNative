import React, {useState} from 'react';
import {Modal} from 'react-native';
import {COLORS} from '../../Utilities/Colors';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {forgotPasswordService} from '../../Services/ApiService';
import Toast from '../../Components/Toast';
import {getAuthCode} from '../../Utilities/Methods';
import Loader from '../../Components/Loader';

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

  const handleForgotPassword = data => {
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
  };

  return (
    <AuthScreenHOC
      title="Forgot Password"
      subTitle="Please enter your email address to search for your account"
      submitButtonText="Send"
      buttonBottomTextAlignment="flex-start"
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      isEnableBackButton={true}
      onPressSubmitButton={handleSubmit}
      onPressBackButton={() => {
        navigation.goBack();
      }}
      onPressButtonBottomText={() => {
        navigation.goBack();
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your phone number or email address"
        title="Login ID"
        onChangeText={handleChange('login_id')}
        errorText={errors.login_id ? errors.login_id : ''}
        value={values.login_id}
      />
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </AuthScreenHOC>
  );
};

export default ForgotPassword;
