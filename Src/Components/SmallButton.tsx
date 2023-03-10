import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';

type Props = {
  buttonText?: string;
  buttonTextStyle?: TextStyle;
  containerStyle?: ViewStyle;
  isEnableIcon?: boolean;
  onPress?: () => void;
};

const SmallButton = ({
  buttonText = '',
  buttonTextStyle = {},
  containerStyle = {},
  isEnableIcon = false,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.mainContainer, {...containerStyle}]}
      activeOpacity={0.7}
      onPress={onPress}>
      <StyledText style={{paddingVertical: 5, ...buttonTextStyle}}>
        {buttonText}
      </StyledText>
      {isEnableIcon && (
        <SVGIcon icon="right_arrow" height={15} width={13} marginLeft={5} />
      )}
    </TouchableOpacity>
  );
};

export default SmallButton;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.borderColor,
    borderRadius: 25,
    flexDirection: 'row',
  },
});
