import {TouchableOpacity} from 'react-native';
import React from 'react';
import {ICONS, IconType} from '../Utilities/Icons';

export interface SVGIconProps {
  height?: number | string;
  width?: number | string;
  icon?: IconType;
  marginLeft?: number;
  isButton?: boolean;
  marginRight?: number;
  onPress?: () => void;
}

const SVGIcon = ({
  height = 25,
  width = 25,
  icon = 'visibility_on',
  marginLeft = 0,
  marginRight = 0,
  isButton = false,
  onPress,
}: SVGIconProps) => {
  const Icon = ICONS[icon];
  return isButton ? (
    <TouchableOpacity
      style={{
        marginLeft,
        marginRight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      activeOpacity={0.7}
      onPress={onPress}>
      <Icon height={height} width={width} />
    </TouchableOpacity>
  ) : (
    <Icon height={height} width={width} style={{marginLeft, marginRight}} />
  );
};

export default SVGIcon;
