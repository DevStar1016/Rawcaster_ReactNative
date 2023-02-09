import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomHeader from '../Components/CustomHeader';
import StyledText from '../Components/StyledText';
import SearchInput from '../Components/SearchInput';
import HOCView from '../Components/HOCView';
import LinearGradientButton from '../Components/LinearGradientButton';
import RightArrowImage from '../Assets/Svg/right_arrow.svg';
import InfluencersItem from '../Components/InfluencersItem';

const SelectInfluencers = () => {
  return (
    <HOCView isEnableScroll={true}>
      <View style={styles.contentContainer}></View>
      <View style={styles.titleContainer}>
        <StyledText>Welcome Danii - Select your influencers</StyledText>
      </View>
      <SearchInput />

      <InfluencersItem />
    </HOCView>
  );
};

export default SelectInfluencers;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
