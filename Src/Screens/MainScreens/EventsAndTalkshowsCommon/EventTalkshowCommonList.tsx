import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import SearchInput from '../../../Components/SearchInput';
import EventListItem from './EventListItem';
import {useToken} from '../../../Utilities/StoreData';
import {listEventsService} from '../../../Services/ApiService';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';

type Props = {
  screenType: 'event_and_live' | 'talkshow';
  onPressAddButton: () => void;
  onEditEvent: (item: any) => void;
};

const EventTalkshowCommonScreen = ({
  screenType,
  onPressAddButton,
  onEditEvent,
}: Props) => {
  const token = useToken();
  const [isLoading, setisLoading] = useState(false);
  const [searchText, setsearchText] = useState('');
  const [eventsList, seteventsList] = useState([]);

  useEffect(() => {
    listTalkshowApiCall();
  }, []);

  const listTalkshowApiCall = () => {
    setisLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_type', 1);
    formData.append('type_filter', screenType === 'talkshow' ? '2' : '1,3');

    listEventsService(formData)
      .then(res => {
        console.log(res.data);

        if (res.data.status === 1) {
          seteventsList(res.data.events_list);
        } else if (res.data.status === 0) {
          seteventsList([]);
        }
      })
      .catch(e => {})
      .finally(() => {
        setisLoading(false);
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

  return (
    <HOCView
      headerType="home_header"
      isEnableTopSafeAreaHomeHeader
      headerProps={{bgColor: COLORS.transparent}}
      isEnableDefaultBackground
      backgroundColor={COLORS.primary}>
      <SearchInput
        placeHolderText={getSearchPlaceHolderText()}
        onPressSearch={setsearchText}
        isPrimarySearchButton={false}
        marginVertical={10}
        searchButtonColor={COLORS.secondary}
      />
      <FlatList
        data={eventsList}
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
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, _}: any) => (
          <EventListItem
            item={item}
            isDarkTheme
            onPressEdit={() => {
              onEditEvent(item?.event_id);
            }}
          />
        )}
      />
      <RoundedPlusButton
        onPress={onPressAddButton}
        style={styles.createEventPluButton}
      />
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
