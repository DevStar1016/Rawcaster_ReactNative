import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {IconType} from '../Utilities/Icons';
import SVGIcon, {SVGIconProps} from './SVGIcon';
import {FONTS} from '../Utilities/Fonts';

export type SubmitButtonProps = {
  buttonText: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  buttonTextStyle?: TextStyle;
  buttonWidth?: string | number;
  onPress?: () => void;
  icon?: IconType;
  borderWidth?: number;
  marginTop?: number;
  disabledColor?: string;
  loaderColor?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  rightIcon?: IconType;
  rightIconSize?: number;
  iconSize?: number;
  padding?: number;
  onLayoutHeight?: (val: number) => void;
  textPaddingVertical?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  marginHorizontal?: number;
  marginRight?: number;
  marginBottom?: number;
  textMarginLeftWhenIcon?: number;
  textMarginRightWhenIcon?: number;
  borderRadius?: number;
  rightIconProps?: SVGIconProps;
};

const SubmitButton = ({
  buttonText,
  onPress,
  bgColor = COLORS.secondary,
  borderColor = COLORS.secondary,
  textColor = COLORS.white,
  buttonTextStyle = {},
  icon,
  borderWidth = 2,
  iconSize = 25,
  isDisabled = false,
  rightIcon,
  rightIconSize = 15,
  loaderColor = COLORS.white,
  disabledColor = COLORS.dimColor,
  isLoading = false,
  marginTop = 20,
  marginBottom,
  buttonWidth,
  textMarginLeftWhenIcon = 10,
  textMarginRightWhenIcon = 10,
  padding = 10,
  paddingVertical,
  textPaddingVertical = 2,
  paddingHorizontal,
  marginHorizontal,
  marginRight,
  onLayoutHeight,
  borderRadius = 6,
  rightIconProps,
}: SubmitButtonProps) => {
  return (
    <TouchableOpacity
      onLayout={e => {
        if (onLayoutHeight) {
          onLayoutHeight(
            e.nativeEvent.layout.height +
              (marginTop ?? 0) +
              (marginBottom ?? 0),
          );
        }
      }}
      style={[
        styles.mainContainer,
        {
          borderWidth,
          width: buttonWidth,
          backgroundColor:
            isDisabled && disabledColor ? disabledColor : bgColor,
          borderColor:
            isDisabled && disabledColor ? disabledColor : borderColor,
          flexDirection: 'row',
          marginTop,
          padding,
          paddingVertical,
          paddingHorizontal,
          marginHorizontal,
          marginBottom,
          borderRadius,
          marginRight,
        },
      ]}
      disabled={isLoading || isDisabled}
      activeOpacity={0.7}
      onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={loaderColor}
          style={{marginHorizontal: 10}}
        />
      ) : (
        <>
          {icon ? (
            <SVGIcon icon={icon} height={iconSize} width={iconSize} />
          ) : null}
          <StyledText
            style={{
              ...styles.buttonText,
              marginLeft: icon ? textMarginLeftWhenIcon : 0,
              marginRight: rightIcon ? textMarginRightWhenIcon : 0,
              color: textColor,
              paddingVertical: textPaddingVertical,
              ...buttonTextStyle,
            }}>
            {buttonText}
          </StyledText>
          {rightIcon ? (
            <SVGIcon
              icon={rightIcon}
              height={rightIconSize}
              width={rightIconSize}
              {...rightIconProps}
            />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  buttonText: {
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
    fontSize: 16,
  },
});
