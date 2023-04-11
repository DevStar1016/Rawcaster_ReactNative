import {
  Keyboard,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import {TextInput} from 'react-native-gesture-handler';
import {FONTS} from '../Utilities/Fonts';
import {TEXT_INPUT_HEIGHT} from '../Utilities/Constants';

type Props = {
  placeHolderText?: string;
  onSearch: (value: string) => void;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  searchButtonColor?: string;
  marginHorizontal?: number;
  searchWhenClickedButton?: boolean;
  onLayoutHeight?: (height: number) => void;
};

const SearchInput = ({
  placeHolderText = 'Search',
  onSearch,
  marginVertical = 0,
  marginTop,
  marginBottom,
  marginHorizontal,
  onLayoutHeight,
  searchWhenClickedButton = true,
  searchButtonColor = COLORS.primary,
}: Props) => {
  const [searchValue, setsearchValue] = useState('');
  return (
    <View
      style={[
        styles.mainContainer,
        {marginVertical, marginHorizontal, marginTop, marginBottom},
      ]}
      onLayout={event => {
        if (onLayoutHeight) {
          onLayoutHeight(event.nativeEvent.layout.height);
        }
      }}>
      <View style={styles.inputContainer}>
        <TextInput
          value={searchValue}
          onChangeText={text => {
            setsearchValue(text);
            if (!searchWhenClickedButton) {
              onSearch(text);
            }
          }}
          style={styles.inputField}
          placeholder={placeHolderText}
          placeholderTextColor={COLORS.placeHolderColor}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.searchButton,
          {
            backgroundColor: searchButtonColor,
          },
        ]}
        disabled={!searchWhenClickedButton}
        activeOpacity={0.7}
        onPress={() => {
          Keyboard.dismiss();
          onSearch(searchValue);
        }}>
        <SVGIcon icon="search" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  mainContainer: {
    height: TEXT_INPUT_HEIGHT,
    borderRadius: TEXT_INPUT_HEIGHT / 2,
    backgroundColor: COLORS.lightGrey,
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.lightGrey,
    fontSize: 16,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    borderRadius: 25,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    height: TEXT_INPUT_HEIGHT,
    width: TEXT_INPUT_HEIGHT,
    borderRadius: TEXT_INPUT_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
