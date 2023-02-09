import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../Components/CustomHeader';

const SelectInfluencers = () => {
  return (
    <View style={styles.mainContainer}>
      <CustomHeader />
    </View>
  );
};

export default SelectInfluencers;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
