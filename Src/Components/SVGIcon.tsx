import React from 'react';
import {ICONS, IconType} from '../Utilities/Icons';

interface SVGIconProps {
  height?: number | string;
  width?: number | string;
  icon?: IconType;
}

const SVGIcon = ({
  height = 25,
  width = 25,
  icon = 'visibility_on',
}: SVGIconProps) => {
  const Icon = ICONS[icon];
  return <Icon height={height} width={width} />;
};

export default SVGIcon;
