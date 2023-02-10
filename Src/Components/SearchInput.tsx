import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import TextBox from './TextBox';
import {TextInput} from 'react-native-gesture-handler';
import {FONTS} from '../Utilities/Fonts';

type Props = {
  placeHolderText?: string;
  onPressSearch: (value: string) => void;
};

const SearchInput = ({placeHolderText = 'Search', onPressSearch}: Props) => {
  const [searchValue, setsearchValue] = useState('');
  return (
    <View style={styles.mainContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          value={searchValue}
          onChangeText={setsearchValue}
          style={styles.inputField}
          placeholder={placeHolderText}
          placeholderTextColor={COLORS.placeHolderColor}
        />
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        activeOpacity={0.7}
        onPress={() => {
          Keyboard.dismiss();
          onPressSearch(searchValue);
        }}>
        <SVGIcon icon="search" color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  mainContainer: {
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: COLORS.searchBarBg,
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.searchBarBg,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    borderRadius: 25,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    height: 45,
    width: 45,
    borderRadius: 45 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
