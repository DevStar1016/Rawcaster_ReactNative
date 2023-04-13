import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import SVGIcon from './SVGIcon';

type Props = {
  text?: string;
  textStyle?: TextStyle;
  onPress?: () => void;
  isSelected?: boolean;
};

const CheckBox = ({
  isSelected = false,
  text = 'Test',
  textStyle,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={styles.mainContainer}
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
      <View style={{flex: 1, paddingLeft: 10}}>
        <StyledText style={textStyle}>{text}</StyledText>
      </View>
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
