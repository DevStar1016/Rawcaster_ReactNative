import {Image, Modal, StyleSheet, View} from 'react-native';
import React, {useRef, useState} from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {
  useFollowingUsersList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
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
import SVGIcon from '../../../Components/SVGIcon';
import MenuContainer from '../../../Modals/MenuContainer';
import Clipboard from '@react-native-community/clipboard';

const MENU_LIST = [
  {id: 1, buttonName: 'Remove Friend'},
  {id: 2, buttonName: 'UnFollow'},
  {id: 3, buttonName: 'Copy Link'},
];

const BANNER_IMAGE_HEIGHT = 140;
const PROFILE_SIZE = 100;
const ProfileTopSection = ({
  userId,
  profile,
  paddingHorizontal,
  onLayout,
  isEnableFansList = true,
  isEnableEdit = true,
  isEnableRemoveFriend = false,
  onRemoveFriend,
  onUnfollow,
}) => {
  const dispatch = useDispatch();
  const token = useToken();
  const myProfile = useProfile();
  const [isOpenMenuList, setisOpenMenuList] = useState(false);
  const [profileImage, setprofileImage] = useState(null);
  const [coverImage, setcoverImage] = useState(null);
  const [actionLoadingData, setactionLoadingData] = useState({
    isLoading: false,
    loaderText: '',
  });

  const followingUsersList = useFollowingUsersList();

  const isFan = () => {
    const tempFollowingUsersList = [...followingUsersList];
    return tempFollowingUsersList.find(ele => ele.user_id === profile.user_id)
      ? true
      : false;
  };

  const setActionLoader = (status = false, text = '') => {
    setactionLoadingData({
      isLoading: status,
      loaderText: text,
    });
  };

  const profileUpdateAPICall = (type = 1, imageData) => {
    // 1 - profile image, 2 - cover image
    const formData = new FormData();
    formData.append('auth_code', getAuthCode(token + profile?.name));
    formData.append('token', token);
    formData.append('name', profile?.name);
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

  const getOptionsList = () => {
    let tempMenuList = [...MENU_LIST];
    if (!isEnableRemoveFriend) {
      tempMenuList = tempMenuList.filter(item => item.id !== 1);
    }
    if (!isFan() || myProfile?.user_id === profile?.user_id) {
      tempMenuList = tempMenuList.filter(item => item.id !== 2);
    }
    if (!myProfile?.user_id) {
      tempMenuList = tempMenuList.filter(item => item.id !== 3);
    }
    return [...tempMenuList];
  };

  return (
    <View onLayout={onLayout} style={styles.mainContainer}>
      <View style={styles.bannerContainer}>
        <Image
          source={{uri: coverImage ? coverImage.uri : profile?.cover_image}}
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
        {!userId && isEnableEdit && (
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
                .catch(e => {
                  Toast.fail(e.message ?? 'Something went wrong');
                });
            }}
            buttonStyle={styles.cameraIconContainer}
          />
        )}
      </View>

      <View style={[styles.profileDataContainer, {paddingHorizontal}]}>
        <ProfileWithBadge
          profileImage={
            profileImage ? profileImage.uri : profile?.profile_image
          }
          profileSize={PROFILE_SIZE}
          extraMargin={0}
          containerStyle={{
            marginRight: 10,
          }}
          isEnableImagePicker={!userId && isEnableEdit}
          onSelectImage={selectedImage => {
            if (!userId) {
              setprofileImage(selectedImage);
              setActionLoader(true, 'Updating Profile Image');
              profileUpdateAPICall(1, {...selectedImage});
            }
          }}
          topRightIcon={
            profile &&
            parseInt(profile?.account_verify_type) === 2 &&
            'verified_sign'
          }
          topRightIconAsButton={false}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          {isEnableFansList ? (
            <FansProfilesContainer
              userId={userId}
              profileSize={PROFILE_SIZE / 2 - 5}
            />
          ) : (
            <View />
          )}

          {getOptionsList().length > 0 && (
            <View
              style={{
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <SVGIcon
                icon="menu_horizontal"
                isButton
                onPress={() => {
                  setisOpenMenuList(true);
                }}
              />
            </View>
          )}
        </View>
      </View>

      <Modal transparent visible={actionLoadingData.isLoading}>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={actionLoadingData.loaderText}
        />
      </Modal>
      <Modal
        visible={isOpenMenuList}
        transparent
        onRequestClose={() => {
          setisOpenMenuList(false);
        }}>
        <MenuContainer
          setModal={status => {
            setisOpenMenuList(status);
          }}
          buttonsOptions={getOptionsList()}
          onPressOption={selectedId => {
            setisOpenMenuList(false);
            if (selectedId === 1) {
              onRemoveFriend();
            } else if (selectedId === 2) {
              onUnfollow();
            } else if (selectedId === 3) {
              if (profile.profile_url) {
                Clipboard.setString(profile.profile_url);
                Toast.success('Profile Link Copied');
              }
            }
          }}
          // buttonsOptions={getMenuOptions()}
          // onPressOption={onPressNuggetAction}
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
