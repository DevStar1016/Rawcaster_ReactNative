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
import SVGIcon from '../../../Components/SVGIcon';

type Props = {
  title: string;
  buttonType: 'rounded' | 'text';
  isDisplayButton?: boolean;
  onPressButton?: () => void;
  isDisplayChat?: boolean;
  onPressChat?: () => void;
  isDisplayEvent?: boolean;
  onPressEvent?: () => void;
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
  isDisplayChat = false,
  onPressChat,
  isDisplayEvent = false,
  onPressEvent,
  buttonTextStyle,
  buttonText = 'See All',
  roundedButtonIconProps,
}: Props) => {
  return (
    <View style={styles.rowContainer}>
      <View
        style={{
          flex: 1,
          paddingVertical: 5,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <StyledText style={styles.titleText}>{title}</StyledText>
        {isDisplayChat && (
          <SVGIcon
            icon="message_primary"
            isButton
            onPress={() => {
              if (onPressChat) {
                onPressChat();
              }
            }}
            marginLeft={10}
          />
        )}
        {isDisplayEvent && (
          <SVGIcon
            icon="talkshow_secondary"
            isButton
            onPress={() => {
              if (onPressEvent) {
                onPressEvent();
              }
            }}
            marginLeft={10}
          />
        )}
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
