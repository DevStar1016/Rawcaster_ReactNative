import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import BigList from 'react-native-big-list';
import {
  addNuggetViewService,
  listNuggetsService,
} from '../../../Services/ApiService';
import {
  useInsets,
  useIsHomeNuggetsLoading,
  useNuggetsList,
  useNuggetType,
  useToken,
} from '../../../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import Nugget from './Nugget';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import GradientButton from '../../../Components/GradientButton';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import {
  setIsHomeNuggetsLoading,
  setNuggetFilterType,
  setNuggetsList,
} from '../../../Store/Slices/HomeSlice';
import Loader from '../../../Components/Loader';
import {setIsBottomTabBarAbsolute} from '../../../Store/Slices/UtilitySlice';
import {htmlDecodeText} from '../../../Utilities/Methods';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import DefaultBackground from '../../../Components/DefaultBackground';
import {NuggetParentActionsContext} from '../../../Utilities/Contexts';
var currentPage = 1;
var totalPages = 1;
var controller = undefined;
const Dashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const insets = useInsets();
  const isHomeNuggetsLoading = useIsHomeNuggetsLoading();
  const token = useToken();
  const flatlistRef = useRef(null);
  const nuggetType = useNuggetType();
  const nuggetsList = useNuggetsList();
  const [viewableItem, setviewableItem] = useState({
    nugget_id: '',
    viewed: false,
  });
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isMuted, setisMuted] = useState(true);
  const [headerContainerHeight, setheaderContainerHeight] = useState(0);
  const [refreshing, setrefreshing] = useState(false);
  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 500,
    viewAreaCoveragePercentThreshold: 70,
  });

  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0) {
      setviewableItem({
        nugget_id: viewableItems.viewableItems[0].item.nugget_id || 0,
        viewed: viewableItems.viewableItems[0].item.viewed,
      });
    }
  });
  const [selectedFilterTab, setselectedFilterTab] = useState(0); // 1 - Influencing, 0 - For You

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    dispatch(setIsBottomTabBarAbsolute(true));

    return () => {
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (token && viewableItem.nugget_id && !viewableItem.viewed) {
      onViewNugget(viewableItem.nugget_id);
    }
  }, [viewableItem.nugget_id]);

  useEffect(() => {
    if (isFocused) {
      AvoidSoftInput.setAdjustPan();
    }
  }, [isFocused]);

  useEffect(() => {
    if (flatlistRef.current && (nuggetType === 1 || nuggetType === 2)) {
      scrollNuggetsListToTop();
    }
  }, [nuggetType]);

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    dispatch(setIsHomeNuggetsLoading(true));
    dispatch(setNuggetsList([]));
    listNuggetsAPICall(1);
  }, [token, selectedFilterTab]);

  function scrollNuggetsListToTop() {
    flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  }

  function listNuggetsAPICall(pageNumber = 1) {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();

    const formData = new FormData();
    formData.append('token', token ?? 'RAWCAST');
    formData.append('page_number', pageNumber);
    formData.append('nugget_type', nuggetType);
    formData.append('filter_type', selectedFilterTab);
    listNuggetsService(formData, controller.signal)
      .then(res => {
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
            dispatch(setNuggetsList(decodedNuggetList));
          } else {
            dispatch(setNuggetsList([...nuggetsList, ...decodedNuggetList]));
          }
        }
        dispatch(setIsHomeNuggetsLoading(false));
      })
      .catch(e => {
        console.log(e, 'ERRORIP');
        if (!e.message.includes('canceled')) {
          dispatch(setIsHomeNuggetsLoading(false));
        }
      })
      .finally(() => {
        setrefreshing(false);
        setisLoadMore(false);
      });
  }

  function onViewNugget(nuggetId) {
    let tempNuggetsList = [...nuggetsList];

    tempNuggetsList = tempNuggetsList.map(item => {
      if (item.nugget_id === nuggetId && !item.viewed) {
        return {
          ...item,
          viewed: 1,
          total_views: item.total_views + 1,
        };
      }
      return {
        ...item,
      };
    });

    dispatch(setNuggetsList(tempNuggetsList));
    handleViewNugget(nuggetId);
  }

  const resetViewabilityItem = () => {
    setviewableItem({
      nugget_id: '',
      viewed: false,
    });
  };

  function handleViewNugget(nuggetId) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nuggetId);
    addNuggetViewService(formData)
      .then(res => {})
      .catch(e => {});
  }

  function onRefresh() {
    currentPage = 1;
    totalPages = 1;
    resetViewabilityItem();
    listNuggetsAPICall(1);
  }

  function onEndReached() {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      setisLoadMore(true);
      listNuggetsAPICall(currentPage);
    }
  }

  const keyExtractor = useCallback(item => item.nugget_id.toString(), []);
  const getItemLayout = useCallback(
    (_, index) => ({
      length: insets.mediaHeight,
      offset: insets.mediaHeight * index,
      index,
    }),
    [],
  );

  const renderNuggetItem = useCallback(renderItem, [
    nuggetsList,
    isMuted,
    viewableItem,
    headerContainerHeight,
  ]);

  const nuggetActions = {
    headerContainerHeight: headerContainerHeight,
    isMuted: isMuted,
    setisMuted: setisMuted,
    isAutoPlay: true,
    scrollNuggetsListToTop: scrollNuggetsListToTop,
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: viewableItem.nugget_id,
    isFromGlobalSearch: false,
    isEnableADDButton: true,
    isEnableTopInsetsPadding: true,
    textNuggetNumberOfLines: 15,
    isEnableHeaderContainerHeightforTopButtons: true,
    onFinishPlaying: index => {
      if (index < nuggetsList.length - 1) {
        flatlistRef.current.scrollToIndex({
          index: index + 1,
        });
      }
    },
  };

  function renderItem({item, index}) {
    return <Nugget nugget={item} nuggetIndex={index} />;
  }

  function renderFooter() {
    return isLoadMore ? (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.primary,
        }}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  }

  return (
    <NuggetParentActionsContext.Provider value={nuggetActions}>
      <View style={styles.mainContainer}>
        <DefaultBackground
          centerText={
            nuggetsList && nuggetsList.length > 0
              ? 'Loading...'
              : 'No data found'
          }
          isEnableLoading={nuggetsList && nuggetsList.length > 0}
        />
        <View
          onLayout={e => {
            setheaderContainerHeight(e.nativeEvent.layout.height);
          }}
          style={{
            position: 'absolute',
            top: insets.top ? insets.top : StatusBar.currentHeight,
            left: 0,
            right: 0,
            zIndex: 1,
          }}>
          <CustomHomeHeader
            bgColor={COLORS.transparent}
            isEnableNuggetFilterTabs
            selectedTab={selectedFilterTab === 1 ? 'first' : 'second'}
            onPressFirstFilterTab={() => {
              if (selectedFilterTab !== 1) {
                setselectedFilterTab(1);
                dispatch(setNuggetFilterType(1));
                resetViewabilityItem();
              }
            }}
            onPressSecondFilterTab={() => {
              if (selectedFilterTab !== 0) {
                setselectedFilterTab(0);
                dispatch(setNuggetFilterType(0));
                resetViewabilityItem();
              }
            }}
          />

          {!token && (
            <GradientButton
              icon="app_logo_white"
              rightIcon="right_arrow_white"
              buttonText="Log in/Sign up to explore Rawcaster"
              marginHorizontal={15}
              onPress={() => {
                navigation.navigate('Login');
              }}
              marginVertical={10}
              containerPadding={7}
              buttonTextStyle={{fontSize: 14, marginLeft: 10, marginRight: 10}}
              leftIcon={'app_logo_white'}
            />
          )}
        </View>
        {
          isHomeNuggetsLoading ? (
            <Loader
              loaderText="Fetching Nuggets"
              isEnableDefaultLoaderBackground={true}
            />
          ) : (
            <BigList
              ref={flatlistRef}
              showsVerticalScrollIndicator={false}
              data={nuggetsList}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              renderItem={renderNuggetItem}
              pagingEnabled
              refreshControl={
                <RefreshControl
                  tintColor={COLORS.secondary}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              onEndReachedThreshold={0.5}
              onEndReached={onEndReached}
              itemHeight={insets.mediaHeight}
              footerHeight={50}
              onViewableItemsChanged={onViewRef.current}
              renderFooter={renderFooter}
            />
          )

          // <FlatList
          //   ref={flatlistRef}
          //   showsVerticalScrollIndicator={false}
          //   data={nuggetsList}
          //   horizontal={false}
          //   keyExtractor={keyExtractor}
          //   getItemLayout={getItemLayout}
          //   windowSize={8}
          //   maxToRenderPerBatch={5}
          //   renderItem={renderNuggetItem}
          //   pagingEnabled
          //   // decelerationRate={'fast'}
          //   refreshControl={
          // <RefreshControl
          //   tintColor={COLORS.secondary}
          //   refreshing={refreshing}
          //   onRefresh={onRefresh}
          // />
          //   }
          //   onEndReachedThreshold={0.5}
          //   onEndReached={onEndReached}
          //   ListFooterComponent={renderFooter}
          //   onViewableItemsChanged={onViewRef.current}
          //   viewabilityConfig={viewConfigRef.current}
          // />
        }
      </View>
    </NuggetParentActionsContext.Provider>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
