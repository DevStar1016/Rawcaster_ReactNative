import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../Utilities/Colors';

const TagsSearch = () => {
  return (
    <View style={styles.mainContainer}>
      <Text>We didn't find any results!</Text>
    </View>
  );
};

export default TagsSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
