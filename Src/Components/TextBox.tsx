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

import SVGIcon from './SVGIcon';
import {IconType} from '../Utilities/Icons';
import {FONTS} from '../Utilities/Fonts';
import StyledText from './StyledText';

interface TextBoxProps {
  placeHolder?: string;
  title: string;
  isSecure: boolean;

  icon?: IconType;
  iconHeight?: number;
  iconWidth?: number;
  iconColor?: string;
  value?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  isEnablePasswordConditionText?: boolean;
  passwordConditionTextStyle?: TextStyle;
  onChangeText?: (text: string) => void;
}

const TextBox = ({
  placeHolder = '',
  title = '',
  iconHeight = 25,
  iconWidth = 25,
  isSecure = false,
  isEnablePasswordConditionText = false,
  iconColor = COLORS.white,
  value = '',
  keyboardType,
  maxLength,
  onChangeText,
  passwordConditionTextStyle = {},
}: TextBoxProps) => {
  const [isVisiblePassword, setisVisiblePassword] = useState(false);

  return (
    <View style={styles.mainContainer}>
      {title && <StyledText>{title}</StyledText>}
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isSecure ? !isVisiblePassword : false}
          style={[styles.inputField, {width: isSecure ? '87%' : '100%'}]}
          placeholder={placeHolder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholderTextColor={COLORS.placeHolderColor}
        />
        {isSecure && (
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setisVisiblePassword(pre => !pre);
              }}>
              <SVGIcon
                icon={isVisiblePassword ? 'visibility_on' : 'visibility_off'}
                height={iconHeight}
                width={iconWidth}
                color={iconColor}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {isSecure && isEnablePasswordConditionText && (
        <StyledText style={passwordConditionTextStyle}>
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
    height: 55,
    width: '100%',
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
    height: '100%',
    width: '87%',
    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 17,
    fontWeight: '400',
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
  },
  iconContainer: {
    height: '100%',
    width: '13%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
