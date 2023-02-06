import {StyleSheet, Text, TextStyle, TouchableOpacity} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';

type Props = {
  style: TextStyle;
  isButton?: boolean;
  onPress?: () => {};
  children: JSX.Element;
  paddingVertical: number;
};

const StyledText = ({
  children,
  style = {},
  isButton = false,
  paddingVertical = isButton ? 10 : 5,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={{paddingVertical: paddingVertical}}
      disabled={!isButton}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={[styles.text, {...style}]}>{children}</Text>
    </TouchableOpacity>
  );
};

export default StyledText;

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '400',
  },
});
