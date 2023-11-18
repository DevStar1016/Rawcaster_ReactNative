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
  radioContainerStyle?: ViewStyle;
  nameTextStyle?: TextStyle;
  disabled?: boolean;
  radioSelectedColor?: string;
  isDisabledInsideCircleOuterSpace?: boolean;
};

const RadioButton = ({
  isSelected,
  onPress,
  text = '',
  disabled = false,
  isDisabledInsideCircleOuterSpace = false,
  mainContainerStyle,
  radioSelectedColor = COLORS.radioSelectedColor,
  radioContainerStyle,
  nameTextStyle,
}: Props) => {
  return (
    <TouchableOpacity
      style={[styles.mainContainer, mainContainerStyle]}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}>
      <View style={[styles.radioContainer, radioContainerStyle]}>
        {isSelected ? (
          <View
            style={[
              styles.radioInsideContainer,
              {
                backgroundColor: isSelected ? radioSelectedColor : COLORS.white,
              },
              isDisabledInsideCircleOuterSpace && {
                width: '100%',
                height: '100%',
                borderRadius: 16 / 2,
              },
            ]}></View>
        ) : null}
      </View>
      <View>
        <StyledText
          style={[
            nameTextStyle,
            {
              color: disabled ? COLORS.grey : COLORS.black,
            },
          ]}>
          {text}
        </StyledText>
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
