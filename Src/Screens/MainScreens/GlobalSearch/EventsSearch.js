import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import EventListItem from '../EventsAndTalkshowsCommon/EventListItem';
import {useGlobalSearch} from '../../../Utilities/Contexts';
import Loader from '../../../Components/Loader';
import StyledText from '../../../Components/StyledText';
import {
  deleteEventService,
  globalSearchEventsService,
} from '../../../Services/ApiService';
import {useToken} from '../../../Utilities/StoreData';
import DefaultBackground from '../../../Components/DefaultBackground';
import {useNavigation} from '@react-navigation/native';
import Toast from '../../../Components/Toast';
import StartJoinEventWaitingRoom from '../../../Modals/StartJoinEventWaitingRoom';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const EventsSearch = () => {
  const navigation = useNavigation();
  const {searchText, setisActionLoading} = useGlobalSearch();
  const token = useToken();
  const [eventsList, seteventsList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [startEventDetails, setstartEventDetails] = useState(null);
  const [isOpenHostingScreen, setisOpenHostingScreen] = useState(false);

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
    setisListLoading(true);
    eventsSearchAPICall(1);
  }, [searchText]);

  /**
   * Makes an API call to search for events using the provided search key and page number.
   * @param {number} [pageNumber=1] - The page number to retrieve events from. Default is 1.
   * @returns None
   */
  const eventsSearchAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('search_key', searchText);
    formData.append('page_number', pageNumber);
    globalSearchEventsService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              seteventsList(res.data.events_list);
            } else {
              seteventsList(preList => [...preList, ...res.data.events_list]);
            }
          } else if (res.data.status === 0) {
            seteventsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          seteventsList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisListLoading(false);
          setisRefreshing(false);
        }
      });
  };

  /**
   * Handles the start join event button press event.
   * @param {object} eventDetails - The details of the event.
   * @returns None
   */
  const onPressStartJoinEvent = eventDetails => {
    if (isMount) {
      setstartEventDetails(eventDetails);
      setisOpenHostingScreen(true);
    }
  };

  /**
   * Function called when refreshing the page or data. It resets the current page number
   * and total number of pages, and then makes an API call to retrieve the events data
   * for the first page.
   * @returns None
   */
  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    eventsSearchAPICall(1);
  };

  /**
   * Callback function triggered when the end of the list is reached.
   * It increments the currentPage variable by 1 and checks if there are more pages to load.
   * If there are more pages, it sets the isLoadMore state to true and makes an API call to fetch the events for the next page.
   * @returns None
   */
  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        eventsSearchAPICall(currentPage);
      }
    }
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.divider} />;
  };

  function renderEmptyComponent() {
    return (
      <View style={[styles.emptyComponent, {height: listContainerHeight}]}>
        <DefaultBackground />
        <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mainContainer,
        eventsList.length > 0 && {paddingVertical: 5, paddingHorizontal: 15},
      ]}
      onLayout={e => {
        setlistContainerHeight(e.nativeEvent.layout.height);
      }}>
      {isListLoading ? (
        <Loader indicatorColor={COLORS.primary} />
      ) : (
        <FlatList
          // data={getFilteredDuplicatesList(eventsList, 'user_ref_id')}
          data={eventsList}
          scrollEnabled={eventsList.length > 0 ? true : false}
          renderItem={({item}) => {
            return (
              <EventListItem
                isEnableBorder
                item={item}
                isFromGlobalSearch={true}
                onPressStartJoinEvent={() => {
                  onPressStartJoinEvent(item);
                }}
              />
            );
          }}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
          keyExtractor={(item, _) => item.event_id.toString()}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderSeperator}
          ListFooterComponent={renderFooter}
        />
      )}

      <Modal
        visible={isOpenHostingScreen}
        onRequestClose={() => {
          // if (isMount) {
          //   setisOpenHostingScreen(false);
          // }
        }}
        style={{backgroundColor: COLORS.white}}>
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
          <StartJoinEventWaitingRoom
            eventItem={startEventDetails}
            onStartHosting={() => {}}
            onClose={() => {
              if (isMount) {
                setisOpenHostingScreen(false);
              }
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default EventsSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  divider: {
    backgroundColor: COLORS.borderColor,
    height: 15,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
