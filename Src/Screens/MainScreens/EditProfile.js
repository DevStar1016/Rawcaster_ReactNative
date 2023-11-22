import {
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useFormik} from 'formik';
import * as yup from 'yup';
import SVGIcon from '../../Components/SVGIcon';
import StyledText from '../../Components/StyledText';
import {FONTS} from '../../Utilities/Fonts';
import {COLORS} from '../../Utilities/Colors';
import {useProfile, useToken} from '../../Utilities/StoreData';
import ImagePicker from 'react-native-image-crop-picker';
import TextBox from '../../Components/TextBox';
import DropDownPicker from '../../Components/DropDownPicker';
import {GENDER_LIST, PHONE_REGEX} from '../../Utilities/Constants';
import CustomDateMonthYearPicker from '../../Components/CustomDateMonthYearPicker';
import SubmitButton from '../../Components/SubmitButton';
import PoliciesFooter from '../../Components/PoliciesFooter';
import Toast from '../../Components/Toast';
import GooglePlacesList from '../../Components/GooglePlacesList';
import {
  getAuthCode,
  getFileName,
  getLocationAddress,
  htmlDecodeText,
} from '../../Utilities/Methods';
import {useDispatch} from 'react-redux';
import {updateMyProfileService} from '../../Services/ApiService';
import {setMyProfile} from '../../Store/Slices/AuthSlice';
import {useNavigation} from '@react-navigation/native';
import VerificationMethodChoose from '../../Modals/VerificationMethodOptions';
import Loader from '../../Components/Loader';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import HeaderWithBack from '../../Components/HeaderWithBack';
import ReplaceStatusBar from '../../Components/ReplaceStatusBar';
import DefaultProfile from '../../Assets/Png/default_profile.png';

