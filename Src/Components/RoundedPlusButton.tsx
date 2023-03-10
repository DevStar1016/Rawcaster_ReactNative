import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import SVGIcon from './SVGIcon';
import {COLORS} from '../Utilities/Colors';
import {IconType} from '../Utilities/Icons';

type Props = {
  onPress: () => void;
  style?: ViewStyle;
  icon?: IconType;
  iconSize?: number;
};

const RoundedPlusButton = ({
  onPress,
  style = {},
  icon = 'plus',
  iconSize = 28,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.nuggetPostButton, {...style}]}
      activeOpacity={0.7}
      onPress={onPress}>
      <SVGIcon icon={icon} height={iconSize} width={iconSize} />
    </TouchableOpacity>
  );
};

export default RoundedPlusButton;

const styles = StyleSheet.create({
  nuggetPostButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
