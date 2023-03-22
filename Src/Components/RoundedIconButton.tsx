import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import {IconType} from '../Utilities/Icons';

type Props = {
  icon: IconType;
  buttonStyle?: ViewStyle;
  iconSize?: number;
  buttonSize?: number;
  bgColor?: string;
  onPress?: () => void;
};

const RoundedIconButton = ({
  icon,
  iconSize = 18,
  buttonSize = 35,
  bgColor = COLORS.lightGrey,
  buttonStyle = {},
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.mainContainer,
        {
          height: buttonSize,
          width: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: bgColor,
          ...buttonStyle,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}>
      <SVGIcon icon={icon} height={iconSize} width={iconSize} />
    </TouchableOpacity>
  );
};

export default RoundedIconButton;

const styles = StyleSheet.create({
  mainContainer: {
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGrey,
  },
});
