import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Modal,
  RefreshControl,
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
import DropDownPicker from '../../../Components/DropDownPicker';

type Props = {
  screenType: 'event_and_live' | 'talkshow';
  onPressAddButton: () => void;
  onEditEvent: (item: any) => void;
};
var isMount = true;
var currentPage = 1;
var totalPages = 1;

const EventTalkshowCommonScreen = ({
  screenType,
  onPressAddButton,
  onEditEvent,
}: Props) => {
  const token = useToken();
  const [isLoading, setisLoading] = useState(false);
  const [searchText, setsearchText] = useState('');
  const [eventsList, seteventsList] = useState<any[]>([]);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [refreshing, setrefreshing] = useState(false);
  const [isLoadMore, setisLoadMore] = useState(false);

  useEffect(() => {
    isMount = true;
    if (isMount) {
      setisLoading(true);
    }
    listTalkshowApiCall(1);
    return () => {
      isMount = false;
    };
  }, []);

  const listTalkshowApiCall = (pageNumber: number = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    // formData.append('event_type', 1);
    formData.append('type_filter', screenType === 'talkshow' ? '2' : '1,3');
    formData.append('page_number', pageNumber);

    listEventsService(formData)
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
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
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
    let placeHolder = 'Search ';
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
    listTalkshowApiCall(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listTalkshowApiCall(currentPage);
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

  return (
    <HOCView
      headerType="home_header"
      isEnableTopSafeAreaHomeHeader
      headerProps={{bgColor: COLORS.transparent}}
      isEnableDefaultBackground
      backgroundColor={COLORS.primary}>
      <SearchInput
        placeHolderText={getSearchPlaceHolderText()}
        onSearch={setsearchText}
        searchWhenClickedButton={false}
        marginVertical={10}
        searchButtonColor={COLORS.secondary}
      />
      {/* <DropDownPicker
        dataList={['Public Events', 'Invited Events', 'My Events']}
      /> */}

      <FlatList
        data={getEventsList()}
        contentContainerStyle={{
          paddingBottom: 25,
        }}
        ItemSeparatorComponent={() => {
          return <View style={{height: 15}} />;
        }}
        ListEmptyComponent={() => {
          return isLoading ? (
            <View style={styles.listEmptyContainer}>
              <ActivityIndicator size={'large'} color={COLORS.white} />
            </View>
          ) : null;
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
          />
        )}
      />

      <RoundedPlusButton
        onPress={onPressAddButton}
        style={styles.createEventPluButton}
      />
      <Modal visible={isActionLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </HOCView>
  );
};

export default EventTalkshowCommonScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 50,
  },
  createEventPluButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
