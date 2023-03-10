import {Image, StyleSheet, Text, View, ViewStyle} from 'react-native';
import React from 'react';
import SVGIcon from './SVGIcon';
import {BadgesType} from '../Utilities/Badges';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../Utilities/Colors';

type Props = {
  profileSize?: number;
  profileImage: any;
  borderRadius?: number;
  badge?: BadgesType;
  isEnableGradient?: boolean;
  containerStyle?: ViewStyle;
  badgeSize?: number;
  padding?: number;
  badgeContainerStyle?: ViewStyle;
};

const ProfileWithBadge = ({
  profileSize = 60,
  borderRadius = profileSize / 2,
  profileImage,
  badge,
  containerStyle = {},
  badgeContainerStyle = {},
  badgeSize = 25,
  isEnableGradient = true,
  padding = 2,
}: Props) => {
  return (
    <View
      style={[
        styles.mainConatiner,
        {height: profileSize + 10, width: profileSize + 10, ...containerStyle},
      ]}>
      {isEnableGradient ? (
        <LinearGradient
          colors={COLORS.gradientColorsSecondary}
          start={{x: 1, y: 1}}
          end={{x: 0, y: 0}}
          style={[
            styles.profileImageContainer,
            {height: profileSize, width: profileSize, borderRadius, padding},
          ]}>
          <Image source={{uri: profileImage}} style={styles.profileImage} />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.profileImageContainer,
            {height: profileSize, width: profileSize, borderRadius, padding},
          ]}>
          <Image
            source={{uri: profileImage}}
            style={[styles.profileImage, {borderRadius}]}
          />
        </View>
      )}
      {badge && (
        <View style={[styles.badgeContainer, {...badgeContainerStyle}]}>
          <SVGIcon icon={badge} height={badgeSize} width={badgeSize} />
        </View>
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
  profileImage: {
    height: '100%',
    width: '100%',
    borderRadius: 60 / 2,
  },
});
