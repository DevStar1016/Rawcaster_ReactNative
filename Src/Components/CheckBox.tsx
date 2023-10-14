import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import SVGIcon from './SVGIcon';

type Props = {
  text?: string;
  textStyle?: TextStyle;
  mainContainerStyle?: ViewStyle;
  onPress?: () => void;
  isSelected?: boolean;
  isVisibleText?: boolean;
};

const CheckBox = ({
  isSelected = false,
  text = '',
  textStyle,
  mainContainerStyle,
  onPress,
  isVisibleText = true,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.mainContainer, mainContainerStyle]}
      activeOpacity={0.8}
      onPress={onPress}>
      <View
        style={[
          styles.checkBox,
          {
            backgroundColor: isSelected
              ? COLORS.radioSelectedColor
              : COLORS.white,
          },
        ]}>
        {isSelected && <SVGIcon icon="tick" height={13} width={13} />}
      </View>
      {isVisibleText && (
        <View style={{paddingLeft: 10}}>
          <StyledText style={textStyle}>{text}</StyledText>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CheckBox;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    height: 18,
    width: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: COLORS.black,
    backgroundColor: COLORS.radioSelectedColor,
  },
});
