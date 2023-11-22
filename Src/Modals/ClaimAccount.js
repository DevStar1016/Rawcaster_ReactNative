import {Keyboard, Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useFormik} from 'formik';
import * as yup from 'yup';
import HeaderWithBack from '../Components/HeaderWithBack';
import {COLORS} from '../Utilities/Colors';
import TextBox from '../Components/TextBox';
import CustomDateMonthYearPicker from '../Components/CustomDateMonthYearPicker';
import DropDownPicker from '../Components/DropDownPicker';
import {getLocationAddress} from '../Utilities/Methods';
import {
  GENDER_LIST,
  IDENFY_STATUS,
  IDENFY_STATUS_MESSAGE,
  PHONE_REGEX,
  RAWCASTER_DEFAULT_MESSAGE,
} from '../Utilities/Constants';
import {
  useProfile,
  useToken,
  useUnclaimedAccountsList,
} from '../Utilities/StoreData';
import GooglePlacesList from '../Components/GooglePlacesList';
import SubmitButton from '../Components/SubmitButton';
import Toast from '../Components/Toast';
import {
  addClaimAccountService,
  verifyAccountService,
} from '../Services/ApiService';
import {useNavigation} from '@react-navigation/native';
import Loader from '../Components/Loader';

import ConfirmationPopup from './ConfirmationPopup';
import ProfileTopSection from '../Screens/MainScreens/ProfileDashboard/ProfileTopSection';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import StyledText from '../Components/StyledText';
import {FONTS} from '../Utilities/Fonts';
import {useDispatch} from 'react-redux';
import {setUnclaimedAccountsList} from '../Store/Slices/HomeSlice';
import {setMyProfile} from '../Store/Slices/AuthSlice';
import {StartIdenfyVerification} from '../Hooks/IdenfyHooks';

var isMount = true;

