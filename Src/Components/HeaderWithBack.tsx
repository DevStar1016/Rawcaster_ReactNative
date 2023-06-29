import {
  StatusBar,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../Utilities/Colors';
import SVGIcon, {SVGIconProps} from './SVGIcon';
import StyledText, {StyledTextProps} from './StyledText';
import {FONTS} from '../Utilities/Fonts';
import {IconType} from '../Utilities/Icons';
import {useInsets} from '../Utilities/StoreData';
import ProfileWithBadge, {ProfileWithBadgeProps} from './ProfileWithBadge';

export type BackHeaderProps = {
  title?: string;
  subTitle?: string;
  backIcon?: IconType;
  isModal?: boolean;
  setModal?: (value: boolean) => void;
  isTitleCenter?: boolean;
  isEnableRightIcon?: boolean;
  rightIcon?: IconType;
  videoCallIcon?: IconType;
  isTitleButton?: boolean;
  rightButtonType?: 'icon' | 'text';
  rightButtonText?: string;
  isEnableshareIcon?: boolean;
  isEnableSafeArea?: boolean;
  onPressRightIcon?: () => void;
  onPressVideoCallButton?: () => void;
  onPressAudioCallButton?: () => void;
  onPressShareButton?: () => void;
  onPressHeaderTitle?: () => void;
  onPressCopyButton?: () => void;
  onPressDeleteButton?: () => void;
  onPressEditButton?: () => void;
  isEnableDeleteIcon?: boolean;
  isEnableEditIcon?: boolean;
  isEnableVideoCallIcon?: boolean;
  isEnableAudioCallIcon?: boolean;
  isEnableCopyIcon?: boolean;
  rightIconSize?: number;
  videoCallIconProps?: Omit<SVGIconProps, 'onPress' | 'icon' | 'isButton'>;
  rightTextButtonStyle?: ViewStyle;
  rightButtonTextStyle?: TextStyle;
  isEnableBackButton?: boolean;
  bgColor?: string;
  profileContainer?: ViewStyle;
  titlePaddingHorizontal?: number;
  isEnableProfileImage?: boolean;
  rightIconAdditionalProps?: SVGIconProps;
  profileImageProps?: ProfileWithBadgeProps;
  subTitleTextProps?: StyledTextProps;
  titleTextProps?: StyledTextProps;
};

const HeaderWithBack = ({
  title = '',
  subTitle = '',
  backIcon = 'back',
  isModal = false,
  setModal,
  isEnableSafeArea = false,
  isTitleCenter = false,
  isEnableRightIcon = false,
  rightIcon,
  onPressRightIcon,
  onPressCopyButton,
  onPressDeleteButton,
  onPressShareButton,
  onPressHeaderTitle,
  isTitleButton = false,
  isEnableBackButton = true,
  rightIconSize = 15,
  rightButtonType = 'icon',
  videoCallIcon = 'video_call_white',
  videoCallIconProps,
  rightButtonText = '',
  isEnableVideoCallIcon = false,
  isEnableCopyIcon = false,
  onPressVideoCallButton,
  isEnableAudioCallIcon = false,
  isEnableEditIcon = false,
  onPressEditButton,
  isEnableshareIcon = false,
  onPressAudioCallButton,
  bgColor = COLORS.primary,
  rightTextButtonStyle,
  rightButtonTextStyle,
  profileImageProps,
  profileContainer,
  titlePaddingHorizontal = 15,
  rightIconAdditionalProps,
  isEnableProfileImage = false,
  isEnableDeleteIcon = false,
  subTitleTextProps,
  titleTextProps,
}: BackHeaderProps) => {
  const navigation = useNavigation();
  const insets = useInsets();

  function TitleTextContainer({children}: any) {
    return isTitleButton ? (
      <TouchableOpacity activeOpacity={0.8} onPress={onPressHeaderTitle}>
        {children}
      </TouchableOpacity>
    ) : (
      <View>{children}</View>
    );
  }

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
      <View style={[{flexDirection: 'row'}, !isTitleCenter && {flex: 1}]}>
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
            <ProfileWithBadge
              isButton={isTitleButton}
              onPressProfile={onPressHeaderTitle}
              profileSize={40}
              {...profileImageProps}
            />
          </View>
        )}
        {!isTitleCenter && (
          <View
            style={[
              styles.titleContainer,
              {
                flex: 1,
                alignItems: 'flex-start',
                paddingHorizontal: titlePaddingHorizontal,
              },
            ]}>
            <TitleTextContainer>
              <StyledText style={styles.title} {...titleTextProps}>
                {title}
              </StyledText>
              {subTitle ? (
                <StyledText style={styles.subTitle} {...subTitleTextProps}>
                  {subTitle}
                </StyledText>
              ) : (
                false
              )}
            </TitleTextContainer>
          </View>
        )}
      </View>
      {isTitleCenter && (
        <View
          style={[
            styles.titleContainer,
            {
              alignItems: 'center',
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
          {isEnableEditIcon && (
            <SVGIcon
              icon={'edit'}
              isButton
              height={19}
              width={19}
              marginBottom={2}
              marginLeft={20}
              onPress={onPressEditButton}
            />
          )}

          {isEnableDeleteIcon && (
            <SVGIcon
              icon={'delete_white'}
              isButton
              height={23}
              width={23}
              marginLeft={20}
              onPress={onPressDeleteButton}
            />
          )}

          {isEnableCopyIcon && (
            <SVGIcon
              icon={'clipboard_copy_white'}
              isButton
              height={20}
              width={20}
              marginBottom={1}
              marginLeft={20}
              onPress={onPressCopyButton}
            />
          )}

          {isEnableshareIcon && (
            <SVGIcon
              icon={'share'}
              isButton
              height={22}
              width={22}
              marginBottom={1}
              marginLeft={20}
              onPress={onPressShareButton}
            />
          )}

          {isEnableAudioCallIcon && (
            <SVGIcon
              icon={'audio_call_white'}
              isButton
              height={21}
              width={21}
              marginBottom={2}
              marginLeft={20}
              onPress={onPressAudioCallButton}
            />
          )}

          {isEnableVideoCallIcon && (
            <SVGIcon
              marginLeft={20}
              {...videoCallIconProps}
              icon={videoCallIcon ?? 'video_call_white'}
              isButton
              onPress={onPressVideoCallButton}
            />
          )}
          {isEnableRightIcon && (
            <SVGIcon
              icon={rightIcon}
              height={rightIconSize}
              width={rightIconSize}
              isButton
              marginLeft={20}
              onPress={onPressRightIcon}
              {...rightIconAdditionalProps}
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
    justifyContent: 'center',
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  subTitle: {
    color: COLORS.white,
    fontSize: 12,
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
