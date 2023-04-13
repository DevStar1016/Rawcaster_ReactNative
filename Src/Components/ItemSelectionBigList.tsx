import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useState} from 'react';
import HeaderWithBack from './HeaderWithBack';
import {BackHeaderProps} from './HeaderWithBack';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import SearchInput, {SearchInputProps} from './SearchInput';

export type ItemSelectionBigListProps = {
  title?: string;
  fieldName?: string;
  onCloseList?: (status: boolean) => void;
  headerProps?: Omit<BackHeaderProps, 'setModal' | 'isModal' | 'title'>;
  listData?: any[];
  isEnableSearchBar?: boolean;
  itemContainerStyle?: ViewStyle;
  searchInputProps?: Omit<SearchInputProps, 'onSearch'>;
  onSelectItem: (item: any) => void;
};

const ItemSelectionBigList = ({
  title = 'Select Data',
  headerProps,
  onCloseList,
  fieldName,
  listData = [],
  searchInputProps,
  onSelectItem,
  isEnableSearchBar = true,
  itemContainerStyle,
}: ItemSelectionBigListProps) => {
  const [searchText, setsearchText] = useState('');

  function getItemText(item: any) {
    if (fieldName) {
      return item[fieldName];
    }
    return item;
  }

  function keyExtractor(item: any, index: number) {
    if (fieldName) {
      return item[fieldName].toString();
    }
    return index.toString();
  }

  function renderItem({item}: any) {
    return (
      <TouchableOpacity
        style={[styles.itemContainer, itemContainerStyle]}
        activeOpacity={0.8}
        onPress={() => {
          onSelectItem(item);
        }}>
        <StyledText>{getItemText(item)}</StyledText>
      </TouchableOpacity>
    );
  }

  function getList() {
    if (searchText && searchText.trim()) {
      if (fieldName) {
        return [...listData].filter(item =>
          item[fieldName]
            .toLowerCase()
            .includes(searchText.toLowerCase().trim()),
        );
      }
      return [...listData].filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase().trim()),
      );
    }
    return [...listData];
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack
        title={title}
        isModal
        setModal={onCloseList}
        {...headerProps}
      />
      {isEnableSearchBar && (
        <SearchInput
          onSearch={setsearchText}
          searchWhenClickedButton={false}
          marginVertical={10}
          marginHorizontal={10}
          searchButtonColor={COLORS.secondary}
          {...searchInputProps}
        />
      )}

      <View style={styles.listContainer}>
        {getList().length > 0 ? (
          <FlatList
            data={getList()}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 10,
              paddingTop: isEnableSearchBar ? 0 : 10,
            }}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => {
              return <View style={{height: 10}} />;
            }}
          />
        ) : (
          <View style={styles.emptyDataContainer}>
            <StyledText>No data found</StyledText>
          </View>
        )}
      </View>
    </View>
  );
};

export default ItemSelectionBigList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 10,
  },
  emptyDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
