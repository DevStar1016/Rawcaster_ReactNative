import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../Components/CustomHeader';
import StyledText from '../Components/StyledText';

const SelectInfluencers = () => {
  return (
    <View style={styles.mainContainer}>
      <CustomHeader />
      <View style={styles.contentContainer}></View>
      <View style={styles.titleContainer}>
        <StyledText>Welcome Danii - Select your influencers</StyledText>
      </View>
    </View>
  );
};

export default SelectInfluencers;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
