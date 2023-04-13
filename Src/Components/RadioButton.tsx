import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';

type Props = {
  isSelected?: boolean;
  onPress?: () => void;
  text?: string;
  mainContainerStyle?: ViewStyle;
  nameTextStyle?: TextStyle;
};

const RadioButton = ({
  isSelected,
  onPress,
  text = '',
  mainContainerStyle,
  nameTextStyle,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.mainContainer, mainContainerStyle]}
      activeOpacity={0.8}
      onPress={onPress}>
      <View style={styles.radioContainer}>
        {isSelected ? (
          <View
            style={[
              styles.radioInsideContainer,
              {
                backgroundColor: isSelected
                  ? COLORS.radioSelectedColor
                  : COLORS.white,
              },
            ]}></View>
        ) : null}
      </View>
      <View style={{flex: 1}}>
        <StyledText style={nameTextStyle}>{text}</StyledText>
      </View>
    </TouchableOpacity>
  );
};

export default RadioButton;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  radioContainer: {
    width: 16,
    height: 16,
    borderRadius: 16 / 2,
    borderWidth: 1,
    marginRight: 10,
    borderColor: COLORS.radioBorderColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInsideContainer: {
    width: 8,
    height: 8,
    borderRadius: 8 / 2,
  },
});
