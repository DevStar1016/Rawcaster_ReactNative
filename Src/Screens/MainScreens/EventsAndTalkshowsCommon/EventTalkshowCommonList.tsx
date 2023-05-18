import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import SearchInput from '../../../Components/SearchInput';
import EventListItem from './EventListItem';
import {useToken} from '../../../Utilities/StoreData';
import {
  deleteEventService,
  listEventsService,
} from '../../../Services/ApiService';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import Loader from '../../../Components/Loader';
import Toast from '../../../Components/Toast';
import {
  DIMENSIONS,
  EVENTS_LIST_FILTER_TYPES,
} from '../../../Utilities/Constants';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import ItemSelectionMiniList from '../../../Components/ItemSelectionMiniList';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import DefaultBackground from '../../../Components/DefaultBackground';

type Props = {
  screenType: 'event_and_live' | 'talkshow';
  onPressAddButton: () => void;
  onEditEvent: (item: any) => void;
  onPressStartJoinEvent: (item: any) => void;
};
var isMount = true;
var currentPage = 1;
var totalPages = 1;

const EventTalkshowCommonScreen = ({
  screenType,
  onPressAddButton,
  onEditEvent,
  onPressStartJoinEvent,
}: Props) => {
  const token = useToken();
  const [searchText, setsearchText] = useState('');
  const [eventsList, seteventsList] = useState<any[]>([]);
  const [eventFilterType, seteventFilterType] = useState(
    EVENTS_LIST_FILTER_TYPES[0],
  );
  const [isActionLoading, setisActionLoading] = useState(false);
  const [refreshing, setrefreshing] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isListLoading, setisListLoading] = useState(true);
  const [isOpenEventFilterList, setisOpenEventFilterList] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    totalPages = 1;
    currentPage = 1;
    if (isMount) {
      setisListLoading(true);
      seteventsList([]);
    }
    listEventsTalkshowApiCall(1);
  }, [eventFilterType]);

  const listEventsTalkshowApiCall = (pageNumber: number = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_type', eventFilterType.id);
    formData.append('type_filter', screenType === 'talkshow' ? '2' : 1);
    formData.append('page_number', pageNumber);

    listEventsService(formData)
      .then(res => {
        // console.log(res.data, 'event res');
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
        console.log(e, 'event err');
      })
      .finally(() => {
        if (isMount) {
          setisListLoading(false);
          setrefreshing(false);
          setisLoadMore(false);
        }
      });
  };

  const onPressDelete = (eventId: any) =>
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

  const onDeleteEvent = (eventId: any) => {
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
                (item: any) => item.event_id !== eventId,
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

  const getSearchPlaceHolderText = () => {
    let placeHolder = `Search ${eventFilterType.name.split(' ')[0]} `;
    if (screenType === 'talkshow') {
      placeHolder = placeHolder + 'Talkshow';
    } else if (screenType === 'event_and_live') {
      placeHolder = placeHolder + 'Events';
    }
    return placeHolder;
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setrefreshing(true);
    }
    listEventsTalkshowApiCall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listEventsTalkshowApiCall(currentPage);
      }
    }
  };

  const getEventsList = () => {
    if (searchText.trim()) {
      return [...eventsList].filter(item =>
        item.event_name.toLowerCase().includes(searchText.trim().toLowerCase()),
      );
    }
    return [...eventsList];
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.white} />
    ) : null;
  };

  return (
    <View style={{flex: 1}}>
      <CustomHomeHeader
        title={screenType === 'talkshow' ? 'Talkshow' : 'Events'}
        bgColor={COLORS.transparent}
        isEnableSafeArea
        isEnableSearch={true}
        isEnableLive={false}
      />
      <DefaultBackground
        isEnableRLogo={getEventsList().length <= 0}
        bgColor={COLORS.primaryDark}
        isEnableLoading={isListLoading}
        centerText={
          isListLoading
            ? `Fetching ${
                screenType === 'talkshow' ? 'Talkshow' : 'Events'
              } List`
            : getEventsList().length <= 0
            ? 'No data found'
            : ''
        }
      />
      <View style={styles.contentContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <RoundedIconButton
            buttonStyle={{
              marginRight: 10,
              backgroundColor: COLORS.secondary,
              paddingTop: 5,
              height: 45,
              width: 45,
              borderRadius: 45 / 2,
            }}
            iconProps={{marginLeft: 2}}
            iconSize={20}
            icon="filter_line_white"
            onPress={() => {
              if (isMount) {
                setisOpenEventFilterList(true);
              }
            }}
          />
          <SearchInput
            placeHolderText={getSearchPlaceHolderText()}
            containerStyle={{flex: 1}}
            onSearch={setsearchText}
            searchWhenClickedButton={false}
            marginVertical={10}
            searchButtonColor={COLORS.secondary}
          />
        </View>
        {/* <DropDownPicker
        dataList={['Public Events', 'Invited Events', 'My Events']}
      /> */}

        <FlatList
          data={getEventsList()}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          onEndReachedThreshold={0.2}
          onEndReached={onEndReached}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, _}: any) => (
            <EventListItem
              item={item}
              isDarkTheme
              onPressEdit={() => {
                onEditEvent(item?.event_id);
              }}
              onPressDelete={() => {
                onPressDelete(item?.event_id);
              }}
              onPressStartJoinEvent={() => {
                onPressStartJoinEvent(item);
              }}
            />
          )}
          ListFooterComponent={renderFooter}
        />

        <RoundedPlusButton
          onPress={onPressAddButton}
          style={styles.createEventPluButton}
        />

        <Modal
          visible={isOpenEventFilterList}
          onRequestClose={() => {
            setisOpenEventFilterList(false);
          }}
          transparent
          style={{backgroundColor: COLORS.transparentDimColor}}>
          <SafeAreaView
            style={{flex: 1, backgroundColor: COLORS.transparentDimColor}}>
            <ItemSelectionMiniList
              maxHeight={DIMENSIONS.screen.height / 2 - 100}
              onClose={() => {
                setisOpenEventFilterList(false);
              }}
              fieldName={'name'}
              listData={EVENTS_LIST_FILTER_TYPES}
              onSelectItem={item => {
                seteventFilterType(item);
                setisOpenEventFilterList(false);
              }}
            />
          </SafeAreaView>
        </Modal>

        <Modal visible={isActionLoading} transparent>
          <Loader bgColor={COLORS.transparentDimColor} />
        </Modal>
      </View>
    </View>
  );
};

export default EventTalkshowCommonScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentContainer: {
    flex: 1,
    paddingBottom: 50,
    paddingHorizontal: 15,
  },

  listEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 50,
  },
  createEventPluButton: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
