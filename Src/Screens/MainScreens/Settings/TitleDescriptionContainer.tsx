import React from 'react';
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native';
import CheckBox from '../../../Components/CheckBox';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';

export type TitleDescriptionContainerProps = {
  title?: string;
  description?: string;
  isEnableTitleCheckButton?: boolean;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  containerStyle?: ViewStyle;
  isChecked?: boolean;
  onPressTitleCheck?: () => void;
};

function TitleDescriptionContainer({
  title = '',
  isEnableTitleCheckButton = false,
  description = '',
  isChecked,
  onPressTitleCheck,
  titleStyle,
  descriptionStyle,
  containerStyle,
}: TitleDescriptionContainerProps) {
  return (
    <View style={[styles.TitleDescriptionContainerContainer, containerStyle]}>
      {isEnableTitleCheckButton ? (
        <CheckBox
          isSelected={isChecked}
          text={title}
          textStyle={{...styles.titleText, ...titleStyle}}
          onPress={onPressTitleCheck}
        />
      ) : (
        <StyledText style={[styles.titleText, titleStyle]}>{title}</StyledText>
      )}

      <StyledText style={[styles.description, descriptionStyle]}>
        {description}
      </StyledText>
    </View>
  );
}

export default TitleDescriptionContainer;

const styles = StyleSheet.create({
  TitleDescriptionContainerContainer: {
    paddingVertical: 10,
  },
  titleText: {fontFamily: FONTS.DMSans.bold, fontSize: 16},
  description: {marginTop: 5, lineHeight: 20},
});
