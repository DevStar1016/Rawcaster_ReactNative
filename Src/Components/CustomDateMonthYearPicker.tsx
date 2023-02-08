import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import DropDownPicker from './DropDownPicker';
import StyledText from './StyledText';
import {AGE_RESTRICTION, DATES_MONTHS_YEARS_DATA} from '../Utilities/Constants';

type DateMonthYearType = {
  date?: string | number | null;
  month?: string | null;
  year?: number | null;
};

const CustomDateMonthYearPicker = () => {
  const [dateMonthYear, setdateMonthYear] = useState<DateMonthYearType>({
    date: null,
    month: null,
    year: null,
  });

  const getSlicedList = (
    fieldName: 'dates' | 'months' | 'years',
    toValue: number,
  ) => {
    return DATES_MONTHS_YEARS_DATA[fieldName].slice(0, toValue);
  };

  const isCurrentMonth = (month = dateMonthYear.month) => {
    const date = new Date();
    return month === DATES_MONTHS_YEARS_DATA.months[date.getMonth()];
  };

  const isCurrentYearWithRestrictedAge = (year = dateMonthYear.year) => {
    const date = new Date();
    return year === date.getFullYear() - AGE_RESTRICTION;
  };

  const getTotalDaysCount = (year: number, month = dateMonthYear.month) => {
    return new Date(
      year,
      DATES_MONTHS_YEARS_DATA.months.findIndex(
        (monthName: string) => monthName === month,
      ) + 1,
      0,
    ).getDate();
  };

  const getMonthsList = (year = dateMonthYear.year) => {
    const date = new Date();
    if (year && isCurrentYearWithRestrictedAge(year)) {
      return getSlicedList('months', date.getMonth() + 1);
    }
    return DATES_MONTHS_YEARS_DATA.months;
  };

  const getDatesList = (
    month = dateMonthYear.month,
    year = dateMonthYear.year,
  ) => {
    const date = new Date();
    if (month && year) {
      if (isCurrentMonth(month) && isCurrentYearWithRestrictedAge(year)) {
        return getSlicedList('dates', date.getDate());
      }
      return getSlicedList('dates', getTotalDaysCount(year, month));
    } else if (month) {
      return getSlicedList(
        'dates',
        getTotalDaysCount(date.getFullYear() - AGE_RESTRICTION, month),
      );
    }
    return DATES_MONTHS_YEARS_DATA.dates;
  };

  const onSelectMonth = (month: string) => {
    let tempDateMonthYear = {...dateMonthYear, month};
    if (tempDateMonthYear.date) {
      const dateIndex = getDatesList(month).findIndex(
        (date: number | string) => date === tempDateMonthYear.date,
      );
      if (dateIndex === -1) {
        tempDateMonthYear = {...tempDateMonthYear, date: null};
      }
    }
    setdateMonthYear(tempDateMonthYear);
  };

  const onSelectYear = (year: number) => {
    let tempDateMonthYear = {...dateMonthYear, year};
    if (tempDateMonthYear.date || tempDateMonthYear.month) {
      if (tempDateMonthYear.date && tempDateMonthYear.month) {
        const dateIndex = getDatesList(tempDateMonthYear.month, year).findIndex(
          (date: number | string) => date === tempDateMonthYear.date,
        );
        if (dateIndex === -1) {
          tempDateMonthYear = {...tempDateMonthYear, date: null};
        }
      }
      if (tempDateMonthYear.month) {
        const monthIndex = getMonthsList(year).findIndex(
          (month: number | string) => month === tempDateMonthYear.month,
        );

        if (monthIndex === -1) {
          tempDateMonthYear = {...tempDateMonthYear, month: null};
        }
      }
    }
    setdateMonthYear(tempDateMonthYear);
  };

  return (
    <View style={styles.mainContainer}>
      <StyledText>Date of Birth</StyledText>
      <View style={styles.dateMonthYearContainer}>
        <DropDownPicker
          placeHolderText="Month"
          mainContainerWidth={'36%'}
          dataList={getMonthsList()}
          value={dateMonthYear.month}
          onSelectItem={(month: string) => {
            onSelectMonth(month);
          }}
        />
        <DropDownPicker
          placeHolderText="Day"
          mainContainerWidth={'28%'}
          dataList={getDatesList()}
          value={dateMonthYear.date}
          onSelectItem={(date: string) => {
            setdateMonthYear(pre => {
              return {
                ...pre,
                date,
              };
            });
          }}
        />
        <DropDownPicker
          placeHolderText="Year"
          mainContainerWidth={'30%'}
          dataList={DATES_MONTHS_YEARS_DATA.years}
          value={dateMonthYear.year}
          onSelectItem={(year: number) => {
            onSelectYear(year);
          }}
        />
      </View>
    </View>
  );
};

export default CustomDateMonthYearPicker;

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
