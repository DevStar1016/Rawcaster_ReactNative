import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {IconType} from '../Utilities/Icons';
import SVGIcon from './SVGIcon';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';

type ButtonProps = {
  buttonText?: string;
  onPress?: () => void;
  icon?: IconType;
  textColor?: string;
};

const LinearGradientButton = ({
  buttonText = '',
  onPress,
  icon,
  textColor = COLORS.white,
}: ButtonProps) => {
  return (
    <LinearGradient
      colors={['#D86886', '#844670']}
      style={styles.mainContainer}>
      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.7}
        onPress={onPress}>
        <StyledText
          style={{
            ...styles.buttonText,
            marginLeft: icon ? 15 : 0,
            color: textColor,
          }}>
          {buttonText}
        </StyledText>
        {icon ? <SVGIcon icon={icon} /> : null}
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default LinearGradientButton;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 15,
    margin: 15,
  },
  buttonText: {
    fontWeight: '500',
    color: COLORS.white,
    fontSize: 19,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 10,
  },
});
