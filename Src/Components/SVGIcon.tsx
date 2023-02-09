import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import {ICONS, IconType} from '../Utilities/Icons';

interface SVGIconProps {
  height?: number | string;
  width?: number | string;
  icon?: IconType;
  color?: string;
  marginLeft?: number;
  isButton?: boolean;
  onPress?: () => void;
}

const SVGIcon = ({
  height = 25,
  width = 25,
  icon = 'visibility_on',
  color = COLORS.white,
  marginLeft = 0,
  isButton = false,
  onPress,
}: SVGIconProps) => {
  const Icon = ICONS[icon];
  return (
    <TouchableOpacity
      style={{marginLeft}}
      disabled={!isButton}
      activeOpacity={0.7}
      onPress={onPress}>
      <Icon height={height} width={width} fill={color} />
    </TouchableOpacity>
  );
};

export default SVGIcon;
