import {StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import CardView from './CardView';
import {IconType} from '../Utilities/Icons';
import {FONTS} from '../Utilities/GlobalFonts';
import SVGIcon from './SVGIcon';

interface TextBoxProps {
  placeHolder?: string;
  icon?: IconType;
  iconHeight?: number;
  iconWidth?: number;
}

const TextBox = ({
  placeHolder = '',
  icon = 'user',
  iconHeight = 25,
  iconWidth = 25,
}: TextBoxProps) => {
  const [value, setvalue] = useState<string>('');

  return (
    <CardView style={styles.mainContainer}>
      <View style={styles.iconContainer}>
        <SVGIcon icon={icon} height={iconHeight} width={iconWidth} />
      </View>
      <TextInput
        value={value}
        onChangeText={setvalue}
        style={styles.inputField}
        placeholder={placeHolder}
        placeholderTextColor={COLORS.dimColor}
      />
    </CardView>
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
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.39,
    shadowRadius: 8.3,
    elevation: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',

    alignItems: 'center',
  },
  inputField: {
    height: '100%',
    width: '87%',
    borderRadius: 11,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: FONTS.RobotoSlab.regular,
  },
  iconContainer: {
    height: '100%',
    width: '13%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
