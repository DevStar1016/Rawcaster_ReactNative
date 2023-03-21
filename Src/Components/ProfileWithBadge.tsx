import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import SVGIcon from './SVGIcon';
import {BadgesType} from '../Utilities/Badges';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../Utilities/Colors';
import {getFileName, getUrlWithFilePrefix} from '../Utilities/Methods';

type ProfileImageProps = {
  uri: string;
  name: string;
  type: string;
};

type Props = {
  alternateProfileImageComponent?: React.FC<any> | undefined;
  profileSize?: number;
  profileImage?: any;
  borderRadius?: number;
  badge?: BadgesType;
  isEnableGradient?: boolean;
  isEnableWhiteBorderArroundGradient?: boolean;
  isEnableImagePicker?: boolean;
  containerStyle?: ViewStyle;
  badgeSize?: number;
  cameraIconSize?: number;
  extraMargin?: number;
  padding?: number;
  badgeContainerStyle?: ViewStyle;
  cameraIconContainerStyle?: ViewStyle;
  onSelectImage?: (value: ProfileImageProps) => void;
};

const ProfileWithBadge = ({
  profileSize = 60,
  borderRadius = profileSize / 2,
  profileImage,
  badge,
  isEnableWhiteBorderArroundGradient = false,
  extraMargin = 10,
  containerStyle = {},
  badgeContainerStyle = {},
  cameraIconContainerStyle = {},
  badgeSize = 25,
  cameraIconSize = 18,
  isEnableImagePicker = false,
  isEnableGradient = true,
  padding = 2,
  onSelectImage,
  alternateProfileImageComponent,
}: Props) => {
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
        if (onSelectImage) {
          onSelectImage({
            uri: getUrlWithFilePrefix(res.path),
            type: res.mime,
            name: getFileName(res.path),
          });
        }
      })
      .catch(err => {});
  };

  return (
    <View
      style={[
        styles.mainConatiner,
        {
          height: profileSize + extraMargin,
          width: profileSize + extraMargin,
          ...containerStyle,
        },
      ]}>
      {isEnableGradient ? (
        <View
          style={[
            styles.profileImageContainer,
            {
              padding: isEnableWhiteBorderArroundGradient ? padding : 0,
              height: profileSize,
              width: profileSize,
              borderRadius,
            },
          ]}>
          <LinearGradient
            colors={COLORS.gradientColorsSecondary}
            start={{x: 1, y: 1}}
            end={{x: 0, y: 0}}
            style={[
              styles.profileImageContainer,
              {
                height: '100%',
                width: '100%',
                borderRadius,
                padding,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            ) : (
              alternateProfileImageComponent &&
              alternateProfileImageComponent(undefined)
            )}
          </LinearGradient>
        </View>
      ) : (
        <View
          style={[
            styles.profileImageContainer,
            {height: profileSize, width: profileSize, borderRadius, padding},
          ]}>
          {profileImage && (
            <Image
              source={{uri: profileImage}}
              style={[styles.profileImage, {borderRadius}]}
            />
          )}
        </View>
      )}
      {isEnableImagePicker ? (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.cameraIconContainer, {...cameraIconContainerStyle}]}
          onPress={() => {
            onSelectProfilePhoto();
          }}>
          <SVGIcon
            icon={'camera_black'}
            height={cameraIconSize}
            width={cameraIconSize}
          />
        </TouchableOpacity>
      ) : (
        badge && (
          <View style={[styles.badgeContainer, {...badgeContainerStyle}]}>
            <SVGIcon icon={badge} height={badgeSize} width={badgeSize} />
          </View>
        )
      )}
    </View>
  );
};

export default ProfileWithBadge;

const styles = StyleSheet.create({
  mainConatiner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    padding: 2,
    backgroundColor: COLORS.white,
    borderRadius: 60 / 2,
    overflow: 'hidden',
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    bottom: 5,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: -7,
    bottom: 0,
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F2F5',
  },
  profileImage: {
    height: '100%',
    width: '100%',
    borderRadius: 60 / 2,
  },
});
