import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';

const SearchInput = () => {
  return (
    <View style={styles.mainContainer}>
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
  searchButton: {
    backgroundColor: COLORS.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
