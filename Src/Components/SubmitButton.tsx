import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {IconType} from '../Utilities/Icons';
import SVGIcon from './SVGIcon';

type ButtonProps = {
  buttonText: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  buttonTextStyle?: TextStyle;
  onPress?: () => void;
  icon?: IconType;
};

const SubmitButton = ({
  buttonText,
  onPress,
  bgColor = COLORS.secondary,
  borderColor = COLORS.secondary,
  textColor = COLORS.white,
  buttonTextStyle = {},
  icon,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        {backgroundColor: bgColor, borderColor, flexDirection: 'row'},
      ]}
      activeOpacity={0.7}
      onPress={onPress}>
      {icon ? <SVGIcon icon={icon} /> : null}
      <StyledText
        style={{
          ...styles.buttonText,
          marginLeft: icon ? 15 : 0,
          color: textColor,
          ...buttonTextStyle,
        }}>
        {buttonText}
      </StyledText>
    </TouchableOpacity>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginTop: 20,
  },
  buttonText: {
    fontWeight: '500',
    color: COLORS.white,
    fontSize: 19,
  },
});
