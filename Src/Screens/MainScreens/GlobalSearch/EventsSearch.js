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
import StartEventHosting from '../../../Modals/StartEventHosting';

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

  const onDeleteEvent = eventId => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_id', eventId);
    deleteEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isMount) {
            seteventsList(preEventsList => {
              return [...preEventsList].filter(
                item => item.event_id !== eventId,
              );
            });
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  };

  const onEditEvent = id => {
    navigation.navigate('CreateEditSearchEvent', {
      eventId: id,
      isFromEventSearch: true,
    });
  };

  const onPressDelete = eventId =>
    Alert.alert(
      'Delete!',
      'Do you want to delete this talkshow?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            if (isMount) {
              setisActionLoading(true);
            }
            onDeleteEvent(eventId);
          },
        },
      ],
      {cancelable: false},
    );

  const onPressStartJoinEvent = eventDetails => {
    if (isMount) {
      setstartEventDetails(eventDetails);
      setisOpenHostingScreen(true);
    }
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    eventsSearchAPICall(1);
  };

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
                // onPressEdit={() => {
                //   onEditEvent(item?.event_id);
                // }}
                // onPressDelete={() => {
                //   onPressDelete(item?.event_id);
                // }}
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
          if (isMount) {
            setisOpenHostingScreen(false);
          }
        }}
        style={{backgroundColor: COLORS.white}}>
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
          <StartEventHosting
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
    // paddingVertical: 5,
    // paddingHorizontal: 15,
  },
  divider: {
    backgroundColor: COLORS.borderColor,
    height: 1,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
