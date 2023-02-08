import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import DropDownPicker from './DropDownPicker';
import StyledText from './StyledText';
import {DATES_MONTHS_YEARS_DATA} from '../Utilities/Constants';

const DOBPicker = () => {
  return (
    <View style={styles.mainContainer}>
      <StyledText>Date of Birth</StyledText>
      <View style={styles.dateMonthYearContainer}>
        <DropDownPicker
          placeHolderText="September"
          mainContainerWidth={'36%'}
          dataList={DATES_MONTHS_YEARS_DATA.months}
        />
        <DropDownPicker
          placeHolderText="Day"
          mainContainerWidth={'28%'}
          dataList={DATES_MONTHS_YEARS_DATA.dates}
        />
        <DropDownPicker
          placeHolderText="Year"
          mainContainerWidth={'30%'}
          dataList={DATES_MONTHS_YEARS_DATA.years}
        />
      </View>
    </View>
  );
};

export default DOBPicker;

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 5,
  },
  dateMonthYearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
