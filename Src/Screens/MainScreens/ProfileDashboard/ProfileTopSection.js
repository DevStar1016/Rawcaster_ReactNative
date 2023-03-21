import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile} from '../../../Utilities/StoreData';
import FansProfilesContainer from './FansProfilesContainer';
import SVGIcon from '../../../Components/SVGIcon';

const BANNER_IMAGE_HEIGHT = 140;
const PROFILE_SIZE = 100;
const ProfileTopSection = () => {
  const profile = useProfile();
  const [profileImage, setprofileImage] = useState(null);
  return (
    <View style={styles.mainContainer}>
      <View style={styles.bannerContainer}>
        <Image
          source={{uri: profile.cover_image}}
          resizeMode="cover"
          style={{width: '100%', height: '100%'}}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.cameraIconContainer}
          onPress={() => {}}>
          <SVGIcon icon={'camera_black'} height={18} width={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileDataContainer}>
        <ProfileWithBadge
          profileImage={profileImage ? profileImage.uri : profile.profile_image}
          profileSize={PROFILE_SIZE}
          extraMargin={0}
          containerStyle={{
            marginRight: 10,
          }}
          isEnableImagePicker
          onSelectImage={selectedImage => {
            setprofileImage(selectedImage);
          }}
        />
        <FansProfilesContainer profileSize={PROFILE_SIZE / 2 - 5} />
      </View>
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
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F5',
  },
});
