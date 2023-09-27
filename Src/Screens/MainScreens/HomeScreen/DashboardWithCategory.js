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
import {
  resetFollowingUsersList,
  setFollowingUsersList,
} from '../../../Store/Slices/HomeSlice';
import {DIMENSIONS} from '../../../Utilities/Constants';

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
  const {
    headerContainerHeight,
    viewableItem,
    setviewableItem,
    resetViewabilityItem,
  } = useDashboardTopTabCategories() ?? {};
  const [headerHeight, setheaderHeight] = useState(0);
  const isNuggetsLoading = useIsNuggetsLoading(categoryName ?? 'forYou');
  const nuggetsList = useNuggetsList(categoryName ?? 'forYou');
  const totalPages = useNuggetsListTotalPages(categoryName ?? 'forYou');
  const token = useToken();
  const flatlistRef = useRef(null);
  const nuggetType = useNuggetType();
  const [viewableItemBeforLogin, setviewableItemBeforLogin] = useState({
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
  const nuggetContentController = useRef(null);

  /**
   * Callback function that is called when the viewable items change in a FlatList component. It updates the focusedNuggetUserId state based on the
   * selected nugget and updates the viewableItem state with the currently viewable item.
   * @param {Array} viewableItems - An array of viewable items in the list.
   * @returns None
   */
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
      if (token) {
        if (setviewableItem) {
          setviewableItem({
            nugget_id: viewableItems?.viewableItems[0]?.item.nugget_id || 0,
            viewed: viewableItems?.viewableItems[0]?.item.viewed,
          });
        }
      } else {
        setviewableItemBeforLogin({
          nugget_id: viewableItems?.viewableItems[0]?.item.nugget_id || 0,
          viewed: viewableItems?.viewableItems[0]?.item.viewed,
        });
      }
    }
  });

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
    if (getNuggetsList() && getNuggetsList().length > 0 && !isNuggetsLoading) {
      if (token) {
        if (setviewableItem) {
          setviewableItem({
            nugget_id: getNuggetsList()[0].nugget_id || 0,
            viewed: getNuggetsList()[0].viewed,
          });
        }
      } else {
        setviewableItemBeforLogin({
          nugget_id: getNuggetsList()[0].nugget_id || 0,
          viewed: getNuggetsList()[0].viewed,
        });
      }
    } else {
      if (token) {
        if (resetViewabilityItem) {
          resetViewabilityItem();
        }
      }
    }
  }, [nuggetsList, isNuggetsLoading]);

  useEffect(() => {
    if (token && viewableItem?.nugget_id && !viewableItem?.viewed) {
      onViewNugget(viewableItem?.nugget_id);
    } else if (
      !token &&
      viewableItemBeforLogin?.nugget_id &&
      !viewableItemBeforLogin?.viewed
    ) {
      onViewNugget(viewableItemBeforLogin.nugget_id);
    }
  }, [viewableItem?.nugget_id, viewableItemBeforLogin?.nugget_id]);

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
      dispatch(resetFollowingUsersList([]));
      dispatch(resetNuggetsTotalPages(categoryName));
      dispatch(setNuggetsLoading({categoryName, status: true}));
      dispatch(
        setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])),
      );
      if (token) {
        if (resetViewabilityItem) {
          resetViewabilityItem();
        }
      }
      listNuggetsAPICall(1);
    }
  }, [token, nuggetType]);

  useEffect(() => {
    if (
      currentPage === 1 &&
      ((token && !viewableItem?.nugget_id) ||
        (!token && !viewableItemBeforLogin.nugget_id)) &&
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

  /**
   * Scrolls the nuggets list to the top.
   * @returns None
   */
  function scrollNuggetsListToTop() {
    flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  }

  /**
   * Makes an API call to retrieve a list of nuggets.
   * @param {number} [pageNumber=1] - The page number of the results to retrieve.
   * @returns None
   */
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

  /**
   * Updates the view status and total views count of a nugget with the given ID.
   * @param {string} nuggetId - The ID of the nugget to view.
   * @returns None
   */
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
    if (token) {
      handleViewNugget(nuggetId);
    }
  }

  /**
   * Resets the viewability item by setting the nugget_id to an empty string and viewed to false.
   * @returns None
   */

  /**
   * Handles playing audio from the given URL.
   * @param {string} url - The URL of the audio file to play.
   * @returns None
   */
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

  /**
   * Stops the audio playback and removes the playback listener.
   * If an error occurs during the process, it is caught and ignored.
   * Finally, sets the 'isReadMuted' state to false.
   * @returns None
   */
  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
    } catch (e) {
    } finally {
      setisReadMuted(false);
    }
  };

  /**
   * Handles the view of a nugget by sending a request to the server.
   * @param {number} nuggetId - The ID of the nugget to view.
   * @returns None
   */
  function handleViewNugget(nuggetId) {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', JSON.stringify([nuggetId]));
    addNuggetViewService(formData)
      .then(res => {})
      .catch(e => {});
  }

  /**
   * Retrieves a list of nuggets, applying any necessary filters and modifications.
   * @returns {Array} - The filtered and modified list of nuggets.
   */
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

  /**
   * Function called when refreshing the page.
   * Resets the current page number to 1.
   * Resets the following users list.
   * Resets the total pages for nuggets in the specified category.
   * Sets the loading status for nuggets in the specified category to true.
   * Resets the nuggets list for the specified category.
   * Resets the viewability item.
   * Calls the API to list nuggets with page number 1.
   * @returns None
   */
  function onRefresh() {
    currentPage = 1;
    dispatch(resetFollowingUsersList([]));
    dispatch(resetNuggetsTotalPages(categoryName));
    dispatch(setNuggetsLoading({categoryName, status: true}));
    dispatch(setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])));
    if (token) {
      if (resetViewabilityItem) {
        resetViewabilityItem();
      }
    }
    listNuggetsAPICall(1);
  }

  /**
   * Function called when reaching the end of a list or page.
   * It increments the currentPage variable by 1 and checks if there are more pages to load.
   * If there are more pages, it sets the isLoadMore state to true and makes an API call to load the next page of data.
   * @returns None
   */
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
    [insets.mediaHeight],
  );

  const renderNuggetItem = useCallback(renderItem, [
    editedNuggetsList,
    deletedNuggetsIds,
    followingUsersList,
    isMuted,
    viewableItem,
    viewableItemBeforLogin,
    getHeaderHeight(),
    insets.mediaHeight,
  ]);

  const nuggetActions = {
    headerContainerHeight: getHeaderHeight(),
    isMuted: isMuted,
    isFrom: 'dashboard',
    dashboardFocused: isFocused,
    isFocused,
    setisMuted: setisMuted,
    categoryName: categoryName ?? 'forYou',
    isAutoPlay: true,
    scrollNuggetsListToTop: scrollNuggetsListToTop,
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: token
      ? viewableItem?.nugget_id
      : viewableItemBeforLogin?.nugget_id,
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
              buttonText="Login/Sign up to explore Rawcaster"
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
              initialScrollIndex={0}
              onViewableItemsChanged={onViewRef?.current}
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
