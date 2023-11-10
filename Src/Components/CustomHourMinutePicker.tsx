import {
  ActivityIndicator,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import DateTimePickerModal, {
  ReactNativeModalDateTimePickerProps,
} from 'react-native-modal-datetime-picker';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import ItemSelectionMiniList from './ItemSelectionMiniList';
import {TEXT_INPUT_HEIGHT} from '../Utilities/Constants';
import {IconType} from '../Utilities/Icons';
import ItemSelectionBigList, {
  ItemSelectionBigListProps,
} from './ItemSelectionBigList';
import SubmitButton from './SubmitButton';

type Props = {
  title?: string;
  value?: any;
  dateValue?: string;
  dropDownIconSize?: number;
  dataList?: any[];
  placeHolderText?: string;
  isInsideList?: boolean;
  isDisabled?: boolean;
  mainContainerWidth?: number | string;
  onPress?: () => void;
  onSelectItem?: (item: any) => void;
  mainContainerMarginVertical?: number;
  titlePaddingVertical?: number;
  inputContainerMarginVertical?: number;
  fieldName?: string;
  listTitle?: string;
  isDateTime?: boolean;
  errorText?: string;
  datePickerProps?: ReactNativeModalDateTimePickerProps;
  dropDownIcon?: IconType;
  maxHours?: number;
  titleStyle?: TextStyle;
  isDropDownIconAsButton?: boolean;
  onPressIcon?: () => void;
  isLoadingIcon?: boolean;

  fontSize?: number;
  minInterval?: number;
  backgroundColor?: string;
  borderColor?: string;
  valueTextColor?: string;
  bigListProps?: Omit<
    ItemSelectionBigListProps,
    'fieldName' | 'onSelectItem' | 'listData' | 'title' | 'onCloseList'
  >;
  additionalDisplayText?: string;
};

const CustomHourMinutePicker = ({
  title,
  value,
  errorText = '',
  dropDownIconSize = 13,
  mainContainerWidth = '100%',
  placeHolderText = 'Select Data',
  isDisabled = false,
  onSelectItem,
  fieldName,
  mainContainerMarginVertical = 5,
  titlePaddingVertical = 5,
  inputContainerMarginVertical = 5,
  isDropDownIconAsButton = false,
  dropDownIcon = 'down_arrow',
  onPressIcon,
  isLoadingIcon,
  fontSize = 14,
  titleStyle,
  valueTextColor = COLORS.black,
  backgroundColor = COLORS.white,
  borderColor = COLORS.borderColor,
  maxHours = 10,
  minInterval = 0,
  additionalDisplayText = '',
}: Props) => {
  const [isOpenDataListModal, setisOpenDataListModal] = useState(false);
  const [SelectedTime, setSelectedTime] = useState({
    hours: '',
    minutes: '',
  });

  function convertToDoubleDigit(number: any) {
    if (number >= 0 && number <= 9) {
      return `0${number}`;
    } else {
      return number.toString();
    }
  }

  const getHourArray = () => {
    let hourArray = [...new Array(maxHours + 1)].map((ele, index) => {
      return {
        id: `hours_${convertToDoubleDigit(index)}`,
        name: convertToDoubleDigit(index),
      };
    });
    return hourArray;
  };

  const getMinuteArray = () => {
    let minuteArray = [...new Array(60)].map((ele, index) => {
      if (SelectedTime.hours === `${convertToDoubleDigit(maxHours)}`) {
        if (index === 0) {
          return {
            id: `minutes_${convertToDoubleDigit(index)}`,
            name: convertToDoubleDigit(index),
          };
        }
      } else if (SelectedTime.hours === `00`) {
        if (index !== 0) {
          if (minInterval && index % minInterval === 0) {
            return {
              id: `minutes_${convertToDoubleDigit(index)}`,
              name: convertToDoubleDigit(index),
            };
          }
        }
      } else if (!minInterval) {
        return {
          id: `minutes_${convertToDoubleDigit(index)}`,
          name: convertToDoubleDigit(index),
        };
      } else if (minInterval && index % minInterval === 0) {
        return {
          id: `minutes_${convertToDoubleDigit(index)}`,
          name: convertToDoubleDigit(index),
        };
      }
    });
    return minuteArray.filter(ele => ele);
  };

  useEffect(() => {
    if (value) {
      let findHrsandMins = value.split(':');
      if (findHrsandMins && findHrsandMins.length > 1) {
        setSelectedTime({
          hours: findHrsandMins[0],
          minutes: findHrsandMins[1],
        });
      }
    }
  }, [value]);

  /**
   * Returns the text value based on the provided conditions.
   * @returns {string} The text value.
   */
  const getValueText = () => {
    if (value) {
      if (fieldName) {
        return value[fieldName] + additionalDisplayText;
      }
      return value + additionalDisplayText;
    }
    return placeHolderText;
  };

  const getSelectedData = (list: any[], type: string) => {
    const findData = list.find(
      //@ts-ignore
      (item: any) => item.id === `${type}_${SelectedTime[type]}`,
    );

    if (findData) {
      return findData;
    }
    return {
      id: '',
      name: '',
    };
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {
          width: mainContainerWidth,
          marginVertical: mainContainerMarginVertical,
        },
      ]}>
      {title && (
        <StyledText
          style={[
            {paddingVertical: titlePaddingVertical},
            isDisabled && {opacity: 0.4},
            titleStyle,
          ]}>
          {title}
        </StyledText>
      )}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            marginVertical: inputContainerMarginVertical,
            backgroundColor,
            borderColor: errorText ? 'red' : borderColor,
          },
        ]}
        disabled={isDisabled}
        activeOpacity={0.7}
        onPress={() => {
          Keyboard.dismiss();

          setisOpenDataListModal(true);
        }}>
        <View style={[styles.dropDownTextContainer]}>
          <StyledText
            style={{
              color: value ? valueTextColor : COLORS.placeHolderColor,
              fontSize: fontSize,
              paddingVertical: 5,
            }}>
            {getValueText()}
          </StyledText>
        </View>
        <TouchableOpacity
          style={[isDisabled && {opacity: 0.4}, styles.iconContainer]}
          activeOpacity={0.7}
          disabled={!isDropDownIconAsButton || isLoadingIcon}
          onPress={onPressIcon}>
          {isLoadingIcon ? (
            <ActivityIndicator size={'small'} color={COLORS.primary} />
          ) : (
            <SVGIcon
              icon={dropDownIcon}
              height={dropDownIconSize}
              width={dropDownIconSize}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText}</StyledText>
      ) : null}

      <Modal
        visible={isOpenDataListModal}
        onRequestClose={() => {
          setisOpenDataListModal(false);
        }}
        transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setisOpenDataListModal(false);
          }}
          style={{
            flex: 1,
            backgroundColor: COLORS.transparentDimColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 10,
              padding: 10,
              paddingBottom: 30,
              maxHeight: '60%',
            }}>
            <View
              style={{
                width: '60%',
                maxHeight: '80%',
                flexDirection: 'row',
              }}>
              <ItemSelectionMiniList
                onClose={() => {}}
                maxHeight={'100%'}
                containerWidth={'50%'}
                fieldName={'name'}
                title={'HH'}
                highlightItem={getSelectedData(getHourArray(), 'hours')}
                highlightByFieldname={'id'}
                listData={getHourArray()}
                isFlatlistOnly
                onSelectItem={(item: any) => {
                  if (item.id === `hours_${convertToDoubleDigit(maxHours)}`) {
                    setSelectedTime(pre => ({
                      minutes: '00',
                      hours: item.name,
                    }));
                  } else if (item.id === `hours_00`) {
                    setSelectedTime(pre => ({
                      minutes: '15',
                      hours: item.name,
                    }));
                  } else {
                    setSelectedTime(pre => ({
                      ...pre,
                      hours: item.name,
                    }));
                  }
                }}
              />
              <ItemSelectionMiniList
                onClose={() => {}}
                title={'MM'}
                containerWidth={'50%'}
                maxHeight={'100%'}
                fieldName={'name'}
                highlightItem={getSelectedData(getMinuteArray(), 'minutes')}
                highlightByFieldname={'id'}
                listData={getMinuteArray()}
                isFlatlistOnly
                onSelectItem={(item: any) => {
                  setSelectedTime(pre => ({
                    ...pre,
                    minutes: item.name,
                  }));
                }}
              />
            </View>
            <SubmitButton
              buttonText="Confirm"
              onPress={() => {
                if (onSelectItem) {
                  onSelectItem(`${SelectedTime.hours}:${SelectedTime.minutes}`);
                }
                setisOpenDataListModal(false);
              }}
              paddingVertical={5}
              marginHorizontal={50}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomHourMinutePicker;

const styles = StyleSheet.create({
  mainContainer: {
    marginVertical: 5,
  },
  inputContainer: {
    height: TEXT_INPUT_HEIGHT,
    width: '100%',
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    alignItems: 'center',
  },
  dropDownTextContainer: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  iconContainer: {
    height: '100%',
    // flex: 1,
    paddingRight: 5,
    paddingLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    paddingVertical: 5,
  },
});
