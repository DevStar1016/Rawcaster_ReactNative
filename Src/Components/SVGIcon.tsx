import {TouchableOpacity, TouchableWithoutFeedback} from 'react-native';
import React from 'react';
import {ICONS, IconType} from '../Utilities/Icons';

export interface SVGIconProps {
  height?: number | string;
  width?: number | string;
  icon?: IconType;
  marginLeft?: number;
  isButton?: boolean;
  marginRight?: number;
  marginBottom?: number;
  opacity?: number;
  onPress?: () => void;
}

function SVGIcon({
  height = 25,
  width = 25,
  icon = 'visibility_on',
  marginLeft = 0,
  marginRight = 0,
  marginBottom,
  isButton = false,
  opacity = 1,
  onPress,
}: SVGIconProps) {
  const Icon = ICONS[icon];
  return isButton ? (
    <TouchableOpacity
      style={{
        marginLeft,
        marginRight,
        marginBottom,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacity,
      }}
      activeOpacity={0.7}
      onPress={onPress}>
      <Icon height={height} width={width} />
    </TouchableOpacity>
  ) : (
    <Icon
      height={height}
      width={width}
      style={{marginLeft, marginRight, marginBottom, opacity}}
    />
  );
}

export default SVGIcon;
