import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';

type ButtonProps = {
  buttonText: string;
  bgColor?: string;
  textColor?: string;
  onPress?: () => void;
};

const SubmitButton = ({
  buttonText,
  onPress,
  bgColor = COLORS.secondary,
  textColor = COLORS.white,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.mainContainer, {backgroundColor: bgColor}]}
      activeOpacity={0.7}
      onPress={onPress}>
      <StyledText style={{...styles.buttonText, color: textColor}}>
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
