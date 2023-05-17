import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import Nugget from '../HomeScreen/Nugget';
import {
  useInsets,
  useSearchedNuggetsList,
  useToken,
} from '../../../Utilities/StoreData';
import {
  NuggetParentActionsContext,
  useGlobalSearch,
} from '../../../Utilities/Contexts';
import {listNuggetsService} from '../../../Services/ApiService';
import StyledText from '../../../Components/StyledText';
import Loader from '../../../Components/Loader';
import DefaultBackground from '../../../Components/DefaultBackground';
import {htmlDecodeText} from '../../../Utilities/Methods';
import {useDispatch} from 'react-redux';
import {setSearchedNuggetsList} from '../../../Store/Slices/HomeSlice';
import BigList from 'react-native-big-list';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const NuggetsSearch = () => {
  const {searchText, topLayerHeight} = useGlobalSearch();
  const dispatch = useDispatch();
  const [isListLoading, setisListLoading] = useState(false);
  const searchedNuggetsList = useSearchedNuggetsList();
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isMuted, setisMuted] = useState(true);
  const [isRefreshing, setisRefreshing] = useState(false);
  const flatlistRef = useRef(null);
  const token = useToken();
  const insets = useInsets();
  const [viewableItem, setviewableItem] = useState('');
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0)
      setviewableItem(viewableItems.viewableItems[0].item.nugget_id || 0);
  });

  useEffect(() => {
    isMount = true;
    currentPage = 1;
    totalPages = 1;
    return () => {
      dispatch(setSearchedNuggetsList([]));
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

    listNuggetsService(formData)
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
              dispatch(setSearchedNuggetsList(decodedNuggetList));
            } else {
              dispatch(
                setSearchedNuggetsList([
                  ...searchedNuggetsList,
                  ...decodedNuggetList,
                ]),
              );
            }
          } else if (res.data.status === 0) {
            dispatch(setSearchedNuggetsList([]));
          }
        }
      })
      .catch(e => {
        if (isMount) {
          dispatch(setSearchedNuggetsList([]));
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

  const nuggetActions = {
    headerContainerHeight: topLayerHeight,
    isMuted: isMuted,
    isAutoPlay: true,
    setisMuted: setisMuted,
    viewableNuggetItem: viewableItem,
    isFromGlobalSearch: true,
    isEnableADDButton: false,
    isEnableTopInsetsPadding: false,
    textNuggetNumberOfLines: 12,
    mediaHeight: insets.mediaHeight - (topLayerHeight + insets.top),
    isEnableHeaderContainerHeightforTopButtons: false,
    onFinishPlaying: index => {
      if (index < searchedNuggetsList.length - 1) {
        flatlistRef.current.scrollToIndex({
          index: index + 1,
        });
      }
    },
  };

  const renderNuggetItem = useCallback(renderItem, [
    searchedNuggetsList,
    isMuted,
    viewableItem,
    topLayerHeight,
  ]);
  const keyExtractor = useCallback(item => item.nugget_id.toString(), []);
  const getItemLayout = useCallback(
    (_, index) => ({
      length: insets.mediaHeight - (topLayerHeight + insets.top),
      offset: (insets.mediaHeight - (topLayerHeight + insets.top)) * index,
      index,
    }),
    [],
  );

  function renderItem({item, index}) {
    return <Nugget nugget={item} nuggetIndex={index} />;
  }

  const renderFooter = () => {
    return isLoadMore ? (
      <View style={{flex: 1, backgroundColor: COLORS.primary}}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  };

  function renderEmptyComponent() {
    return (
      <View style={[styles.emptyComponent, {height: listContainerHeight}]}>
        <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
  }

  return (
    <NuggetParentActionsContext.Provider value={nuggetActions}>
      <View
        style={styles.mainContainer}
        onLayout={e => {
          setlistContainerHeight(e.nativeEvent.layout.height);
        }}>
        <DefaultBackground />
        {isListLoading ? (
          <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
        ) : (
          <BigList
            ref={flatlistRef}
            showsVerticalScrollIndicator={false}
            data={searchedNuggetsList}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            renderItem={renderNuggetItem}
            pagingEnabled
            refreshControl={
              <RefreshControl
                tintColor={COLORS.secondary}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
            itemHeight={insets.mediaHeight - topLayerHeight}
            ListEmptyComponent={renderEmptyComponent}
            onViewableItemsChanged={onViewRef.current}
            renderFooter={renderFooter}
          />
          // <FlatList
          //   ref={flatlistRef}
          //   showsVerticalScrollIndicator={false}
          //   data={searchedNuggetsList}
          //   keyExtractor={item => item.nugget_id.toString()}
          //   getItemLayout={(_, index) => ({
          // length: insets.mediaHeight - topLayerHeight,
          // offset: (insets.mediaHeight - topLayerHeight) * index,
          // index,
          //   })}
          //   windowSize={20}
          //   renderItem={({item, index}) => (
          //     <Nugget nugget={item} nuggetIndex={index} />
          //   )}
          //   pagingEnabled
          //   decelerationRate={'normal'}
          //   refreshControl={
          //     <RefreshControl
          //       tintColor={COLORS.secondary}
          //       refreshing={isRefreshing}
          //       onRefresh={onRefresh}
          //     />
          //   }
          //   ListEmptyComponent={() => {
          //     return (
          //       <View
          //         style={[
          //           styles.emptyComponent,
          //           {height: listContainerHeight},
          //         ]}>
          //         <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          //           We didn't find any results!
          //         </StyledText>
          //       </View>
          //     );
          //   }}
          //   onEndReachedThreshold={0.5}
          //   onEndReached={onEndReached}
          //   ListFooterComponent={renderFooter}
          //   onViewableItemsChanged={onViewRef.current}
          //   viewabilityConfig={viewConfigRef.current}
          // />
        )}
      </View>
    </NuggetParentActionsContext.Provider>
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
