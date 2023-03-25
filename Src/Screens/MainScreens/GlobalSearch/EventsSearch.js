import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import {globalSearchEventsService} from '../../../Services/ApiService';
import {useToken} from '../../../Utilities/StoreData';

var isMount = true;
var currentPage = 1;
var totalPages = 1;
const EventsSearch = () => {
  const {searchText, setisActionLoading} = useGlobalSearch();
  const token = useToken();
  const [eventsList, seteventsList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [listContainerHeight, setlistContainerHeight] = useState(undefined);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);

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

  return (
    <View
      style={styles.mainContainer}
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
            return <EventListItem item={item} />;
          }}
          ListEmptyComponent={() => {
            return (
              <View
                style={[styles.emptyComponent, {height: listContainerHeight}]}>
                <StyledText style={{paddingVertical: 5}}>
                  We didn't find any results!
                </StyledText>
              </View>
            );
          }}
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
    </View>
  );
};

export default EventsSearch;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 5,
    paddingHorizontal: 15,
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
