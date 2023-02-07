import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
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
  onChangeText?: (text: string) => void;
}

const TextBox = ({
  placeHolder = '',
  title = '',
  iconHeight = 25,
  iconWidth = 25,
  isSecure = false,
  iconColor = COLORS.white,
  value = '',
  onChangeText,
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
