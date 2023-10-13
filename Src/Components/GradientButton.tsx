import {StyleSheet, TextStyle, TouchableOpacity} from 'react-native';
import React from 'react';
import {IconType} from '../Utilities/Icons';
import SVGIcon from './SVGIcon';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {FONTS} from '../Utilities/Fonts';

type ButtonProps = {
  buttonText?: string;
  onPress?: () => void;
  leftIcon?: IconType;
  marginTop?: number | undefined;
  marginBottom?: number | undefined;
  marginVertical?: number | undefined;
  rightIcon?: IconType;
  leftIconSize?: number;
  rightIconSize?: number;
  marginHorizontal?: number;
  containerPadding?: number;
  buttonTextStyle?: TextStyle;
  disabled?: boolean;
};

const GradientButton = ({
  buttonText = '',
  onPress,
  leftIcon,
  leftIconSize = 20,
  rightIconSize = 14,
  marginVertical,
  marginBottom,
  marginHorizontal,
  marginTop,
  disabled = false,
  rightIcon,
  buttonTextStyle = {},
  containerPadding = 10,
}: ButtonProps) => {
  return (
    <LinearGradient
      colors={COLORS.gradientColorsPrimary}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 1}}
      style={[
        styles.mainContainer,
        {marginTop, marginBottom, marginVertical, marginHorizontal},
      ]}>
      <TouchableOpacity
        style={[styles.button, {padding: containerPadding}]}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
        onPress={onPress}>
        {leftIcon ? (
          <SVGIcon icon={leftIcon} height={leftIconSize} width={leftIconSize} />
        ) : null}
        <StyledText
          style={{
            ...styles.buttonText,
            marginRight: rightIcon ? 5 : 0,
            marginLeft: leftIcon ? 5 : 0,
            paddingVertical: 5,
            ...buttonTextStyle,
          }}>
          {buttonText}
        </StyledText>
        {rightIcon ? (
          <SVGIcon
            icon={rightIcon}
            width={rightIconSize}
            height={rightIconSize}
          />
        ) : null}
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default GradientButton;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: FONTS.DMSans.medium,
    color: COLORS.white,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 10,
  },
});
