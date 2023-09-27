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
import React, {useState} from 'react';
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
  titleStyle?: TextStyle;
  isDropDownIconAsButton?: boolean;
  onPressIcon?: () => void;
  isLoadingIcon?: boolean;
  listType?: 'mini' | 'large';
  fontSize?: number;
  backgroundColor?: string;
  borderColor?: string;
  valueTextColor?: string;
  bigListProps?: Omit<
    ItemSelectionBigListProps,
    'fieldName' | 'onSelectItem' | 'listData' | 'title' | 'onCloseList'
  >;
  additionalDisplayText?: string;
};

const DropDownPicker = ({
  title,
  value,
  dateValue,
  errorText = '',
  dropDownIconSize = 13,
  mainContainerWidth = '100%',
  placeHolderText = 'Select Data',
  dataList = [],
  listType = 'mini',
  isInsideList = true,
  onPress,
  isDisabled = false,
  onSelectItem,
  fieldName,
  isDateTime = false,
  mainContainerMarginVertical = 5,
  titlePaddingVertical = 5,
  inputContainerMarginVertical = 5,
  listTitle = title,
  isDropDownIconAsButton = false,
  dropDownIcon = 'down_arrow',
  onPressIcon,
  isLoadingIcon,
  fontSize = 14,
  titleStyle,
  valueTextColor = COLORS.black,
  backgroundColor = COLORS.white,
  borderColor = COLORS.borderColor,
  additionalDisplayText = '',
  datePickerProps,
  bigListProps,
}: Props) => {
  const [isOpenDataListModal, setisOpenDataListModal] = useState(false);
  const [isOpenDatePicker, setisOpenDatePicker] = useState(false);

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
          if (isInsideList) {
            if (isDateTime) {
              setisOpenDatePicker(true);
            } else {
              setisOpenDataListModal(true);
            }
          } else {
            if (onPress) {
              onPress();
            }
          }
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
      {listType === 'mini' && (
        <Modal
          visible={isOpenDataListModal}
          onRequestClose={() => {
            setisOpenDataListModal(false);
          }}
          transparent
          style={{backgroundColor: COLORS.transparentDimColor}}>
          <SafeAreaView
            style={{flex: 1, backgroundColor: COLORS.transparentDimColor}}>
            <ItemSelectionMiniList
              onClose={() => {
                setisOpenDataListModal(false);
              }}
              fieldName={fieldName}
              title={listTitle}
              listData={dataList}
              onSelectItem={(item: any) => {
                setisOpenDataListModal(false);
                if (onSelectItem) {
                  onSelectItem(item);
                }
              }}
            />
          </SafeAreaView>
        </Modal>
      )}

      {listType === 'large' && (
        <Modal
          style={{backgroundColor: COLORS.primary}}
          visible={isOpenDataListModal}
          onRequestClose={() => {
            setisOpenDataListModal(false);
          }}>
          <SafeAreaView style={{flex: 1, backgroundColor: COLORS.primary}}>
            <ItemSelectionBigList
              fieldName={fieldName}
              onSelectItem={(item: any) => {
                setisOpenDataListModal(false);
                if (onSelectItem) {
                  onSelectItem(item);
                }
              }}
              listData={dataList}
              title={listTitle}
              onCloseList={() => {
                setisOpenDataListModal(false);
              }}
              {...bigListProps}
            />
          </SafeAreaView>
        </Modal>
      )}

      {isOpenDatePicker && (
        <DateTimePickerModal
          isVisible={isOpenDatePicker}
          mode="date"
          date={dateValue ? new Date(dateValue) : new Date()}
          minimumDate={new Date()}
          {...datePickerProps}
          onConfirm={date => {
            setisOpenDatePicker(false);
            if (onSelectItem) {
              onSelectItem(date);
            }
          }}
          onCancel={() => {
            setisOpenDatePicker(false);
          }}
        />
      )}
    </View>
  );
};

export default DropDownPicker;

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
