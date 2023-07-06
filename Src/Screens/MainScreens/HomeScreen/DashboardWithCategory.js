import {
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import BigList from 'react-native-big-list';
import {addNuggetViewService} from '../../../Services/ApiService';
import {
  useBlockedUserIds,
  useDeletedNuggetsIds,
  useEditedNuggetsList,
  useFollowingUsersList,
  useInsets,
  useIsNuggetsLoading,
  useNuggetType,
  useNuggetsList,
  useNuggetsListTotalPages,
  useProfile,
  useToken,
  useTranslatedNuggetsList,
} from '../../../Utilities/StoreData';
import {useDispatch} from 'react-redux';
import Nugget from './Nugget';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import GradientButton from '../../../Components/GradientButton';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';

import Loader from '../../../Components/Loader';
import {setIsBottomTabBarAbsolute} from '../../../Store/Slices/UtilitySlice';
import {getNuggetsReduxStoreDataFormate} from '../../../Utilities/Methods';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import DefaultBackground from '../../../Components/DefaultBackground';
import {
  NuggetParentActionsContext,
  useDashboardProfile,
  useDashboardTopTabCategories,
} from '../../../Utilities/Contexts';
import {getListNuggets} from '../../../Store/ThunkAPIServices';
import {
  resetNuggetsTotalPages,
  setNuggetsList,
  setNuggetsLoading,
} from '../../../Store/Slices/NuggetsListSlice';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

var currentPage = 1;
const DashboardWithCategory = ({route}) => {
  let controller = undefined;
  const navigation = useNavigation();
  const {filterType, categoryType, categoryName} = route.params ?? {};
  const {setfocusedNuggetUserId} = useDashboardProfile() ?? {};
  const profile = useProfile();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const insets = useInsets();
  const editedNuggetsList = useEditedNuggetsList();
  const translatedNuggetsList = useTranslatedNuggetsList();
  const deletedNuggetsIds = useDeletedNuggetsIds();
  const blockedUserIds = useBlockedUserIds();
  const followingUsersList = useFollowingUsersList();
  const {headerContainerHeight} = useDashboardTopTabCategories() ?? {};
  const [headerHeight, setheaderHeight] = useState(0);
  const isNuggetsLoading = useIsNuggetsLoading(categoryName ?? 'forYou');
  const nuggetsList = useNuggetsList(categoryName ?? 'forYou');
  const totalPages = useNuggetsListTotalPages(categoryName ?? 'forYou');
  const token = useToken();
  const flatlistRef = useRef(null);
  const nuggetType = useNuggetType();
  const [viewableItem, setviewableItem] = useState({
    nugget_id: '',
    viewed: false,
  });
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isMuted, setisMuted] = useState(true);
  const [refreshing, setrefreshing] = useState(false);
  const [isReadMuted, setisReadMuted] = useState(false);
  const audioPlayerRef = useRef(new AudioRecorderPlayer());
  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 500,
    viewAreaCoveragePercentThreshold: 70,
  });

  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0) {
      const selectedNuggetUserId = viewableItems.viewableItems[0].item.user_id;
      if (
        setfocusedNuggetUserId &&
        token &&
        profile &&
        profile.user_id !== selectedNuggetUserId
      ) {
        setfocusedNuggetUserId(selectedNuggetUserId);
      } else {
        if (setfocusedNuggetUserId) {
          setfocusedNuggetUserId(null);
        }
      }
      setviewableItem({
        nugget_id: viewableItems?.viewableItems[0]?.item.nugget_id || 0,
        viewed: viewableItems?.viewableItems[0]?.item.viewed,
      });
    }
  });
  const nuggetContentController = useRef(null);

  useEffect(() => {
    dispatch(setIsBottomTabBarAbsolute(true));

    return () => {
      currentPage = 1;
      dispatch(resetNuggetsTotalPages(categoryName));
      if (controller) {
        controller.abort();
      }
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
      if (nuggetContentController.current) {
        nuggetContentController.current.abort();
      }
      handleStopAudio();
    }
  }, [isFocused]);

  useEffect(() => {
    if (flatlistRef.current && (nuggetType === 1 || nuggetType === 2)) {
      scrollNuggetsListToTop();
    }
  }, [nuggetType]);

  useEffect(() => {
    if (nuggetType === 1 || nuggetType === 2) {
      currentPage = 1;
      dispatch(resetNuggetsTotalPages(categoryName));
      dispatch(setNuggetsLoading({categoryName, status: true}));
      dispatch(
        setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])),
      );
      listNuggetsAPICall(1);
    }
  }, [token, nuggetType]);

  useEffect(() => {
    if (
      currentPage === 1 &&
      !viewableItem.nugget_id &&
      nuggetsList?.length > 0 &&
      isFocused &&
      token &&
      profile
    ) {
      if (nuggetsList[0]?.user_id !== profile.user_id) {
        setfocusedNuggetUserId(nuggetsList[0]?.user_id);
      } else {
        setfocusedNuggetUserId(null);
      }
    }
  }, [nuggetsList, isFocused]);

  function getHeaderHeight() {
    return headerContainerHeight ?? headerHeight;
  }

  function scrollNuggetsListToTop() {
    flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  }

  function listNuggetsAPICall(pageNumber = 1) {
    if (controller) {
      controller.abort();
    }

    controller = new AbortController();
    dispatch(
      getListNuggets({
        categoryName:
          categoryName ?? (filterType === 1 ? 'influencing' : 'forYou'),
        categoryType,
        nuggetType,
        filterType: filterType ?? 0,
        pageNumber,
        token: token ?? 'RAWCAST',
        signal: controller.signal,
      }),
    );
  }

  function onViewNugget(nuggetId) {
    let tempNuggetsList = [...getNuggetsList()];

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
    // dispatch(setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])));
    dispatch(
      setNuggetsList(
        getNuggetsReduxStoreDataFormate(categoryName, tempNuggetsList),
      ),
    );
    handleViewNugget(nuggetId);
  }

  const resetViewabilityItem = () => {
    setviewableItem({
      nugget_id: '',
      viewed: false,
    });
  };

  const handlePlayAudio = async url => {
    handleStopAudio();
    try {
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition) === 0) {
          setisReadMuted(true);
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      setisReadMuted(false);
    }
  };

  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      setisReadMuted(false);
    }
  };

  function handleViewNugget(nuggetId) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', JSON.stringify([nuggetId]));
    addNuggetViewService(formData)
      .then(res => {})
      .catch(e => {
        console.log(e, 'Nugget VIEW ERRORRRR');
      });
  }

  function getNuggetsList() {
    let tempNuggetsList = [...nuggetsList];

    if (blockedUserIds && blockedUserIds.length > 0) {
      tempNuggetsList = [...tempNuggetsList].filter(
        item => !blockedUserIds.includes(item.user_id),
      );
    }

    if (deletedNuggetsIds && deletedNuggetsIds.length > 0) {
      tempNuggetsList = [...tempNuggetsList].filter(
        item => !deletedNuggetsIds.includes(item.nugget_id),
      );
    }
    if (editedNuggetsList && editedNuggetsList.length > 0) {
      tempNuggetsList = [...tempNuggetsList].reduce((resultList, item) => {
        let tempEditedItem = [...editedNuggetsList].find(
          subItem => subItem.nugget_id === item.nugget_id,
        );
        if (tempEditedItem) {
          resultList.push(tempEditedItem);
        } else {
          resultList.push(item);
        }

        return [...resultList];
      }, []);
    }
    if (translatedNuggetsList && translatedNuggetsList.length > 0) {
      tempNuggetsList = [...tempNuggetsList].reduce((resultList, item) => {
        let tempTranslatedItem = [...translatedNuggetsList].find(
          subItem => subItem.nugget_id === item.nugget_id,
        );
        if (tempTranslatedItem) {
          resultList.push({
            ...item,
            translated_content: tempTranslatedItem.translated_content,
          });
        } else {
          resultList.push(item);
        }

        return [...resultList];
      }, []);
    }
    return tempNuggetsList;
  }

  function onRefresh() {
    currentPage = 1;
    dispatch(resetNuggetsTotalPages(categoryName));
    dispatch(setNuggetsLoading({categoryName, status: true}));
    dispatch(setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])));
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
    editedNuggetsList,
    deletedNuggetsIds,
    followingUsersList,
    isMuted,
    viewableItem,
    getHeaderHeight(),
  ]);

  const nuggetActions = {
    headerContainerHeight: getHeaderHeight(),
    isMuted: isMuted,
    isFrom: 'dashboard',
    dashboardFocused: isFocused,
    setisMuted: setisMuted,
    categoryName: categoryName ?? 'forYou',
    isAutoPlay: true,
    scrollNuggetsListToTop: scrollNuggetsListToTop,
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: viewableItem.nugget_id,
    isFromGlobalSearch: false,
    isEnableADDButton: true,
    isEnableTopInsetsPadding: true,
    textNuggetNumberOfLines: 15,
    isEnableHeaderContainerHeightforTopButtons: true,
    nuggetContentController: nuggetContentController,
    isReadMuted: isReadMuted,
    handlePlayAudio: handlePlayAudio,
    handleStopAudio: handleStopAudio,
    onFinishPlaying: index => {
      if (index < getNuggetsList().length - 1) {
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
            getNuggetsList() && getNuggetsList().length > 0
              ? 'Loading...'
              : 'No data found'
          }
          isEnableLoading={getNuggetsList() && getNuggetsList().length > 0}
        />
        {!token && (
          <View
            onLayout={e => {
              setheaderHeight(e.nativeEvent.layout.height);
            }}
            style={{
              position: 'absolute',
              top: insets.top ? insets.top : StatusBar.currentHeight,
              left: 0,
              right: 0,
              zIndex: 1,
            }}>
            <CustomHomeHeader bgColor={COLORS.transparent} />

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
          </View>
        )}
        {
          isNuggetsLoading ? (
            <Loader
              loaderText="Fetching Nuggets"
              isEnableDefaultLoaderBackground={true}
            />
          ) : (
            <BigList
              ref={flatlistRef}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              data={getNuggetsList()}
              alwaysBounceVertical={false}
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

export default DashboardWithCategory;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});
