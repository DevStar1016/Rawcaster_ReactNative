import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {IconType} from '../Utilities/Icons';
import SVGIcon, {SVGIconProps} from './SVGIcon';
import {FONTS} from '../Utilities/Fonts';

type Option = {
  id: number | string;
  optionName: string;
  optionLeftIcon?: IconType;
  iconProps?: SVGIconProps;
};

type Props = {
  optionsList: Option[];
  isEnableOptionIcon?: boolean;
  onPressMenuItem?: (val: Option) => void;
};

const MenuList = ({
  optionsList = [],
  isEnableOptionIcon = false,
  onPressMenuItem,
}: Props) => {
  return (
    <View style={styles.mainContainer}>
      {optionsList.map(item => {
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              if (onPressMenuItem) {
                onPressMenuItem(item);
              }
            }}>
            {isEnableOptionIcon && item.optionLeftIcon && (
              <SVGIcon
                icon={item.optionLeftIcon}
                marginRight={10}
                {...item?.iconProps}
              />
            )}
            <StyledText style={styles.text}>{item.optionName}</StyledText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MenuList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
  },
});
