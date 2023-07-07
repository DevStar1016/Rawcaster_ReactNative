import {StatusBar, View} from 'react-native';
import React from 'react';
import {IS_IOS} from '../Utilities/Constants';
import {useInsets} from '../Utilities/StoreData';
import {COLORS} from '../Utilities/Colors';

const ReplaceStatusBar = ({bgColor = COLORS.primary}) => {
  const insets = useInsets();
  return (
    <View
      style={{
        backgroundColor: bgColor,
        height: IS_IOS
          ? insets.top
            ? insets.top
            : 20
          : StatusBar.currentHeight,
      }}
    />
  );
};

export default ReplaceStatusBar;
