import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';

import SVGIcon, {SVGIconProps} from './SVGIcon';
import {IconType} from '../Utilities/Icons';
import {FONTS} from '../Utilities/Fonts';
import StyledText from './StyledText';
import {TEXT_INPUT_HEIGHT} from '../Utilities/Constants';

interface TextBoxProps {
  placeHolder?: string;
  title?: string;
  isSecure?: boolean;
  errorText?: string;
  icon?: IconType;
  iconHeight?: number;
  iconWidth?: number;
  value?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  isEditable?: boolean;
  backgroundColor?: string;
  isEnablePasswordConditionText?: boolean;
  passwordConditionTextStyle?: TextStyle;
  onChangeText?: (text: string) => void;
  mainContainerMarginVertical?: number;
  inputContainerMarginVertical?: number;
  titlePaddingVertical?: number;
  borderColor?: string;
  titleStyle?: TextStyle;
  textColor?: string;
  isEnableOuterRightIcon?: boolean;
  outerRightIconProps: SVGIconProps;
}

const TextBox = ({
  placeHolder = '',
  title = '',
  iconHeight = 25,
  iconWidth = 25,
  isSecure = false,
  isEnablePasswordConditionText = false,
  value = '',
  errorText = '',
  isEditable = true,
  keyboardType,
  maxLength,
  onChangeText,
  passwordConditionTextStyle = {},
  mainContainerMarginVertical = 5,
  inputContainerMarginVertical = 5,
  titlePaddingVertical = 5,
  backgroundColor = COLORS.white,
  borderColor = COLORS.borderColor,
  titleStyle = {},
  textColor = COLORS.black,
  isEnableOuterRightIcon = false,
  outerRightIconProps = {},
}: TextBoxProps) => {
  const [isVisiblePassword, setisVisiblePassword] = useState(false);

  return (
    <View
      style={[
        styles.mainContainer,
        {marginVertical: mainContainerMarginVertical},
      ]}>
      {title && (
        <StyledText
          style={{paddingVertical: titlePaddingVertical, ...titleStyle}}>
          {title}
        </StyledText>
      )}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: errorText ? 'red' : borderColor,
              marginVertical: inputContainerMarginVertical,
              backgroundColor,
            },
          ]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            editable={isEditable}
            secureTextEntry={isSecure ? !isVisiblePassword : false}
            style={[
              styles.inputField,
              {
                // width: isSecure ? '87%' : '100%',
                backgroundColor,
                color: textColor,
              },
            ]}
            placeholder={placeHolder}
            keyboardType={keyboardType}
            maxLength={maxLength}
            placeholderTextColor={COLORS.placeHolderColor}
          />
          {isSecure && (
            <View style={styles.iconContainer}>
              <TouchableOpacity
                style={styles.button}
                disabled={!isEditable}
                onPress={() => {
                  setisVisiblePassword(pre => !pre);
                }}>
                <SVGIcon
                  icon={isVisiblePassword ? 'visibility_on' : 'visibility_off'}
                  height={iconHeight}
                  width={iconWidth}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {isEnableOuterRightIcon && <SVGIcon {...outerRightIconProps} />}
      </View>
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText}</StyledText>
      ) : null}
      {isSecure && isEnablePasswordConditionText && (
        <StyledText style={{paddingVertical: 5, ...passwordConditionTextStyle}}>
          We recommend your password to be at least 8 characters long, contain
          uppercase letter (A-Z), lowercase letter (a-z), symbol (!@#$%) and a
          number (0-9).
        </StyledText>
      )}
    </View>
  );
};

export default TextBox;

const styles = StyleSheet.create({
  mainContainer: {
    marginVertical: 5,
  },
  inputContainer: {
    height: TEXT_INPUT_HEIGHT,
    flex: 1,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderColor,

    alignItems: 'center',
  },
  inputField: {
    flex: 1,
    height: '100%',

    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 14,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
  },
  iconContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});
