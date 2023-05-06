import {Modal, StyleSheet, Text, View} from 'react-native';
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
import {PHONE_REGEX} from '../Utilities/Constants';
import {useProfile, useToken} from '../Utilities/StoreData';
import GooglePlacesList from '../Components/GooglePlacesList';
import SubmitButton from '../Components/SubmitButton';
import Toast from '../Components/Toast';
import {addClaimAccountService} from '../Services/ApiService';
import {useNavigation} from '@react-navigation/native';
import Loader from '../Components/Loader';

import ConfirmationPopup from './ConfirmationPopup';

var isMount = true;

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, 'Enter valid First name')
    .max(20, 'First name is too long')
    .required('Required'),
  lastName: yup
    .string()
    .min(1, 'Enter Valid Last name')
    .max(20, 'Last name is too long')
    .required('Required'),
  dob: yup.string().required('Date of birth is required'),
  mobileNumber: yup
    .string()
    .matches(PHONE_REGEX, 'Invalid Telephone number')
    .required('Required'),
  email: yup.string().email('Enter valid Email').required('Required'),
  location: yup.string().min(2, 'Enter Valid location').required('Required'),
});

const ClaimAccount = ({route}) => {
  const token = useToken();
  const profile = useProfile();
  const navigation = useNavigation();
  const {influencerId} = route.params ?? {};
  const [isFetchingLocation, setisFetchingLocation] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isOpenGooglePlacesListModal, setisOpenGooglePlacesListModal] =
    useState(false);
  const [messageBoxData, setmessageBoxData] = useState({
    isOpen: false,
    message: '',
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
      },
      validationSchema: validationSchema,
      onSubmit: values => {
        if (isMount) {
          setisLoading(true);
        }
        handleClaimAccount();
      },
    });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

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
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisFetchingLocation(false);
        }
      });
  };

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
        title={'Claim Account'}
        isTitleCenter={true}
        isEnableSafeArea
      />
      <KeyboardAwareScrollView
        extraScrollHeight={10}
        style={{paddingHorizontal: 10}}
        contentContainerStyle={{paddingBottom: 25}}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <TextBox
          title="First Name"
          placeHolder="Enter your First Name"
          value={values.firstName}
          errorText={
            errors.firstName && touched.firstName ? errors.firstName : ''
          }
          onChangeText={handleChange('firstName')}
        />
        <TextBox
          title="Last Name"
          placeHolder="Enter your Last Name"
          value={values.lastName}
          errorText={errors.lastName && touched.lastName ? errors.lastName : ''}
          onChangeText={handleChange('lastName')}
        />
        <TextBox
          title="Telephone"
          placeHolder="Enter your Telephone"
          value={values.mobileNumber}
          errorText={
            errors.mobileNumber && touched.mobileNumber
              ? errors.mobileNumber
              : ''
          }
          onChangeText={handleChange('mobileNumber')}
        />
        <TextBox
          title="Email"
          placeHolder="Enter your Email"
          value={values.email}
          errorText={errors.email && touched.email ? errors.email : ''}
          onChangeText={handleChange('email')}
        />
        <CustomDateMonthYearPicker
          value={values.dob}
          errorText={errors.dob && touched.dob ? errors.dob : ''}
          onSelect={handleChange('dob')}
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
        <SubmitButton buttonText="Claim Account" onPress={handleSubmit} />
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

      <Modal visible={messageBoxData.isOpen} transparent>
        <ConfirmationPopup
          onClose={() => {
            closeMessageBox();
          }}
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
});
