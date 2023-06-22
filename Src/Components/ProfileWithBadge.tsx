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
import {IconType} from '../Utilities/Icons';
import DeafaultProfile from '../Assets/Png/default_profile.png';

type ProfileImageProps = {
  uri: string;
  name: string;
  type: string;
};

export type ProfileWithBadgeProps = {
  alternateProfileImageComponent?: React.FC<any> | undefined;
  profileSize?: number;
  profileImage?: any;
  borderRadius?: number;
  badge?: BadgesType;
  topRightIcon?: IconType;
  isOnline?: boolean;
  topRightIconSize?: number;
  topRightIconContainerBackgroundColor?: string;
  topRightIconContainerStyle?: ViewStyle;
  isEnableGradient?: boolean;
  isEnableWhiteBorderArroundGradient?: boolean;
  isEnableImagePicker?: boolean;
  topRightIconAsButton?: boolean;
  containerStyle?: ViewStyle;
  badgeSize?: number;
  cameraIconSize?: number;
  extraMargin?: number;
  padding?: number;
  defaultProfileImage?: any;
  isEnableOnlineOfflineStatus?: boolean;
  isButton?: boolean;
  isEnableOnPressImagePicker?: boolean;
  onPressProfile?: () => void;
  badgeContainerStyle?: ViewStyle;
  cameraIconContainerStyle?: ViewStyle;
  onPressTopRightIcon?: () => void;
  onSelectImage?: (value: ProfileImageProps) => void;
};

const ProfileWithBadge = ({
  profileSize = 60,
  borderRadius = profileSize / 2,
  profileImage,
  defaultProfileImage,
  badge,
  isEnableOnlineOfflineStatus = false,
  isButton = false,
  onPressProfile,
  isEnableOnPressImagePicker = false,
  isOnline = false,
  topRightIconAsButton = true,
  isEnableWhiteBorderArroundGradient = false,
  extraMargin = 10,
  topRightIconContainerBackgroundColor,
  containerStyle = {},
  badgeContainerStyle = {},
  cameraIconContainerStyle = {},
  badgeSize = 25,
  topRightIcon,
  topRightIconSize = 25,
  topRightIconContainerStyle = {},
  cameraIconSize = 18,
  isEnableImagePicker = false,
  isEnableGradient = true,
  padding = 2,
  onSelectImage,
  alternateProfileImageComponent,
  onPressTopRightIcon,
}: ProfileWithBadgeProps) => {
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
    <TouchableOpacity
      style={[
        styles.mainConatiner,
        {
          height: profileSize + extraMargin,
          width: profileSize + extraMargin,
          ...containerStyle,
        },
      ]}
      onPress={() => {
        if (isEnableOnPressImagePicker) {
          onSelectProfilePhoto();
        } else if (onPressProfile) {
          onPressProfile();
        }
      }}
      disabled={!isButton}
      activeOpacity={isButton ? 0.9 : 1}>
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
              <Image
                source={{uri: profileImage}}
                style={styles.profileImage}
                borderRadius={borderRadius}
              />
            ) : alternateProfileImageComponent ? (
              alternateProfileImageComponent(undefined)
            ) : (
              <Image
                source={defaultProfileImage ?? DeafaultProfile}
                style={styles.profileImage}
                borderRadius={borderRadius}
              />
            )}
          </LinearGradient>
        </View>
      ) : (
        <View
          style={[
            styles.profileImageContainer,
            {height: profileSize, width: profileSize, borderRadius, padding},
          ]}>
          {profileImage ? (
            <Image
              source={{uri: profileImage}}
              style={[styles.profileImage, {borderRadius}]}
              borderRadius={borderRadius}
            />
          ) : (
            <Image
              source={defaultProfileImage ?? DeafaultProfile}
              style={[styles.profileImage, {borderRadius}]}
              borderRadius={borderRadius}
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

      {topRightIcon ? (
        <TouchableOpacity
          disabled={!topRightIconAsButton}
          onPress={onPressTopRightIcon}
          activeOpacity={0.9}
          style={[
            styles.topRightIconContainer,
            {
              height: topRightIconSize + 10,
              width: topRightIconSize + 10,
              borderRadius: (topRightIconSize + 10) / 2,
              backgroundColor: topRightIconContainerBackgroundColor,
              ...topRightIconContainerStyle,
            },
          ]}>
          <SVGIcon
            icon={topRightIcon}
            height={topRightIconSize}
            width={topRightIconSize}
          />
        </TouchableOpacity>
      ) : (
        isEnableOnlineOfflineStatus && (
          <View
            style={[
              styles.topRightIconContainer,
              {
                right: 5,
                top: 10,
                height: 13,
                width: 13,
                borderRadius: 13 / 2,
                backgroundColor: isOnline ? COLORS.lightGreen : 'red',
                ...topRightIconContainerStyle,
              },
            ]}
          />
        )
      )}
    </TouchableOpacity>
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
  topRightIconContainer: {
    position: 'absolute',
    right: -6,
    top: 0,
    height: 32,
    width: 32,
    // backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32 / 2,
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
