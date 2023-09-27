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
    second: 'Date',
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

  /**
   * Get a sliced list of dates, months, or years from the DATES_MONTHS_YEARS_DATA object.
   * @param {string} fieldName - The field name indicating whether to get dates, months, or years.
   * @param {number} toValue - The number of items to slice from the list.
   * @returns {Array} - A sliced list of dates, months, or years.
   */
  const getSlicedList = (
    fieldName: 'dates' | 'months' | 'years',
    toValue: number,
  ) => {
    return DATES_MONTHS_YEARS_DATA[fieldName].slice(0, toValue);
  };

  /**
   * Checks if the given month is the current month.
   * @param {number} [month=dateMonthYear.month] - The month to check. Defaults to the current month.
   * @returns {boolean} - True if the given month is the current month, false otherwise.
   */
  const isCurrentMonth = (month = dateMonthYear.month) => {
    const date = new Date();
    return month === DATES_MONTHS_YEARS_DATA.months[date.getMonth()];
  };

  /**
   * Checks if the given year is the current year minus the age restriction.
   * @param {number} [year=dateMonthYear.year] - The year to check. Defaults to the current year.
   * @returns {boolean} - True if the given year is the current year minus the age restriction, false otherwise.
   */
  const isCurrentYearWithRestrictedAge = (year = dateMonthYear.year) => {
    const date = new Date();
    return year === date.getFullYear() - AGE_RESTRICTION;
  };

  /**
   * Get the total number of days in a given month and year.
   * @param {number} year - The year.
   * @param {string} [month=dateMonthYear.month] - The month. Defaults to the current month.
   * @returns {number} The total number of days in the specified month and year.
   */
  const getTotalDaysCount = (year: number, month = dateMonthYear.month) => {
    return new Date(
      year,
      DATES_MONTHS_YEARS_DATA.months.findIndex(
        (monthName: string) => monthName === month,
      ) + 1,
      0,
    ).getDate();
  };

  /**
   * Get a list of months for the specified year.
   * If no year is provided, the current year is used.
   * @param {number} [year=dateMonthYear.year] - The year for which to get the months.
   * @returns {Array<string>} - An array of month names.
   */
  const getMonthsList = (year = dateMonthYear.year) => {
    const date = new Date();
    if (year && isCurrentYearWithRestrictedAge(year)) {
      return getSlicedList('months', date.getMonth() + 1);
    }
    return DATES_MONTHS_YEARS_DATA.months;
  };

  /**
   * Get a list of dates based on the given month and year.
   * If no month and year are provided, it returns the list of all dates.
   * @param {number} [month=dateMonthYear.month] - The month for which to get the dates.
   * @param {number} [year=dateMonthYear.year] - The year for which to get the dates.
   * @returns {Array<number>} - The list of dates.
   */
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

  /**
   * Updates the selected month in the dateMonthYear object and handles error cases.
   * @param {string} month - The selected month.
   * @returns None
   */
  const onSelectMonth = (month: string) => {
    let tempDateMonthYear = {...dateMonthYear, month};
    if (tempDateMonthYear.date) {
      const dateIndex = getDatesList(month).findIndex(
        (date: number | string) => date === tempDateMonthYear.date,
      );
      if (dateIndex === -1) {
        if (tempDateMonthYear.date) {
          onSelectDateMonthYearError && onSelectDateMonthYearError();
        }
        tempDateMonthYear = {...tempDateMonthYear, date: null};
      }
    }
    setdateMonthYear(tempDateMonthYear);
  };

  /**
   * Updates the selected year in the dateMonthYear state object and performs error handling
   * if the selected date or month is invalid for the new year.
   * @param {number} year - The new selected year.
   * @returns None
   */
  const onSelectYear = (year: number) => {
    let tempDateMonthYear = {...dateMonthYear, year};
    if (tempDateMonthYear.date || tempDateMonthYear.month) {
      if (tempDateMonthYear.date && tempDateMonthYear.month) {
        const dateIndex = getDatesList(tempDateMonthYear.month, year).findIndex(
          (date: number | string) => date === tempDateMonthYear.date,
        );
        if (dateIndex === -1) {
          if (tempDateMonthYear.date) {
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
            onSelectDateMonthYearError && onSelectDateMonthYearError();
          }
          tempDateMonthYear = {...tempDateMonthYear, month: null};
        }
      }
    }
    setdateMonthYear(tempDateMonthYear);
  };

  /**
   * Returns the first dropdown list based on the picker mode.
   * @returns {Array} - The dropdown list.
   */
  const getFirstDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return getMonthsList();
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return [...Array(8)].map((_, index) => index);
    }
    return [];
  };

  /**
   * Returns the second dropdown list based on the picker mode.
   * @returns {Array} - The second dropdown list.
   */
  const getSecondDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return getDatesList();
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return [...Array(24)].map((_, index) => index);
    }
    return [];
  };

  /**
   * Returns the third dropdown list based on the picker mode.
   * @returns {Array} - The third dropdown list.
   */
  const getThirdDropDownList = () => {
    if (pickerMode === 'month_date_year') {
      return DATES_MONTHS_YEARS_DATA.years;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      if (durationData.days === 0 && durationData.hours === 0) {
        return Array.from({length: 55}, (_, index) => 5 + index);
      }
      return [...Array(60)].map((_, index) => index);
    }
    return [];
  };

  /**
   * Handles the selection of the first item in a picker.
   * @param {any} selectedValue - The value of the selected item.
   * @returns None
   */
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

  /**
   * Handles the selection of the second item in a picker.
   * @param {any} selectedValue - The value of the selected item.
   * @returns None
   */
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

  /**
   * Handles the selection of the third item in a picker.
   * @param {any} selectedValue - The value of the selected item.
   * @returns None
   */
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

  /**
   * Retrieves the value of the first dropdown based on the current picker mode.
   * @returns {string | undefined} The value of the first dropdown, or undefined if the picker mode is not recognized.
   */
  const getFirstDropDownValue = (): string | undefined | null => {
    if (pickerMode === 'month_date_year') {
      return dateMonthYear.month;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return durationData.days.toString();
    }
  };

  /**
   * Retrieves the value for the second dropdown based on the current picker mode.
   * @returns {string} The value for the second dropdown.
   */
  const getSecondDropDownValue = () => {
    if (pickerMode === 'month_date_year') {
      return dateMonthYear.date;
    } else if (pickerMode === 'duration_days_hrs_mins') {
      return durationData.hours.toString();
    }
  };

  /**
   * Retrieves the value for the third dropdown based on the current picker mode.
   * @returns The value for the third dropdown.
   */
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
