import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import SVGIcon from './SVGIcon';

type Props = {
  title?: string;
  listData?: any[];
  fieldName?: string;
  containerWidth?: number | string;
  maxHeight?: number | string;
  onSelectItem?: (item: any) => void;
  onClose: () => void;
  isEnableCloseIcon?: boolean;
};

type RenderItemProps = {
  item: any;
  index: number;
};

const ItemSelectionMiniList = ({
  title = '',
  listData = [],
  fieldName = '',
  containerWidth = '60%',
  onClose,
  maxHeight = '50%',
  onSelectItem,
  isEnableCloseIcon = false,
}: Props) => {
  const ItemSeperator = () => {
    return <View style={styles.divider} />;
  };

  const renderItem = ({item}: RenderItemProps) => {
    return (
      <View>
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            if (onSelectItem) {
              onSelectItem(item);
            }
          }}>
          <StyledText style={{paddingVertical: 5}}>
            {fieldName ? item[fieldName] : item}
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.mainContainer}
      activeOpacity={1}
      onPress={onClose}>
      <TouchableOpacity
        style={[styles.subContainer, {width: containerWidth, maxHeight}]}
        activeOpacity={1}>
        {title ? (
          <>
            <View style={styles.titleContainer}>
              <View style={{width: '15%'}} />
              <View style={{width: '50%', alignItems: 'center'}}>
                <StyledText style={{paddingVertical: 5}}>{title}</StyledText>
              </View>
              <View style={{width: '15%', alignItems: 'flex-end'}}>
                {isEnableCloseIcon && (
                  <TouchableOpacity
                    style={{padding: 5}}
                    activeOpacity={0.7}
                    onPress={onClose}>
                    <SVGIcon icon="close_rounded" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {/* <Divider /> */}
          </>
        ) : null}
        {title ? (
          <View style={{height: 1, backgroundColor: COLORS.borderColor}} />
        ) : null}
        <FlatList
          data={listData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContentContainer}
          ItemSeparatorComponent={() => {
            return <ItemSeperator />;
          }}
          showsVerticalScrollIndicator={false}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ItemSelectionMiniList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    width: '60%',
    maxHeight: '60%',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  divider: {
    height: 1,
    // width: '100%',
    // borderWidth: 0,
    opacity: 0.2,
    backgroundColor: COLORS.transparentDimColor,
    // borderColor: COLORS.grey,
    marginTop: 5,
  },
  itemContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