const ClaimAccount = ({route}) => {
  const dispatch = useDispatch();
  const unclaimedAccountsList = useUnclaimedAccountsList();
  const token = useToken();
  const profile = useProfile();
  const navigation = useNavigation();
  const {influencerId, isVerifyAccount} = route.params ?? {};
  const [isFetchingLocation, setisFetchingLocation] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isOpenGooglePlacesListModal, setisOpenGooglePlacesListModal] =
    useState(false);
  const [AccountVerifyConfirmationData, setAccountVerifyConfirmationData] =
    useState({
      isOpen: false,
      text: '',
      isPositive: false,
    });
  const [messageBoxData, setmessageBoxData] = useState({
    isOpen: false,
    message: '',
  });

  const validationSchema = yup.object().shape({
    firstName: yup
      .string()
      .min(2, 'Enter valid First name')
      .max(20, 'First name is too long')
      .required('First name is Required'),
    lastName: yup
      .string()
      .min(1, 'Enter Valid Last name')
      .max(20, 'Last name is too long')
      .required('Last name is Required'),
    dob: yup.string().required('Date of birth is required'),
    sex: isVerifyAccount
      ? yup.object().nullable().required('Required')
      : yup.object().nullable(),
    mobileNumber: yup
      .string()
      .matches(PHONE_REGEX, 'Invalid Phone number')
      .required('Phone number is Required'),
    email: yup
      .string()
      .email('Enter valid Email')
      .required('Email is Required'),
    location: yup
      .string()
      .min(2, 'Enter Valid location')
      .required('Location is Required'),
  });

  const {handleSubmit, handleChange, values, errors, touched, setFieldValue} =
    useFormik({
      initialValues: {
        firstName: profile?.first_name ?? '',
        lastName: profile?.last_name ?? '',
        dob: profile?.dob ?? '',
        mobileNumber: profile?.mobile ?? '',
        email: profile?.email_id ?? '',
        location: profile?.geo_location ?? '',
        sex: GENDER_LIST.find(item => item.id === profile?.gender) ?? null,
      },
      validationSchema: validationSchema,
      onSubmit: values => {
        if (isMount) {
          setisLoading(true);
        }
        HandleSubmitforVeification();
      },
    });

  const HandleSubmitforVeification = () => {
    if (isVerifyAccount) {
      handleVerifyAccount();
    } else {
      if (profile.account_verify_type === 2) {
        handleClaimAccount();
      } else if (profile.account_verify_type === 1) {
        setAccountVerifyConfirmationData({
          isOpen: true,
          text: RAWCASTER_DEFAULT_MESSAGE.CLAIM_NOT_VERIFIED_MESSAGE,
          isPositive: false,
        });
      } else {
        setAccountVerifyConfirmationData({
          isOpen: true,
          text: RAWCASTER_DEFAULT_MESSAGE.CLAIM_VERIFY_MESSAGE,
          isPositive: true,
        });
      }
    }
  };

  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
      Keyboard.dismiss();
      isMount = false;
    };
  }, []);

  /**
   * Handles the process of claiming an account.
   * @returns None
   */
  function handleClaimAccount() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('influencer_id', influencerId);
    formData.append('first_name', values.firstName.trim());
    formData.append('last_name', values.lastName.trim());
    formData.append('telephone', values.mobileNumber.toString().trim());
    formData.append('email_id', values.email.trim());
    formData.append('dob', values.dob);
    formData.append('location', values.location);
    addClaimAccountService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (unclaimedAccountsList && unclaimedAccountsList.length > 0) {
            let tempUnclaimedList = [...unclaimedAccountsList];
            const tempIndex = tempUnclaimedList.findIndex(
              item => item.user_id === influencerId,
            );
            if (tempIndex !== -1) {
              tempUnclaimedList[tempIndex] = {
                ...tempUnclaimedList[tempIndex],
                unclaimed_status: 2,
              };
            }
            dispatch(setUnclaimedAccountsList(tempUnclaimedList));
          }

          setmessageBoxData({
            isOpen: true,
            message: res.data.msg,
          });
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

  const HandleDisplayMessage = message => {
    setmessageBoxData({
      isOpen: true,
      message: message,
    });
  };

  const HandleManualVerify = response => {
    switch (response.manualIdentificationStatus) {
      case IDENFY_STATUS.APPROVED:
        dispatch(setMyProfile({...profile, acc_verify_status: 1}));
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.APPROVED);

        break;
      case IDENFY_STATUS.FAILED:
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.FAILED);
        break;
      case IDENFY_STATUS.WAITING:
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.WAITING);
        break;
      case IDENFY_STATUS.INACTIVE:
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.INACTIVE);
        break;
      default:
        Toast.fail(IDENFY_STATUS_MESSAGE.OTHERS);
        break;
    }
  };

  const HandleAutomatedVerify = response => {
    switch (response.autoIdentificationStatus) {
      case IDENFY_STATUS.APPROVED:
        HandleManualVerify(response);
        break;
      case IDENFY_STATUS.FAILED:
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.FAILED);
        break;
      case IDENFY_STATUS.UNVERIFIED:
        HandleDisplayMessage(IDENFY_STATUS_MESSAGE.UNVERIFIED);
        break;
      default:
        Toast.fail(IDENFY_STATUS_MESSAGE.OTHERS);
        break;
    }
  };

  const handleChangeIdenfyVerification = token => {
    setisLoading(true);
    StartIdenfyVerification(token)
      .then(response => {
        navigation.goBack();
        HandleAutomatedVerify(response);
      })
      .catch(error => {
        console.log(error, 'ERROR');
      })
      .finally(() => {
        setisLoading(false);
      });
  };
  /**
   * Handles the verification of a user account by sending the necessary form data to the server.
   * @returns None
   */
  function handleVerifyAccount() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('first_name', values.firstName.trim());
    formData.append('last_name', values.lastName.trim());
    formData.append('telephone', values.mobileNumber.toString().trim());
    formData.append('email_id', values.email.trim());
    formData.append('dob', values.dob);
    formData.append('gender', values.sex.id);
    formData.append('location', values.location);
    verifyAccountService(formData)
      .then(res => {
        if (res.data.status === 1) {
          handleChangeIdenfyVerification(res.data.verification_token);
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

  /**
   * Handles getting the current location address.
   * If the component is mounted, it sets the isFetchingLocation state to true.
   * It then calls the getLocationAddress function to retrieve the location address.
   * If the component is still mounted, it sets the 'location' field value to the retrieved geoLocation.
   * If there is an error, it displays a toast message with the error message.
   * Finally, if the component is still mounted, it sets the isFetchingLocation state to false.
   * @returns None
   */
  const handleGetCurrentLocationAddress = () => {
    if (isMount) {
      setisFetchingLocation(true);
    }
    getLocationAddress()
      .then(res => {
        if (isMount) {
          setFieldValue('location', res.geoLocation);
        }
      })
      .catch(e => {
        if (typeof e === 'string') {
          Toast.fail(e);
        } else {
          Toast.fail(e.message ?? 'Something went wrong');
        }
      })
      .finally(() => {
        if (isMount) {
          setisFetchingLocation(false);
        }
      });
  };

  /**
   * Closes the message box and navigates back to the previous screen.
   * If the message box is mounted, it sets the message box data to indicate that it is closed.
   * @returns None
   */
  function closeMessageBox() {
    if (isMount) {
      setmessageBoxData({
        isOpen: false,
        message: '',
      });
    }
    navigation.goBack();
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack
        title={`${isVerifyAccount ? 'Verify' : 'Claim'} Account`}
        isTitleCenter={true}
        isEnableSafeArea
      />
      <KeyboardAwareScrollView
        extraScrollHeight={10}
        contentContainerStyle={{paddingBottom: 25}}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <ProfileTopSection
          profile={profile}
          paddingHorizontal={10}
          isEnableFansList={false}
          isEnableEdit={false}
        />
        <View style={{flex: 1, paddingHorizontal: 10}}>
          <View style={styles.titleContainer}>
            <StyledText style={{fontSize: 16, fontFamily: FONTS.DMSans.bold}}>
              Confirm Profile Data
            </StyledText>
          </View>
          <TextBox
            title="First Name"
            placeHolder="Enter your First Name"
            value={values.firstName}
            isEditable={profile?.account_verify_type === 0}
            textColor={
              profile?.account_verify_type === 0 ? COLORS.black : COLORS.grey
            }
            errorText={
              errors.firstName && touched.firstName ? errors.firstName : ''
            }
            onChangeText={handleChange('firstName')}
          />
          <TextBox
            title="Last Name"
            placeHolder="Enter your Last Name"
            value={values.lastName}
            isEditable={profile?.account_verify_type === 0}
            textColor={
              profile?.account_verify_type === 0 ? COLORS.black : COLORS.grey
            }
            errorText={
              errors.lastName && touched.lastName ? errors.lastName : ''
            }
            onChangeText={handleChange('lastName')}
          />
          {isVerifyAccount && (
            <DropDownPicker
              dataList={GENDER_LIST}
              title={'Sex'}
              errorText={touched.sex && errors.sex}
              value={values.sex}
              isDisabled={profile?.account_verify_type !== 0}
              isEditable={profile?.account_verify_type === 0}
              fieldName="name"
              onSelectItem={item => {
                setFieldValue('sex', item);
              }}
              titlePaddingVertical={3}
              inputContainerMarginVertical={0}
              placeHolderText={'Select Sex'}
            />
          )}
          <TextBox
            title="Phone Number"
            placeHolder="Enter your Phone Number"
            value={values.mobileNumber}
            errorText={
              errors.mobileNumber && touched.mobileNumber
                ? errors.mobileNumber
                : ''
            }
            onChangeText={handleChange('mobileNumber')}
            isEditable={profile?.is_mobile_no_verified !== 1}
            textColor={
              profile?.is_mobile_no_verified === 1 ? COLORS.grey : COLORS.black
            }
            isEnableAlternateIconOfSecureIcon={
              profile?.is_mobile_no_verified === 1
            }
            alternateIconProps={{
              icon: 'verified_sign',
            }}
          />
          <TextBox
            title="Email"
            placeHolder="Enter your Email"
            value={values.email}
            errorText={errors.email && touched.email ? errors.email : ''}
            onChangeText={handleChange('email')}
            isEditable={profile?.is_email_id_verified !== 1}
            textColor={
              profile?.is_email_id_verified === 1 ? COLORS.grey : COLORS.black
            }
            isEnableAlternateIconOfSecureIcon={
              profile?.is_email_id_verified === 1
            }
            alternateIconProps={{
              icon: 'verified_sign',
            }}
          />
          <CustomDateMonthYearPicker
            value={values.dob}
            errorText={errors.dob && touched.dob ? errors.dob : ''}
            onSelect={handleChange('dob')}
            isDisabled={profile?.account_verify_type !== 0}
            onSelectDateMonthYearError={() => {
              if (isMount) {
                setFieldValue('dob', '');
              }
            }}
          />
          <DropDownPicker
            title={'Location'}
            isInsideList={false}
            value={values.location}
            errorText={touched.location && errors.location}
            dropDownIcon="gps"
            isDropDownIconAsButton={true}
            dropDownIconSize={20}
            isLoadingIcon={isFetchingLocation}
            onPress={() => {
              if (isMount) {
                setisOpenGooglePlacesListModal(true);
              }
            }}
            onPressIcon={() => {
              handleGetCurrentLocationAddress();
            }}
            titlePaddingVertical={3}
            inputContainerMarginVertical={0}
            placeHolderText={'Select Location'}
          />
          <SubmitButton buttonText="Submit" onPress={handleSubmit} />
        </View>
      </KeyboardAwareScrollView>
      <Modal
        onRequestClose={() => {
          if (isMount) {
            setisOpenGooglePlacesListModal(false);
          }
        }}
        visible={isOpenGooglePlacesListModal}>
        <GooglePlacesList
          setOpenModal={setisOpenGooglePlacesListModal}
          onSelect={location => {
            if (isMount) {
              setFieldValue('location', location);
            }
          }}
        />
      </Modal>

      <Modal
        onRequestClose={() => {
          closeMessageBox();
        }}
        transparent
        visible={AccountVerifyConfirmationData.isOpen}>
        <ConfirmationPopup
          isEnableClose={false}
          positiveButtonText={
            AccountVerifyConfirmationData.isPositive
              ? 'Verify Account'
              : 'Back to Profile'
          }
          onPressPositiveButton={() => {
            if (isMount) {
              if (AccountVerifyConfirmationData.isPositive) {
                setAccountVerifyConfirmationData({
                  isOpen: false,
                  text: '',
                  isPositive: false,
                });
                navigation.goBack();
                navigation.navigate('ClaimAccount', {
                  isVerifyAccount: true,
                });
              } else {
                closeMessageBox();
                setAccountVerifyConfirmationData({
                  isOpen: false,
                  text: '',
                  isPositive: false,
                });
              }
            }
          }}
          isEnableNegativeButton={false}
          content={AccountVerifyConfirmationData.text}
        />
      </Modal>

      <Modal visible={messageBoxData.isOpen} transparent>
        <ConfirmationPopup
          onClose={() => {
            closeMessageBox();
          }}
          titleContainerStyle={styles.confirmationTitleContainer}
          bottomTitleLogo="claim_user"
          bottomTitleLogoProps={{height: 55, width: 55}}
          bottomLogoContainerStyle={{paddingTop: 10}}
          titleTextStyle={{color: COLORS.white}}
          titleText={`${isVerifyAccount ? 'Verify' : 'Claim'} Account`}
          closeIconProps={{icon: 'close_white', height: 18, width: 18}}
          contentTextStyle={{textAlign: 'center'}}
          onPressPositiveButton={() => {
            closeMessageBox();
          }}
          isEnableNegativeButton={false}
          positiveButtonText="OK"
          content={messageBoxData.message}
        />
      </Modal>

      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default ClaimAccount;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  titleContainer: {
    paddingTop: 15,
    paddingBottom: 5,
  },
  confirmationTitleContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
  },
});
