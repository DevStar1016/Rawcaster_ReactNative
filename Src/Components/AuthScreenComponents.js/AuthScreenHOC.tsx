import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import HOCView from '../HOCView';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../StyledText';
import SubmitButton from '../SubmitButton';
import SloganLogo from '../../Assets/Svg/slogan_logo.svg';
import {FONTS} from '../../Utilities/Fonts';
import AppLogo from '../../Assets/Svg/app_logo.svg';
import SVGIcon from '../SVGIcon';

type AuthScreenHOCProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  subTitle: string;
  buttonBottomLeftText: string;
  buttonBottomRightText: string;
  submitButtonText?: string;
  isEnableBottomButtonText?: boolean;
  isEnableCancelButton?: boolean;
  isEnableBackButton?: boolean;
  isEnableSubmitButton?: boolean;
  isLoading?: boolean;
  titleContainerAlignItems?: 'flex-start' | 'flex-end' | 'center';
  titleTextAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  buttonBottomTextAlignment?: 'flex-start' | 'flex-end' | 'center';
  onPressSubmitButton?: () => void;
  onPressButtonBottomText?: () => void;
  onPressBackButton?: () => void;
  onPressCancelButton?: () => void;
};

const AuthScreenHOC = ({
  children,
  title = '',
  subTitle = '',
  titleContainerAlignItems = 'center',
  titleTextAlign = 'center',
  buttonBottomLeftText = '',
  isLoading = false,
  buttonBottomRightText = '',
  buttonBottomTextAlignment = 'center',
  submitButtonText = '',
  isEnableBackButton = false,
  isEnableSubmitButton = true,
  isEnableCancelButton = false,
  isEnableBottomButtonText = true,
  onPressButtonBottomText,
  onPressSubmitButton,
  onPressBackButton,
  onPressCancelButton,
}: AuthScreenHOCProps) => {
  return (
    <HOCView
      isEnableKeyboardAware={true}
      isEnableHeader={false}
      paddingHorizontal={0}>
      <View
        style={[
          styles.headerContainer,
          {justifyContent: isEnableBackButton ? 'space-between' : 'center'},
        ]}>
        {isEnableBackButton && (
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              disabled={isLoading}
              activeOpacity={0.7}
              onPress={onPressBackButton}>
              <SVGIcon
                icon="back"
                width="100%"
                height="100%"
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
        )}
        <View
          style={{
            width: '60%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <SloganLogo />
        </View>
        {isEnableBackButton && <View style={{width: '20%'}} />}
      </View>
      <View style={styles.contentContainer}>
        <View
          style={[
            styles.titleContainer,
            {alignItems: titleContainerAlignItems},
          ]}>
          <StyledText style={{...styles.title, textAlign: titleTextAlign}}>
            {title}
          </StyledText>
          <StyledText style={{textAlign: titleTextAlign}}>
            {subTitle}
          </StyledText>
        </View>

        {children}
        {isEnableSubmitButton && (
          <SubmitButton
            buttonText={submitButtonText}
            isLoading={isLoading}
            onPress={onPressSubmitButton}
          />
        )}
        {isEnableCancelButton && (
          <SubmitButton
            buttonText={'Cancel'}
            onPress={onPressCancelButton}
            bgColor={COLORS.white}
            isDisabled={isLoading}
            textColor={COLORS.secondary}
          />
        )}
        {isEnableBottomButtonText && (
          <View
            style={[
              styles.signUpContainer,
              {alignItems: 'center', justifyContent: buttonBottomTextAlignment},
            ]}>
            <StyledText style={styles.signUpText}>
              {buttonBottomLeftText}
            </StyledText>
            <StyledText
              isButton={!isLoading}
              onPress={onPressButtonBottomText}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              {buttonBottomRightText}
            </StyledText>
          </View>
        )}
        <View style={styles.bottomContainer}>
          <AppLogo />
          <StyledText style={styles.footerText}>
            © Copyright Rawcaster 2021
          </StyledText>
          <StyledText style={styles.footerText} paddingVertical={0} isButton>
            Terms and Conditions | Privacy Policy
          </StyledText>
          <StyledText style={styles.footerText} paddingVertical={0}>
            Cookies Policy
          </StyledText>
        </View>
      </View>
    </HOCView>
  );
};

export default AuthScreenHOC;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  backButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '20%',
  },
  backButton: {
    borderWidth: 1,
    borderColor: COLORS.white,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  contentContainer: {
    paddingVertical: 15,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  signUpText: {
    color: COLORS.dimColor,
    fontWeight: '500',
    fontSize: 17,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingTop: 40,
  },
  footerText: {
    fontFamily: FONTS.Roboto.regular,
    fontWeight: '400',
    color: COLORS.dimColor,
  },
});
