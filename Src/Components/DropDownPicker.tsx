import {
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

type Props = {
  title?: string;
  value?: string | number | undefined | null;
  dropDownIconSize?: number;
  dataList?: number[] | string[];
  placeHolderText?: string;
  isInsideList?: boolean;
  isDisabled?: boolean;
  mainContainerWidth?: number | string;
  onPress?: () => void;
  onSelectItem?: (item: any) => void;
};

const DropDownPicker = ({
  title,
  value = '',
  dropDownIconSize = 13,
  mainContainerWidth = '100%',
  placeHolderText = 'Select Data',
  dataList = [],
  isInsideList = true,
  onPress,
  isDisabled = false,
  onSelectItem,
}: Props) => {
  const [isOpenDataListModal, setisOpenDataListModal] = useState(false);

  return (
    <View style={[styles.mainContainer, {width: mainContainerWidth}]}>
      {title && <StyledText>{title}</StyledText>}
      <TouchableOpacity
        style={styles.inputContainer}
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
              color: value ? COLORS.black : COLORS.dimColor,
              fontSize: 14,
            }}>
            {value ? value : placeHolderText}
          </StyledText>
        </View>
        <View style={styles.iconContainer}>
          <SVGIcon
            icon={'down_arrow'}
            height={dropDownIconSize}
            width={dropDownIconSize}
          />
        </View>
      </TouchableOpacity>
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
    height: 55,
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
    paddingRight: 10,
    paddingLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
