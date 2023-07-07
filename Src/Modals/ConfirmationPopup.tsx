import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon, {SVGIconProps} from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import SubmitButton from '../Components/SubmitButton';
import {FONTS} from '../Utilities/Fonts';
import {IconType} from '../Utilities/Icons';

type Props = {
  onClose: () => void;
  isEnableClose?: boolean;
  isEnableNegativeButton?: boolean;
  positiveButtonText?: string;
  negativeButtonText?: string;
  content?: string;
  titleText?: string;
  contentTextStyle?: TextStyle;
  subContainerStyle?: ViewStyle;
  bottomTitleLogoProps?: SVGIconProps;
  bottomTitleLogo?: IconType;
  titleTextStyle?: TextStyle;
  titleContainerStyle?: ViewStyle;
  bottomLogoContainerStyle?: ViewStyle;
  closeIconProps?: SVGIconProps;
  onPressPositiveButton?: () => void;
  onPressNegativeButton?: () => void;
};

const ConfirmationPopup = ({
  onClose,
  isEnableClose = true,
  isEnableNegativeButton = true,
  positiveButtonText = 'Yes',
  content = '',
  titleText = '',
  bottomTitleLogo,
  bottomTitleLogoProps,
  contentTextStyle,
  negativeButtonText = 'Later',
  onPressPositiveButton,
  onPressNegativeButton,
  closeIconProps,
  subContainerStyle,
  titleContainerStyle,
  titleTextStyle,
  bottomLogoContainerStyle,
}: Props) => {
  return (
    <View style={styles.mainContainer}>
      <View style={[styles.subContainer, {...subContainerStyle}]}>
        <View style={[styles.titleContainer, {...titleContainerStyle}]}>
          <View style={{width: '10%'}} />
          <View style={styles.logoContainer}>
            {titleText ? (
              <StyledText style={[styles.titleText, {...titleTextStyle}]}>
                {titleText}
              </StyledText>
            ) : (
              <SVGIcon icon="app_text_logo_colored" height={40} width={'75%'} />
            )}
          </View>
          <View style={styles.closeButtonContainer}>
            {isEnableClose && (
              <TouchableOpacity onPress={onClose}>
                <SVGIcon icon={'close'} {...closeIconProps} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{alignItems: 'center'}}>
          {bottomTitleLogo && (
            <View style={{...bottomLogoContainerStyle}}>
              <SVGIcon icon={bottomTitleLogo} {...bottomTitleLogoProps} />
            </View>
          )}
        </View>
        <View style={{paddingHorizontal: 15, paddingBottom: 15}}>
          <View style={styles.contentContainer}>
            <StyledText
              style={{fontSize: 14, paddingVertical: 5, ...contentTextStyle}}>
              {content}
            </StyledText>
          </View>
          <View style={styles.buttonsContainer}>
            <SubmitButton
              buttonText={positiveButtonText}
              marginTop={10}
              buttonTextStyle={{fontSize: 14}}
              onPress={onPressPositiveButton}
            />
            {isEnableNegativeButton && (
              <SubmitButton
                buttonText={negativeButtonText}
                marginTop={10}
                buttonTextStyle={{fontSize: 14}}
                bgColor={COLORS.white}
                textColor={COLORS.secondary}
                onPress={onPressNegativeButton}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConfirmationPopup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    backgroundColor: COLORS.white,
    width: '85%',
    borderRadius: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '10%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '70%',
  },
  titleText: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.bold,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonsContainer: {
    paddingBottom: 10,
  },
});