var isMount = true;
const EditProfile = ({route}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const profile = useProfile();
  const token = useToken();
  const [selectedProfileImage, setselectedProfileImage] = useState(null);
  const [isOpenGooglePlacesListModal, setisOpenGooglePlacesListModal] =
    useState(false);
  const [isOpenVerificationOptions, setisOpenVerificationOptions] =
    useState(false);
  const {requiredField} = route.params || {};

  const [isLoading, setisLoading] = useState(false);

  const isValidateEmail = useRef(false);

  const [isFetchingLocation, setisFetchingLocation] = useState(false);

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
    displayName: yup
      .string()
      .min(2, 'Enter Valid Display name')
      .max(30, 'Display name is too long')
      .required('Required'),
    sex: yup.object().nullable().required('Required'),
    gender: yup.string().max(20, 'Maximum 20 characters allowed'),
    dob: yup.string().required('Date of birth is required'),
    mobileNumber: yup
      .string()
      .matches(PHONE_REGEX, 'Invalid phone number')
      .test('Required', 'Required', function (value) {
        return profile?.mobile
          ? value
            ? true
            : false
          : requiredField === 'sms'
          ? value
            ? true
            : false
          : true;
      }),
    email: yup
      .string()
      .email('Enter valid Email')
      .test('Required', 'Required', function (value) {
        return profile?.email_id
          ? value
            ? true
            : false
          : requiredField === 'email'
          ? value
            ? true
            : false
          : true;
      }),
    location: yup.string().min(2, 'Enter Valid location').required('Required'),
    workAt: yup.string(),
    studyAt: yup.string(),
  });

  const {
    handleSubmit,
    handleChange,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
  } = useFormik({
    initialValues: {
      firstName: profile?.first_name ?? '',
      lastName: profile?.last_name ?? '',
      displayName: profile?.name ?? '',
      sex: GENDER_LIST.find(item => item.id === profile?.gender) ?? null,
      gender: profile?.other_gender ?? '',
      dob: profile?.dob ?? '',
      mobileNumber: profile?.mobile ?? '',
      email: profile?.email_id ?? '',
      location: profile?.geo_location ?? '',
      workAt: profile?.work_at ?? '',
      studyAt: profile?.studied_at ?? '',
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      if (isMount) {
        setisLoading(true);
        handleUpdateProfile();
      }
    },
  });

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
   * Handles the update of the user's profile by sending a request to the server with the updated profile data.
   * @returns None
   */
  const handleUpdateProfile = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append(
      'auth_code',
      getAuthCode(token + values.displayName.trim()),
    );
    formData.append('first_name', values.firstName.trim());
    formData.append('last_name', values.lastName.trim());
    formData.append('name', values.displayName.trim());
    formData.append('mobile_no', values.mobileNumber.toString().trim());
    formData.append('email_id', values.email.trim());
    formData.append('gender', values.sex.id);
    formData.append('other_gender', values.gender);
    formData.append('dob', values.dob);
    formData.append('geo_location', values.location);
    formData.append('work_at', values.workAt);
    formData.append('studied_at', values.studyAt);

    if (selectedProfileImage) {
      formData.append('profile_image', {
        uri: selectedProfileImage.path,
        type: selectedProfileImage.mime,
        name: getFileName(selectedProfileImage.path),
      });
    }
    updateMyProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempProfile = {...res.data.profile};
          tempProfile = {
            ...tempProfile,
            is_profile_updated: 1,
            name: htmlDecodeText(tempProfile.name),
            first_name: htmlDecodeText(tempProfile.first_name),
            last_name: htmlDecodeText(tempProfile.last_name),
            bio_data: htmlDecodeText(tempProfile.bio_data),
          };
          dispatch(setMyProfile(tempProfile));

          if (isValidateEmail.current) {
            if (requiredField) {
              navigation.navigate('EmailPhoneVerification', {
                otpType: requiredField,
              });
            } else if (
              parseInt(tempProfile.two_type_verification) === 1 &&
              tempProfile.mobile &&
              tempProfile.email_id
            ) {
              setisOpenVerificationOptions(true);
            } else if (tempProfile.email_id) {
              navigation.navigate('EmailPhoneVerification', {
                otpType: 'email',
              });
            } else if (tempProfile.mobile) {
              navigation.navigate('EmailPhoneVerification', {
                otpType: 'sms',
              });
            } else {
              Toast.fail('Phone Number and Email ID Missing');
            }
          } else {
            Toast.success(res.data.msg);
          }
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
  };

  /**
   * Opens the image picker to allow the user to select a profile photo.
   * @returns None
   */
  const onSelectProfilePhoto = () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
      mediaType: 'photo',
      smartAlbums: [
        'PhotoStream',
        'Generic',
        'Panoramas',
        'Videos',
        'Favorites',
        'Timelapses',
        'AllHidden',
        'RecentlyAdded',
        'Bursts',
        'SlomoVideos',
        'UserLibrary',
        'SelfPortraits',
        'Screenshots',
        'DepthEffect',
        'LivePhotos',
        'Animated',
        'LongExposure',
      ],
    })
      .then(res => {
        if (isMount) {
          setselectedProfileImage(res);
        }
      })
      .catch(err => {
        Toast.fail(err.message ?? 'Something went wrong');
      });
  };

  /**
   * Handles getting the current location address.
   * If the component is mounted, it sets the isFetchingLocation state to true.
   * It then calls the getLocationAddress function to retrieve the location address.
   * If the component is still mounted, it sets the 'location' field value to the retrieved geoLocation.
   * If there is an error, it catches the error and does nothing.
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
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisFetchingLocation(false);
        }
      });
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <ReplaceStatusBar />
      <HeaderWithBack title={'Update Profile'} />
      <KeyboardAwareScrollView
        extraScrollHeight={10}
        style={{paddingHorizontal: 10}}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <SVGIcon icon="app_text_logo_colored" height={55} width={180} />
        <StyledText style={styles.titleText}>
          Please update your profile
        </StyledText>
        <StyledText style={styles.subTitleText}>
          Please update your profile info to continue on Rawcaster
        </StyledText>
        <TouchableOpacity
          style={styles.profileImageContainer}
          activeOpacity={0.7}
          onPress={() => {
            onSelectProfilePhoto();
          }}>
          <Image
            source={
              selectedProfileImage || profile?.profile_image
                ? {
                    uri: selectedProfileImage
                      ? selectedProfileImage.path
                      : profile?.profile_image,
                  }
                : DefaultProfile
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <StyledText style={styles.uploadImageText}>Upload Image</StyledText>
        <TextBox
          title="First Name"
          errorText={touched.firstName && errors.firstName}
          value={values.firstName}
          onChangeText={handleChange('firstName')}
          titlePaddingVertical={3}
          maxLength={20}
          isEditable={profile?.account_verify_type === 0}
          textColor={
            profile?.account_verify_type === 0 ? COLORS.black : COLORS.grey
          }
          inputContainerMarginVertical={0}
          placeHolder={'Enter your first name'}
        />
        <TextBox
          title="Last Name"
          errorText={touched.lastName && errors.lastName}
          value={values.lastName}
          onChangeText={handleChange('lastName')}
          titlePaddingVertical={3}
          maxLength={20}
          isEditable={profile?.account_verify_type === 0}
          textColor={
            profile?.account_verify_type === 0 ? COLORS.black : COLORS.grey
          }
          inputContainerMarginVertical={0}
          placeHolder={'Enter your last name'}
        />
        <TextBox
          title="Display Name"
          errorText={touched.displayName && errors.displayName}
          value={values.displayName}
          onChangeText={handleChange('displayName')}
          titlePaddingVertical={3}
          maxLength={30}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your display name'}
        />
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

        <TextBox
          title="Gender"
          errorText={touched.gender && errors.gender}
          value={values.gender}
          onChangeText={handleChange('gender')}
          titlePaddingVertical={3}
          maxLength={20}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your gender'}
        />

        <TextBox
          title="Study"
          errorText={touched.studyAt && errors.studyAt}
          value={values.studyAt}
          onChangeText={handleChange('studyAt')}
          titlePaddingVertical={3}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your Study'}
        />
        <TextBox
          title="Work"
          errorText={touched.workAt && errors.workAt}
          value={values.workAt}
          onChangeText={handleChange('workAt')}
          titlePaddingVertical={3}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your Work'}
        />

        <CustomDateMonthYearPicker
          titlePaddingVertical={3}
          value={values.dob}
          errorText={errors.dob && touched.dob ? errors.dob : ''}
          onSelect={handleChange('dob')}
          onSelectDateMonthYearError={() => {
            setFieldValue('dob', '');
          }}
          isDisabled={profile?.account_verify_type !== 0}
          inputContainerMarginVertical={0}
          mainContainerMarginVertical={2}
        />

        <DropDownPicker
          title={'Location'}
          isInsideList={false}
          errorText={touched.location && errors.location}
          dropDownIcon="gps"
          isDropDownIconAsButton={true}
          dropDownIconSize={20}
          value={values.location}
          isLoadingIcon={isFetchingLocation}
          onPress={() => {
            setisOpenGooglePlacesListModal(true);
          }}
          onPressIcon={() => {
            handleGetCurrentLocationAddress();
          }}
          titlePaddingVertical={3}
          inputContainerMarginVertical={0}
          placeHolderText={'Select Location'}
        />
        <TextBox
          title="Phone Number"
          value={values.mobileNumber}
          onChangeText={handleChange('mobileNumber')}
          errorText={touched.mobileNumber && errors.mobileNumber}
          titlePaddingVertical={3}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your phone number'}
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
          value={values.email}
          onChangeText={handleChange('email')}
          errorText={touched.email && errors.email}
          titlePaddingVertical={3}
          inputContainerMarginVertical={0}
          placeHolder={'Enter your email'}
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

        <SubmitButton
          buttonText="Update Info"
          onPress={() => {
            isValidateEmail.current = false;
            handleSubmit();
          }}
        />
        {profile?.acc_verify_status === 0 && (
          <SubmitButton
            buttonText="Next"
            marginTop={10}
            onPress={() => {
              isValidateEmail.current = true;
              handleSubmit();
            }}
            borderColor={COLORS.primary}
            bgColor={COLORS.primary}
          />
        )}
        <PoliciesFooter />
      </KeyboardAwareScrollView>
      <Modal
        onRequestClose={() => {
          setisOpenGooglePlacesListModal(false);
        }}
        visible={isOpenGooglePlacesListModal}>
        <GooglePlacesList
          setOpenModal={setisOpenGooglePlacesListModal}
          onSelect={location => {
            setFieldValue('location', location);
          }}
        />
      </Modal>
      <Modal
        onRequestClose={() => {}}
        transparent
        visible={isOpenVerificationOptions}>
        <VerificationMethodChoose
          onSubmitOption={selectedOption => {
            setisOpenVerificationOptions(false);
            navigation.navigate('EmailPhoneVerification', {
              otpType: selectedOption,
            });
          }}
          onClose={() => {
            setisOpenVerificationOptions(false);
          }}
        />
      </Modal>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 17,
    fontFamily: FONTS.DMSans.bold,
    paddingVertical: 5,
  },
  subTitleText: {
    fontFamily: FONTS.DMSans.regular,
    fontSize: 14,
    paddingVertical: 5,
  },
  profileImageContainer: {
    paddingVertical: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.borderColor,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
  },
  uploadImageText: {
    alignSelf: 'center',
    fontSize: 14,
  },
});
