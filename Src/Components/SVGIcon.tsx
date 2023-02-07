import React from 'react';
import {COLORS} from '../Utilities/Colors';
import {ICONS, IconType} from '../Utilities/Icons';

interface SVGIconProps {
  height?: number | string;
  width?: number | string;
  icon?: IconType;
  color?: string;
}

const SVGIcon = ({
  height = 25,
  width = 25,
  icon = 'visibility_on',
  color = COLORS.white,
}: SVGIconProps) => {
  const Icon = ICONS[icon];
  return <Icon height={height} width={width} fill={color} />;
};

export default SVGIcon;
