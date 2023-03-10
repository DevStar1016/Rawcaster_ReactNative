import {StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import StyledText from './StyledText';
import {useNavigation} from '@react-navigation/native';
import {FONTS} from '../Utilities/Fonts';
import {IconType} from '../Utilities/Icons';

export type BackHeaderProps = {
  title?: string;
  backIcon?: IconType;
  isModal?: boolean;
  setModal?: (value: boolean) => void;
  isTitleCenter?: boolean;
  isEnableRightIcon?: boolean;
  rightIcon?: IconType;
  onPressRightIcon?: () => void;
  rightIconSize?: number;
  isEnableBackButton?: boolean;
  bgColor?: string;
};

const HeaderWithBack = ({
  title = '',
  backIcon = 'back',
  isModal = false,
  setModal,
  isTitleCenter = false,
  isEnableRightIcon = false,
  rightIcon,
  onPressRightIcon,
  isEnableBackButton = true,
  rightIconSize = 15,
  bgColor = COLORS.primary,
}: BackHeaderProps) => {
  const navigation = useNavigation();
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
          justifyContent: isTitleCenter ? 'space-between' : 'flex-start',
          backgroundColor: bgColor,
        },
      ]}>
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
      <View
        style={[
          styles.titleContainer,
          {
            alignItems: isTitleCenter ? 'center' : 'flex-start',
            paddingHorizontal: isTitleCenter ? 0 : 15,
          },
        ]}>
        <StyledText style={styles.title}>{title}</StyledText>
      </View>
      <View style={[styles.iconContainer, {alignItems: 'flex-end'}]}>
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
    width: '10%',
    justifyContent: 'center',
    alignItems: 'flex-start',
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
});
