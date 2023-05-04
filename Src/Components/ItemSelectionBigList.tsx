import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from './HeaderWithBack';
import {BackHeaderProps} from './HeaderWithBack';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import SearchInput, {SearchInputProps} from './SearchInput';
import {getCountylistService} from '../Services/ApiService';

export type ItemSelectionBigListProps = {
  title?: string;
  fieldName?: string;
  onCloseList?: (status: boolean) => void;
  headerProps?: Omit<BackHeaderProps, 'setModal' | 'isModal' | 'title'>;
  listData?: any[];
  isEnableSearchBar?: boolean;
  isAPICall?: boolean;
  apiName?: 'country';
  itemContainerStyle?: ViewStyle;
  searchInputProps?: Omit<SearchInputProps, 'onSearch'>;
  onSelectItem: (item: any) => void;
};
var isMount = true;
const ItemSelectionBigList = ({
  title = 'Select Data',
  headerProps,
  onCloseList,
  fieldName,
  listData = [],
  searchInputProps,
  onSelectItem,
  isAPICall = false,
  apiName,
  isEnableSearchBar = true,
  itemContainerStyle,
}: ItemSelectionBigListProps) => {
  const [searchText, setsearchText] = useState('');
  const [dataList, setdataList] = useState([...listData]);
  const [isLoading, setisLoading] = useState(
    isAPICall && apiName ? true : false,
  );

  useEffect(() => {
    isMount = true;
    if (isAPICall && apiName) {
      initialAPICall();
    }

    return () => {
      isMount = false;
    };
  }, []);

  function initialAPICall() {
    switch (apiName) {
      case 'country':
        countryAPICall();
    }
  }

  function countryAPICall() {
    getCountylistService()
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            setdataList(res.data.country_list);
          } else if (res.data.status === 0) {
            setdataList([]);
          }
        }
      })
      .catch(e => {
        setdataList([]);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

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
        return [...dataList].filter(item =>
          item[fieldName]
            .toLowerCase()
            .includes(searchText.toLowerCase().trim()),
        );
      }
      return [...dataList].filter(item =>
        item.toLowerCase().includes(searchText.toLowerCase().trim()),
      );
    }
    return [...dataList];
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
            {isLoading ? (
              <ActivityIndicator color={COLORS.primary} size="large" />
            ) : (
              <StyledText>No data found</StyledText>
            )}
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
