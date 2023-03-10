import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import Nugget from '../HomeScreen/Nugget';
import {useInsets, useToken} from '../../../Utilities/StoreData';
import {useGlobalSearch} from '../../../Utilities/Contexts';
import {globalSearchNuggetsService} from '../../../Services/ApiService';
import StyledText from '../../../Components/StyledText';
import Loader from '../../../Components/Loader';
import DefaultBackground from '../../../Components/DefaultBackground';
import {htmlDecodeText} from '../../../Utilities/Methods';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const NuggetsSearch = () => {
  const {searchText, setisActionLoading, topLayerHeight} = useGlobalSearch();
  const [isListLoading, setisListLoading] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const flatlistRef = useRef(null);
  const token = useToken();
  const insets = useInsets();
  const [viewableItem, setviewableItem] = useState('');
  const [nuggetsList, setnuggetsList] = useState([]);
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const viewConfigRef = useRef({viewAreaCoveragePercentThreshold: 80});
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.nugget_id || 0);
  });

  useEffect(() => {
    isMount = true;
    currentPage = 1;
    totalPages = 1;
    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (searchText !== null) {
      setisListLoading(true);
      nuggetsSearchAPICall(1);
    }
  }, [searchText]);

  const nuggetsSearchAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_key', searchText);
    formData.append('page_number', pageNumber);

    globalSearchNuggetsService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedNuggetList = [...res.data.nuggets_list].map(item => {
              return {
                ...item,
                content: htmlDecodeText(item.content),
                original_user_name: htmlDecodeText(item.original_user_name),
                user_name: htmlDecodeText(item.user_name),
              };
            });

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setnuggetsList(decodedNuggetList);
            } else {
              setnuggetsList(preList => [...preList, ...decodedNuggetList]);
            }
          } else if (res.data.status === 0) {
            setnuggetsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setnuggetsList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisRefreshing(false);
          setisListLoading(false);
        }
      });
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
      nuggetsSearchAPICall(1);
    }
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        nuggetsSearchAPICall(currentPage);
      }
    }
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <View style={{flex: 1, backgroundColor: COLORS.primary}}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  };

  return (
    <View
      style={styles.mainContainer}
      onLayout={e => {
        setlistContainerHeight(e.nativeEvent.layout.height);
      }}>
      <DefaultBackground />
      {isListLoading ? (
        <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
      ) : (
        <FlatList
          ref={flatlistRef}
          showsVerticalScrollIndicator={false}
          data={nuggetsList}
          horizontal={false}
          keyExtractor={item => item.nugget_id.toString()}
          getItemLayout={(_, index) => ({
            length: insets.mediaHeight - topLayerHeight,
            offset: (insets.mediaHeight - topLayerHeight) * index,
            index,
          })}
          windowSize={20}
          renderItem={({item, index}) => (
            <Nugget
              nugget={item}
              headerContainerHeight={topLayerHeight}
              isEnableADDButton={false}
              isEnableTopInsetsPadding={false}
              textNuggetNumberOfLines={12}
              mediaHeight={insets.mediaHeight - topLayerHeight}
              rootFlatListRef={flatlistRef}
              nuggetIndex={index}
              viewableNuggetItem={viewableItem}
              onFinishPlaying={index => {
                if (index < nuggetsList.length - 1) {
                  flatlistRef.current.scrollToIndex({
                    index: index + 1,
                  });
                }
              }}
            />
          )}
          pagingEnabled
          decelerationRate={'normal'}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={() => {
            return (
              <View
                style={[styles.emptyComponent, {height: listContainerHeight}]}>
                <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
                  We didn't find any results!
                </StyledText>
              </View>
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={onEndReached}
          ListFooterComponent={renderFooter}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
      )}
    </View>
  );
};

export default NuggetsSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
