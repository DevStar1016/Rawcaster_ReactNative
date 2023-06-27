import {
  StatusBar,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import StyledText from './StyledText';
import {useNavigation} from '@react-navigation/native';
import {FONTS} from '../Utilities/Fonts';
import {IconType} from '../Utilities/Icons';
import {useInsets} from '../Utilities/StoreData';
import ProfileWithBadge, {ProfileWithBadgeProps} from './ProfileWithBadge';

export type BackHeaderProps = {
  title?: string;
  backIcon?: IconType;
  isModal?: boolean;
  setModal?: (value: boolean) => void;
  isTitleCenter?: boolean;
  isEnableRightIcon?: boolean;
  rightIcon?: IconType;
  rightButtonType?: 'icon' | 'text';
  rightButtonText?: string;
  isEnableSafeArea?: boolean;
  onPressRightIcon?: () => void;
  onPressVideoCallButton?: () => void;
  onPressAudioCallButton?: () => void;
  isEnableVideoCallIcon?: boolean;
  isEnableAudioCallIcon?: boolean;
  rightIconSize?: number;
  rightTextButtonStyle?: ViewStyle;
  rightButtonTextStyle?: TextStyle;
  isEnableBackButton?: boolean;
  bgColor?: string;
  profileContainer?: ViewStyle;
  titlePaddingHorizontal?: number;
  isEnableProfileImage?: boolean;
  profileImageProps?: ProfileWithBadgeProps;
};

const HeaderWithBack = ({
  title = '',
  backIcon = 'back',
  isModal = false,
  setModal,
  isEnableSafeArea = false,
  isTitleCenter = false,
  isEnableRightIcon = false,
  rightIcon,
  onPressRightIcon,
  isEnableBackButton = true,
  rightIconSize = 15,
  rightButtonType = 'icon',
  rightButtonText = '',
  isEnableVideoCallIcon = false,
  onPressVideoCallButton,
  isEnableAudioCallIcon = false,
  onPressAudioCallButton,
  bgColor = COLORS.primary,
  rightTextButtonStyle,
  rightButtonTextStyle,
  profileImageProps,
  profileContainer,
  titlePaddingHorizontal = 15,
  isEnableProfileImage = false,
}: BackHeaderProps) => {
  const navigation = useNavigation();
  const insets = useInsets();
  return (
    //   <View
    //   style={{
    //     paddingTop: insets.top ? insets.top : StatusBar.currentHeight,
    //     backgroundColor: COLORS.black,
    //   }}>
    //   <HeaderWithBack title="Media Preview" isModal setModal={setModal} />
    // </View>
    <View
      style={[
        styles.mainContainer,
        {
          justifyContent: 'space-between',
          backgroundColor: bgColor,
          paddingTop: isEnableSafeArea
            ? insets.top
              ? insets.top + 12
              : StatusBar.currentHeight
              ? StatusBar.currentHeight + 12
              : 12
            : 12,
        },
      ]}>
      <View style={{flexDirection: 'row'}}>
        <View
          style={[
            styles.iconContainer,
            {width: isTitleCenter ? '10%' : undefined},
          ]}>
          {isEnableBackButton && (
            <SVGIcon
              icon={backIcon}
              height={17}
              width={17}
              isButton
              onPress={() => {
                if (isModal && setModal) {
                  setModal(false);
                } else {
                  navigation.goBack();
                }
              }}
            />
          )}
        </View>
        {isEnableProfileImage && (
          <View style={profileContainer}>
            <ProfileWithBadge profileSize={40} {...profileImageProps} />
          </View>
        )}
        {!isTitleCenter && (
          <View
            style={[
              styles.titleContainer,
              {
                alignItems: 'flex-start',
                paddingHorizontal: titlePaddingHorizontal,
              },
            ]}>
            <StyledText style={styles.title}>{title}</StyledText>
          </View>
        )}
      </View>
      {isTitleCenter && (
        <View
          style={[
            styles.titleContainer,
            {
              alignItems: 'center',
              paddingHorizontal: 0,
            },
          ]}>
          <StyledText style={styles.title}>{title}</StyledText>
        </View>
      )}
      {rightButtonType === 'icon' ? (
        <View
          style={[
            styles.iconContainer,
            {alignItems: 'flex-end'},
            isTitleCenter && {width: '10%'},
          ]}>
          {isEnableAudioCallIcon && (
            <SVGIcon
              icon={'audio_call_fill_white'}
              isButton
              height={20}
              width={20}
              marginBottom={2}
              marginRight={isEnableRightIcon || isEnableVideoCallIcon ? 20 : 0}
              onPress={onPressAudioCallButton}
            />
          )}
          {isEnableVideoCallIcon && (
            <SVGIcon
              icon={'video_call_fill_white'}
              isButton
              marginRight={isEnableRightIcon ? 10 : 0}
              onPress={onPressVideoCallButton}
            />
          )}
          {isEnableRightIcon && (
            <SVGIcon
              icon={rightIcon}
              height={rightIconSize}
              width={rightIconSize}
              isButton
              onPress={onPressRightIcon}
            />
          )}
        </View>
      ) : isEnableRightIcon && rightButtonType === 'text' ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.rightTextButton, rightTextButtonStyle]}
          onPress={onPressRightIcon}>
          <StyledText style={[styles.rightButtonText, rightButtonTextStyle]}>
            {rightButtonText}
          </StyledText>
        </TouchableOpacity>
      ) : (
        <View style={[styles.iconContainer, {height: 25}]} />
      )}
    </View>
  );
};

export default HeaderWithBack;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  titleContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  rightTextButton: {
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  rightButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 13,
  },
});
