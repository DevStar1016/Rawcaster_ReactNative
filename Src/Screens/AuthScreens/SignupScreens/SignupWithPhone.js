import {Keyboard, Modal, SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import TextBox from '../../../Components/TextBox';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import CustomDateMonthYearPicker from '../../../Components/CustomDateMonthYearPicker';
import {
  EMAIL_REGEX,
  GENDER_LIST,
  IS_IOS,
  MAX_CHARACTERS,
  PHONE_REGEX,
} from '../../../Utilities/Constants';
import {signupService} from '../../../Services/ApiService';
import {
  DEVICE_ID,
  TERMS_CONDTION_URL,
} from '../../../Services/ServiceConstants';
import SloganLogo from '../../../Assets/Svg/slogan_logo.svg';
import Toast from '../../../Components/Toast';
import {
  getAuthCode,
  getLocationAddress,
  storeToken,
} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import {useLocationDetails} from '../../../Utilities/StoreData';
import {
  setIsVisibleInfluencers,
  setLocationDetails,
} from '../../../Store/Slices/UtilitySlice';
import WebUrlLoaderModal from '../../../Modals/WebUrlLoaderModal';
import Loader from '../../../Components/Loader';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ReplaceStatusBar from '../../../Components/ReplaceStatusBar';
import SubmitButton from '../../../Components/SubmitButton';
import PoliciesFooter from '../../../Components/PoliciesFooter';
import DropDownPicker from '../../../Components/DropDownPicker';
import CheckBox from '../../../Components/CheckBox';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';

let isMount = true;
const SignupWithPhone = ({route}) => {
  const navigation = useNavigation();
  const locationDetails = useLocationDetails();
  const dispatch = useDispatch();
  const {loginId, signUpType, refId, pushId /* 1 - Email, 2 - Phone*/} =
    route.params ?? {};

  // const [isEnablePhoneNumber, setisEnablePhoneNumber] = useState(
  //   signUpType === 2 ? true : false,
  // );
  const [optinConfirmationData, setoptinConfirmationData] = useState({
    status: false,
    text: '',
    isContinue: false,
  });
  const [isLoading, setisLoading] = useState(false);

  const [isOpenTermsAndConditionsModal, setisOpenTermsAndConditionsModal] =
    useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .trim('Name cannot include leading and trailing spaces')
      .strict(true)
      .max(
        MAX_CHARACTERS.firstName,
        `Name cannot be longer than ${MAX_CHARACTERS.firstName} characters`,
      ),
    password: Yup.string()
      .min(8, 'Password to be at least 8 characters long')
      .trim('Password cannot include leading and trailing spaces')
      .strict(true)
      // .matches(
      //   PASSWORD_REGEX,
      //   'Password contain uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a number (0-9)',
      // )
      .required('Password is required'),
    isEnablePhoneNumber: Yup.boolean(),
    login_id: Yup.string().test('login_id', 'required', (value, ctx) => {
      const {isEnablePhoneNumber} = ctx.parent;
      if (!value) {
        return ctx.createError({
          message: `${
            isEnablePhoneNumber ? 'Phone number' : 'Email'
          } is required`,
        });
      }
      const isValid = isEnablePhoneNumber
        ? PHONE_REGEX.test(value)
        : EMAIL_REGEX.test(value);
      if (!isValid) {
        return ctx.createError({
          message: `Enter valid ${
            isEnablePhoneNumber ? 'phone number' : 'email'
          }`,
        });
      }
      return true;
    }),
    country: Yup.object()
      .nullable()
      .test('country', 'required', (value, ctx) => {
        const {isEnablePhoneNumber} = ctx.parent;
        if (isEnablePhoneNumber && !value) {
          return ctx.createError({
            message: 'Country code is required',
          });
        }
        return true;
      }),
    //  isEnablePhoneNumber
    //   ? Yup.string().required('Phone number is required')
    //   : Yup.string().email('Enter valid email').required('Email is required'),
    dob: Yup.string().required('Date of birth is required'),
    sex: Yup.object().nullable().required('Sex is required'),
    gender: Yup.string().max(20, 'Maximum 20 characters allowed'),
  });

  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: {
      name: '',
      isEnablePhoneNumber: signUpType === 2 ? true : false,
      login_id: loginId ?? '',
      password: '',
      dob: '',
      sex: null,
      country: null,
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      if (values.isEnablePhoneNumber) {
        if (isMount) {
          setoptinConfirmationData({
            isContinue: true,
            status: true,
            text: 'By Providing your phone number, you agree to receive text messages from Rawcaster.com with your One-Time-Password, during signup or password reset. Message and data rates may apply. If you wish to STOP receiving SMS messages from Rawcaster.com, please uncheck this box and register with email',
          });
        }
      } else {
        if (isMount) {
          setisLoading(true);
        }
        handleSignupWithPhone(values);
      }
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

  const handleContinueOptinConfirmation = () => {
    if (isMount) {
      setisLoading(true);
    }
    getLocationAddress()
      .then(res => {
        dispatch(setLocationDetails(res));

        handleSignupWithPhone(values, res);
      })
      .catch(e => {
        if (isMount) {
          setisLoading(false);
        }
        Toast.fail(
          'Please enable location permissions in settings to sign-up with phone number',
        );
      });
  };

  /**
   * Handles the signup process with phone number.
   * @param {object} values - The form values submitted for signup.
   * @returns None
   */
  const handleSignupWithPhone = (values, tempLocationDetails) => {
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(values.login_id));
    formData.append('signup_type', values.isEnablePhoneNumber ? 2 : 1); // 1 - Email, 2 - Phone
    formData.append('first_name', values.name.trim());
    formData.append('display_name', values.name.trim());
    formData.append('dob', values.dob);
    formData.append('gender', values.sex?.id);
    if (values.gender) {
      formData.append('other_gender', values.gender);
    }
    formData.append('email_id', values.login_id?.trim());
    if (
      values.isEnablePhoneNumber &&
      values.country &&
      values.login_id?.trim()
    ) {
      formData.append('country_id', values.country.id);
      formData.append('country_code', values.country.phone_code);
    }

    formData.append('password', values.password);
    formData.append('confirm_password', values.password);
    if (locationDetails || tempLocationDetails) {
      if (locationDetails?.geoLocation || tempLocationDetails?.geoLocation) {
        formData.append(
          'geo_location',
          locationDetails?.geoLocation ?? tempLocationDetails?.geoLocation,
        );
      }
      if (locationDetails?.latitude || tempLocationDetails?.latitude) {
        formData.append(
          'latitude',
          locationDetails?.latitude ?? tempLocationDetails?.latitude,
        );
      }
      if (locationDetails?.longitude || tempLocationDetails?.longitude) {
        formData.append(
          'longitude',
          locationDetails?.longitude ?? tempLocationDetails?.longitude,
        );
      }
    }
    formData.append('ref_id', '');
    formData.append('device_id', DEVICE_ID);
    formData.append('push_id', pushId);
    if (refId) {
      formData.append('ref_id', refId);
    }

    // formData.append("voip_token", IS_IOS ? "" : null);
    formData.append('app_type', IS_IOS ? 2 : 1);
    signupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (res.data.acc_verify_status === 1) {
            if (parseInt(res.data.first_time) === 1) {
              dispatch(setIsVisibleInfluencers(true));
            }
            storeToken(res.data.token, dispatch);
          } else if (res.data.acc_verify_status === 0) {
            navigation.navigate('EmailPhoneVerification', {
              otpType: parseInt(res.data.signup_type) === 1 ? 'email' : 'sms',
              emailMobile: res.data.email_id,
              isFromLoginSignup: true,
              otp_ref_id: res.data.otp_ref_id,
              remaining_seconds: res.data.remaining_seconds,
              alt_token_id: res.data.alt_token_id,
              group_id: res.data.group_id,
            });
          }
          Toast.success(res.data.msg);
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
        // contentContainerStyle={{flex: 1}}
        scrollEnabled={true}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SloganLogo />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <StyledText style={styles.title}>Join Rawcaster Family</StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'center'}}>
              Join now to access the latest insights, experience for your social
              media performance.
            </StyledText>
          </View>

          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your name"
            title="Name"
            maxLength={MAX_CHARACTERS.firstName}
            onChangeText={handleChange('name')}
            errorText={errors.name && touched.name ? errors.name : ''}
            value={values.name}
          />
          {values.isEnablePhoneNumber ? (
            <TextBox
              iconColor={COLORS.placeHolderColor}
              placeHolder="Enter your phone number"
              title="Phone Number"
              keyboardType="number-pad"
              maxLength={MAX_CHARACTERS.mobileNumber}
              isEnableCountryCode
              inputContainerMarginLeft={10}
              onChangeText={handleChange('login_id')}
              errorText={
                touched.country && errors.country
                  ? errors.country
                  : errors.login_id && touched.login_id
                  ? errors.login_id
                  : ''
              }
              countryCodePickerProps={{
                listType: 'large',
                fieldName: 'phone_code',
                listFieldName: 'name',
                value: values.country,
                listTitle: 'Select Country Code',
                isHideErrorText: true,
                errorText: touched.country && errors.country,
                bigListProps: {
                  apiName: 'country',
                  isAPICall: true,
                  secondaryFieldName: 'phone_code',
                },
                onSelectItem: selectedItem => {
                  setFieldValue('country', selectedItem);
                },
              }}
              value={values.login_id}
            />
          ) : (
            <TextBox
              iconColor={COLORS.placeHolderColor}
              placeHolder="Enter your email address"
              title="Email Address"
              keyboardType="email-address"
              onChangeText={handleChange('login_id')}
              errorText={
                errors.login_id && touched.login_id ? errors.login_id : ''
              }
              value={values.login_id}
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: values.isEnablePhoneNumber
                ? 'space-between'
                : 'flex-end',
            }}>
            {values.isEnablePhoneNumber && (
              <CheckBox
                text="Opt-in for SMS messages"
                isSelected={true}
                onPress={() => {
                  setoptinConfirmationData({
                    status: true,
                    text: 'No SMS messages will be sent to your phone. You will need to register with your email address to receive your One-Time-Password.',
                  });
                }}
              />
            )}
          </View>
          <View
            style={{
              alignItems: 'flex-end',
              paddingTop: values.isEnablePhoneNumber ? 5 : 0,
            }}>
            <StyledText
              style={styles.emailFieldToggleButtonText}
              onPress={() => {
                if (isMount) {
                  setValues(preValues => ({
                    ...preValues,
                    login_id: '',
                    country: null,
                    isEnablePhoneNumber: !preValues.isEnablePhoneNumber,
                  }));
                  // setisEnablePhoneNumber(pre => !pre);
                }
              }}>
              {`Use ${
                values.isEnablePhoneNumber ? 'email' : 'phone number'
              } instead`}
            </StyledText>
          </View>
          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your password"
            title="Password"
            isEditable
            maxLength={MAX_CHARACTERS.password}
            onChangeText={handleChange('password')}
            errorText={
              errors.password && touched.password ? errors.password : ''
            }
            value={values.password}
            isSecure
            isEnablePasswordConditionText
          />
          <CustomDateMonthYearPicker
            onSelect={handleChange('dob')}
            errorText={errors.dob && touched.dob ? errors.dob : ''}
            onSelectDateMonthYearError={() => {
              setFieldValue('dob', '');
            }}
          />
          <DropDownPicker
            dataList={GENDER_LIST}
            title={'Sex'}
            errorText={touched.sex && errors.sex}
            value={values.sex}
            fieldName="name"
            onSelectItem={item => {
              setFieldValue('sex', item);
            }}
            titlePaddingVertical={3}
            inputContainerMarginVertical={0}
            placeHolderText={'Select Sex'}
          />
          <TextBox
            iconColor={COLORS.placeHolderColor}
            placeHolder="Enter your gender"
            title="Gender"
            maxLength={MAX_CHARACTERS.gender}
            onChangeText={handleChange('gender')}
            errorText={errors.gender && touched.gender ? errors.gender : ''}
            value={values.gender}
          />
          <View
            style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15}}>
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

          <SubmitButton
            buttonText={'Join Rawcaster Family'}
            onPress={handleSubmit}
          />

          <View style={styles.signUpContainer}>
            <StyledText style={styles.signUpText}>
              Already Registered?
            </StyledText>
            <StyledText
              onPress={() => {
                navigation.reset({
                  routes: [{name: 'Login'}],
                });
              }}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              Login
            </StyledText>
          </View>

          <PoliciesFooter />
        </View>
      </KeyboardAwareScrollView>
      <Modal
        visible={isOpenTermsAndConditionsModal}
        transparent
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

      <Modal
        onRequestClose={() => {}}
        transparent
        visible={optinConfirmationData.status}>
        <ConfirmationPopup
          isEnableClose={false}
          positiveButtonText={
            optinConfirmationData.isContinue ? 'Continue' : 'Cancel'
          }
          onPressPositiveButton={() => {
            if (isMount) {
              setoptinConfirmationData({
                status: false,
                text: '',
              });
              if (optinConfirmationData.isContinue) {
                handleContinueOptinConfirmation();
              }
            }
          }}
          negativeButtonText={'Register with email'}
          onPressNegativeButton={() => {
            if (isMount) {
              setoptinConfirmationData({
                status: false,
                text: '',
              });
              setValues(preValues => ({
                ...preValues,
                isEnablePhoneNumber: false,
                login_id: '',
              }));
            }
          }}
          content={optinConfirmationData.text}
        />
      </Modal>
    </View>
  );
};

export default SignupWithPhone;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emailFieldToggleButtonText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.medium,
  },
  logoContainer: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
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
