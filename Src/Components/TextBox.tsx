import {StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';

import SVGIcon from './SVGIcon';
import {IconType} from '../Utilities/Icons';
import {FONTS} from '../Utilities/Fonts';

interface TextBoxProps {
  placeHolder?: string;
  icon?: IconType;
  iconHeight?: number;
  iconWidth?: number;
}

const TextBox = ({
  placeHolder = '',
  icon = 'visibility_on',
  iconHeight = 25,
  iconWidth = 25,
}: TextBoxProps) => {
  const [value, setvalue] = useState<string>('');

  return (
    <View style={styles.mainContainer}>
      <TextInput
        value={value}
        onChangeText={setvalue}
        style={styles.inputField}
        placeholder={placeHolder}
        placeholderTextColor={COLORS.dimColor}
      />
      <View style={styles.iconContainer}>
        <SVGIcon icon={icon} height={iconHeight} width={iconWidth} />
      </View>
    </View>
  );
};

export default TextBox;

const styles = StyleSheet.create({
  mainContainer: {
    height: 40,
    width: '100%',
    borderRadius: 11,
    marginVertical: 5,
    marginTop: 15,
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
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: FONTS.Roboto.regular,
  },
  iconContainer: {
    height: '100%',
    width: '13%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
