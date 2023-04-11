import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import RoundedIconButton, {
  RoundedIconButtonProps,
} from '../../../Components/RoundedIconButton';
import {IconType} from '../../../Utilities/Icons';

type Props = {
  title: string;
  buttonType: 'rounded' | 'text';
  isDisplayButton?: boolean;
  onPressButton?: () => void;
  buttonText?: string;
  buttonTextStyle?: TextStyle;
  roundedButtonIcon?: IconType;
  roundedButtonIconProps?: Omit<RoundedIconButtonProps, 'onPress'>;
};

const TitleRowContainer = ({
  title,
  buttonType = 'text',
  isDisplayButton = true,
  onPressButton,
  buttonTextStyle,
  buttonText = 'See All',
  roundedButtonIconProps,
}: Props) => {
  return (
    <View style={styles.rowContainer}>
      <View style={{flex: 1, paddingVertical: 5}}>
        <StyledText style={styles.titleText}>{title}</StyledText>
      </View>
      {isDisplayButton && (
        <>
          {buttonType === 'text' && (
            <TouchableOpacity activeOpacity={0.8} onPress={onPressButton}>
              <StyledText style={[styles.seeAllButtonText, buttonTextStyle]}>
                {buttonText}
              </StyledText>
            </TouchableOpacity>
          )}
          {buttonType === 'rounded' && (
            <RoundedIconButton
              buttonSize={30}
              iconSize={16}
              icon={'edit_black'}
              {...roundedButtonIconProps}
              onPress={onPressButton}
            />
          )}
        </>
      )}
    </View>
  );
};

export default TitleRowContainer;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  seeAllButtonText: {
    color: COLORS.lightBlack,
    fontFamily: FONTS.DMSans.medium,
  },
});
