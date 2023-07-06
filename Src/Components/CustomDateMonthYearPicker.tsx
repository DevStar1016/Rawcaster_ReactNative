import {StyleSheet, TextStyle, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import DropDownPicker from './DropDownPicker';
import StyledText from './StyledText';
import {AGE_RESTRICTION, DATES_MONTHS_YEARS_DATA} from '../Utilities/Constants';
import moment from 'moment';
import {COLORS} from '../Utilities/Colors';
import {IconType} from '../Utilities/Icons';

type PlaceHolder = {
  first?: string;
  second?: string;
  third?: string;
};

type DateMonthYearType = {
  date?: string | number | null;
  month?: string | null;
  year?: number | null;
};

type OtherDataType = {
  days: number;
  hours: number;
  minutes: number;
};

type ContainerWidth = {
  first?: string | number;
  second?: string | number;
  third?: string | number;
};

type ValueAdditionalData = {
  first?: string;
  second?: string;
  third?: string;
};

type Props = {
  onSelect: (value: string | any) => void;
  format?: string;
  pickerMode?: 'month_date_year' | 'duration_days_hrs_mins';
  errorText?: string;
  isDisabled?: boolean;
  titlePaddingVertical?: number;
  inputContainerMarginVertical?: number;
  mainContainerMarginVertical?: number;
  parentContainerPaddingVertical?: number;
  value?: string;
  onSelectDateMonthYearError?: () => void;
  titleStyle?: TextStyle;
  dropDownIcon?: IconType;
  title?: string;
  dropDownBorderColor?: string;
  dropDownBackgroundColor?: string;
  dropDownValueColor?: string;
  placeHolder?: PlaceHolder;
  dropDownContainerWidth?: ContainerWidth;
  valueShowAdditionalData?: ValueAdditionalData;
  defaultDurationData?: OtherDataType;
};

const CustomDateMonthYearPicker = ({
  onSelect,
  format = 'YYYY-MM-DD',
  errorText = '',
  valueShowAdditionalData = {
    first: '',
    second: '',
    third: '',
  },
  isDisabled = false,
  titlePaddingVertical = 5,
  value,
  onSelectDateMonthYearError,
  titleStyle = {},
  inputContainerMarginVertical = 5,
  mainContainerMarginVertical = 5,
  parentContainerPaddingVertical = 5,
  dropDownBorderColor = COLORS.borderColor,
  dropDownBackgroundColor = COLORS.white,
  dropDownValueColor = COLORS.black,
  title = 'Date of Birth',
  pickerMode = 'month_date_year',
  placeHolder = {
    first: 'Month',
    second: 'Day',
    third: 'Year',
  },
  defaultDurationData = {
    days: 7,
    hours: 0,
    minutes: 0,
  },
  dropDownIcon = 'down_arrow',
  dropDownContainerWidth = {
    first: '39%',
    second: '27%',
    third: '29%',
  },
}: Props) => {
  const [dateMonthYear, setdateMonthYear] = useState<DateMonthYearType>({
    date: value ? moment(value, format).date() : null,
    month: value
      ? DATES_MONTHS_YEARS_DATA.months[moment(value, format).month()]
      : null,
    year: value ? moment(value, format).year() : null,
  });
  const [durationData, setdurationData] = useState<OtherDataType>({
    ...defaultDurationData,
  });

  useEffect(() => {
    if (
      durationData.days.toString() &&
      durationData.hours.toString() &&
      durationData.minutes.toString() &&
      pickerMode === 'duration_days_hrs_mins'
    ) {
      onSelect(durationData);
    }
  }, [durationData]);

  useEffect(() => {
    if (
      dateMonthYear.date &&
      dateMonthYear.month &&
      dateMonthYear.year &&
      pickerMode === 'month_date_year'
    ) {
      onSelect(
        moment(
          dateMonthYear.year +
            ' ' +
            dateMonthYear.month +
            ' ' +
            dateMonthYear.date,
          'YYYY MMMM DD',
        ).format(format),
      );
    }
  }, [dateMonthYear]);

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
        if (tempDateMonthYear.date) {
          console.log('Date ERRORRR');

          onSelectDateMonthYearError && onSelectDateMonthYearError();
        }
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
          if (tempDateMonthYear.date) {
            console.log('Date ERRORRR');

            onSelectDateMonthYearError && onSelectDateMonthYearError();
          }
          tempDateMonthYear = {...tempDateMonthYear, date: null};
        }
      }
      if (tempDateMonthYear.month) {
        const monthIndex = getMonthsList(year).findIndex(
          (month: number | string) => month === tempDateMonthYear.month,
        );

        if (monthIndex === -1) {
          if (tempDateMonthYear.month) {
            console.log('Month ERRORRR');
            onSelectDateMonthYearError && onSelectDateMonthYearError();
          }
          tempDateMonthYear = {...tempDateMonthYear, month: null};
        }
      }
    }
    setdateMonthYear(tempDateMonthYear);
  };

  const getFirstDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return getMonthsList();
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return [...Array(8)].map((_, index) => index);
    }
    return [];
  };

  const getSecondDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return getDatesList();
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return [...Array(24)].map((_, index) => index);
    }
    return [];
  };

  const getThirdDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return DATES_MONTHS_YEARS_DATA.years;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return [...Array(60)].map((_, index) => index);
    }
    return [];
  };

  const onSelectFirstItem = (selectedValue: any) => {
    if (pickerMode === 'month_date_year') {
      onSelectMonth(selectedValue);
    } else if (pickerMode === 'duration_days_hrs_mins') {
      setdurationData(preData => {
        return {
          ...preData,
          days: selectedValue,
          hours: selectedValue === 7 ? 0 : preData.hours,
          minutes: selectedValue === 7 ? 0 : preData.minutes,
        };
      });
    }
  };

  const onSelectSecondItem = (selectedValue: any) => {
    if (pickerMode === 'month_date_year') {
      setdateMonthYear(pre => {
        return {
          ...pre,
          date: selectedValue,
        };
      });
    } else if (pickerMode === 'duration_days_hrs_mins') {
      setdurationData(preData => {
        return {
          ...preData,
          hours: preData.days === 7 ? 0 : selectedValue,
        };
      });
    }
  };

  const onSelectThirdItem = (selectedValue: any) => {
    if (pickerMode === 'month_date_year') {
      onSelectYear(selectedValue);
    } else if (pickerMode === 'duration_days_hrs_mins') {
      setdurationData(preData => {
        return {
          ...preData,
          minutes: preData.days === 7 ? 0 : selectedValue,
        };
      });
    }
  };

  const getFirstDropDownValue = () => {
    if (pickerMode === 'month_date_year') {
      return dateMonthYear.month;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return durationData.days.toString();
    }
  };

  const getSecondDropDownValue = () => {
    if (pickerMode === 'month_date_year') {
      return dateMonthYear.date;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return durationData.hours.toString();
    }
  };

  const getThirdDropDownValue = () => {
    if (pickerMode === 'month_date_year') {
      return dateMonthYear.year;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return durationData.minutes.toString();
    }
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {paddingVertical: parentContainerPaddingVertical},
      ]}>
      {title ? (
        <StyledText
          style={{paddingVertical: titlePaddingVertical, ...titleStyle}}>
          {title}
        </StyledText>
      ) : null}
      <View style={styles.dateMonthYearContainer}>
        <DropDownPicker
          borderColor={dropDownBorderColor}
          backgroundColor={dropDownBackgroundColor}
          valueTextColor={dropDownValueColor}
          placeHolderText={placeHolder.first}
          isDisabled={isDisabled}
          dropDownIcon={dropDownIcon}
          mainContainerWidth={dropDownContainerWidth.first}
          fontSize={13}
          inputContainerMarginVertical={inputContainerMarginVertical}
          mainContainerMarginVertical={mainContainerMarginVertical}
          dataList={getFirstDropDownList()}
          value={getFirstDropDownValue()}
          additionalDisplayText={' ' + valueShowAdditionalData.first}
          onSelectItem={onSelectFirstItem}
        />
        <DropDownPicker
          borderColor={dropDownBorderColor}
          backgroundColor={dropDownBackgroundColor}
          valueTextColor={dropDownValueColor}
          placeHolderText={placeHolder.second}
          dropDownIcon={dropDownIcon}
          mainContainerWidth={dropDownContainerWidth.second}
          inputContainerMarginVertical={inputContainerMarginVertical}
          mainContainerMarginVertical={mainContainerMarginVertical}
          isDisabled={isDisabled}
          dataList={getSecondDropDownList()}
          fontSize={13}
          value={getSecondDropDownValue()}
          additionalDisplayText={' ' + valueShowAdditionalData.second}
          onSelectItem={onSelectSecondItem}
        />
        <DropDownPicker
          borderColor={dropDownBorderColor}
          backgroundColor={dropDownBackgroundColor}
          valueTextColor={dropDownValueColor}
          placeHolderText={placeHolder.third}
          dropDownIcon={dropDownIcon}
          mainContainerWidth={dropDownContainerWidth.third}
          inputContainerMarginVertical={inputContainerMarginVertical}
          mainContainerMarginVertical={mainContainerMarginVertical}
          isDisabled={isDisabled}
          fontSize={13}
          dataList={getThirdDropDownList()}
          value={getThirdDropDownValue()}
          additionalDisplayText={' ' + valueShowAdditionalData.third}
          onSelectItem={onSelectThirdItem}
        />
      </View>
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText}</StyledText>
      ) : null}
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
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});
