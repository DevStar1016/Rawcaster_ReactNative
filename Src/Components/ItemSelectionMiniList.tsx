import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {WINDOW_HEIGHT} from '../Utilities/Constants';
import SVGIcon from './SVGIcon';

type Props = {
  title?: string;
  listData?: any[];
  fieldName?: string;
  onClose: () => void;
};

type RenderItemProps = {
  item: any;
  index: number;
};

const ItemSelectionMiniList = ({
  title = 'Select Item',
  listData = [],
  fieldName = '',
  onClose,
}: Props) => {
  const Divider = ({width = '100%', color = COLORS.borderColor}) => {
    return (
      <View style={[styles.divider, {width: width, backgroundColor: color}]} />
    );
  };

  const renderItem = ({item}: RenderItemProps) => {
    return (
      <TouchableOpacity style={styles.itemContainer}>
        <StyledText>{fieldName ? item[fieldName] : item}</StyledText>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={styles.mainContainer}
      activeOpacity={1}
      onPress={onClose}>
      <TouchableOpacity style={styles.subContainer} activeOpacity={1}>
        <View style={styles.titleContainer}>
          <View style={{width: '15%'}} />
          <View style={{width: '50%', alignItems: 'center'}}>
            <StyledText>{title}</StyledText>
          </View>
          <View style={{width: '15%', alignItems: 'flex-end'}}>
            <TouchableOpacity
              style={{padding: 5}}
              activeOpacity={0.7}
              onPress={onClose}>
              <SVGIcon icon="close" color={COLORS.black} />
            </TouchableOpacity>
          </View>
        </View>
        <Divider />
        <FlatList
          data={listData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => {
            return <Divider width="70%" color={COLORS.secondary} />;
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
    width: '90%',
    maxHeight: WINDOW_HEIGHT / 2 + 100,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.borderColor,
    alignSelf: 'center',
  },
  itemContainer: {
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
  },
});
