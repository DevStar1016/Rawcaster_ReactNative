import {Image, Modal, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import FansProfilesContainer from './FansProfilesContainer';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {getAuthCode} from '../../../Utilities/Methods';
import Loader from '../../../Components/Loader';
import {COLORS} from '../../../Utilities/Colors';
import {updateMyProfileService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setMyProfile} from '../../../Store/Slices/AuthSlice';
import {ImageVideoPicker} from '../../../Utilities/ImageVideoPicker';

const BANNER_IMAGE_HEIGHT = 140;
const PROFILE_SIZE = 100;
const ProfileTopSection = ({userId, profile, paddingHorizontal}) => {
  const dispatch = useDispatch();
  const token = useToken();
  const [profileImage, setprofileImage] = useState(null);
  const [coverImage, setcoverImage] = useState(null);
  const [actionLoadingData, setactionLoadingData] = useState({
    isLoading: false,
    loaderText: '',
  });

  const setActionLoader = (status = false, text = '') => {
    setactionLoadingData({
      isLoading: status,
      loaderText: text,
    });
  };

  const profileUpdateAPICall = (type = 1, imageData) => {
    // 1 - profile image, 2 - cover image
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(token + profile.name));
    formData.append('token', token);
    formData.append('name', profile.name);
    if (type === 1) {
      formData.append('profile_image', imageData);
    } else {
      formData.append('cover_image', imageData);
    }
    updateMyProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);

          if (type === 1) {
            dispatch(setMyProfile({...profile, profile_image: imageData.uri}));
          } else if (type === 2) {
            dispatch(setMyProfile({...profile, cover_image: imageData.uri}));
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
          if (type === 1) {
            setprofileImage(null);
          } else if (type === 2) {
            setcoverImage(null);
          }
        }
      })
      .catch(e => {
        Toast.fail(e.message);
        if (type === 1) {
          setprofileImage(null);
        } else if (type === 2) {
          setcoverImage(null);
        }
      })
      .finally(() => {
        setActionLoader(false);
      });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.bannerContainer}>
        <Image
          source={{uri: coverImage ? coverImage.uri : profile.cover_image}}
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
        {!userId && (
          <RoundedIconButton
            icon="camera_black"
            iconSize={18}
            onPress={() => {
              ImageVideoPicker({mediaType: 'photo', height: 150, width: 500})
                .then(res => {
                  setcoverImage(res);
                  setActionLoader(true, 'Updating Cover Image');
                  profileUpdateAPICall(2, {...res});
                })
                .catch(e => {});
            }}
            buttonStyle={styles.cameraIconContainer}
          />
        )}
      </View>

      <View style={[styles.profileDataContainer, {paddingHorizontal}]}>
        <ProfileWithBadge
          profileImage={profileImage ? profileImage.uri : profile.profile_image}
          profileSize={PROFILE_SIZE}
          extraMargin={0}
          containerStyle={{
            marginRight: 10,
          }}
          isEnableImagePicker={!userId}
          onSelectImage={selectedImage => {
            if (!userId) {
              setprofileImage(selectedImage);
              setActionLoader(true, 'Updating Profile Image');
              profileUpdateAPICall(1, {...selectedImage});
            }
          }}
        />
        <FansProfilesContainer
          userId={userId}
          profileSize={PROFILE_SIZE / 2 - 5}
        />
      </View>
      <Modal transparent visible={actionLoadingData.isLoading}>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={actionLoadingData.loaderText}
        />
      </Modal>
    </View>
  );
};

export default ProfileTopSection;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'flex-end',
  },

  profileDataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginTop: BANNER_IMAGE_HEIGHT - PROFILE_SIZE / 2,
  },
  bannerContainer: {
    height: BANNER_IMAGE_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
});
