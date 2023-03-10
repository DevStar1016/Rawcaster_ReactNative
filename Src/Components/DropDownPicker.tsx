import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import ItemSelectionMiniList from './ItemSelectionMiniList';
import {TEXT_INPUT_HEIGHT} from '../Utilities/Constants';
import {IconType} from '../Utilities/Icons';

type Props = {
  title?: string;
  value?: any;
  dropDownIconSize?: number;
  dataList?: number[] | string[];
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
  errorText?: string;
  dropDownIcon?: IconType;
  isDropDownIconAsButton?: boolean;
  onPressIcon?: () => void;
  isLoadingIcon?: boolean;
  fontSize?: number;
  backgroundColor?: string;
  borderColor?: string;
  valueTextColor?: string;
  additionalDisplayText?: string;
};

const DropDownPicker = ({
  title,
  value,
  errorText = '',
  dropDownIconSize = 13,
  mainContainerWidth = '100%',
  placeHolderText = 'Select Data',
  dataList = [],
  isInsideList = true,
  onPress,
  isDisabled = false,
  onSelectItem,
  fieldName,
  mainContainerMarginVertical = 5,
  titlePaddingVertical = 5,
  inputContainerMarginVertical = 5,
  listTitle = title,
  isDropDownIconAsButton = false,
  dropDownIcon = 'down_arrow',
  onPressIcon,
  isLoadingIcon,
  fontSize = 14,
  valueTextColor = COLORS.black,
  backgroundColor = COLORS.white,
  borderColor = COLORS.borderColor,
  additionalDisplayText = '',
}: Props) => {
  const [isOpenDataListModal, setisOpenDataListModal] = useState(false);

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
        <StyledText style={{paddingVertical: titlePaddingVertical}}>
          {title}
        </StyledText>
      )}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            marginVertical: inputContainerMarginVertical,
            backgroundColor,
            borderColor,
          },
        ]}
        disabled={isDisabled}
        activeOpacity={0.7}
        onPress={() => {
          if (isInsideList) {
            setisOpenDataListModal(true);
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
          style={styles.iconContainer}
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
