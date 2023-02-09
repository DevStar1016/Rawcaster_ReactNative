import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import TextBox from './TextBox';
import {TextInput} from 'react-native-gesture-handler';

type Props = {
  placeHolderText?: string;
};

const SearchInput = ({placeHolderText = 'Search'}: Props) => {
  const [searchValue, setsearchValue] = useState('');
  return (
    <View style={styles.mainContainer}>
      <View style={styles.inputContainer}>
        {/* <TextInput
          value={searchValue}
          onChangeText={setsearchValue}
         
          style={[styles.inputField, {width: isSecure ? '87%' : '100%'}]}
          placeholder={placeHolder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholderTextColor={COLORS.placeHolderColor}
        /> */}
      </View>
      <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
        <SVGIcon icon="search" color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  mainContainer: {
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.searchBarBg,
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
