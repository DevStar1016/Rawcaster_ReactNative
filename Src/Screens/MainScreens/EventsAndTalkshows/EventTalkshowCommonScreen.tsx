import {FlatList, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import SearchInput from '../../../Components/SearchInput';
import EventListItem from './EventListItem';
import {useToken} from '../../../Utilities/StoreData';
import {listEventsService} from '../../../Services/ApiService';

type Props = {
  screenType: 'event_and_live' | 'talkshow';
};

const EventTalkshowCommonScreen = ({screenType}: Props) => {
  const token = useToken();
  const [isLoading, setisLoading] = useState(false);
  const [searchText, setsearchText] = useState('');
  const [talkshowData, settalkshowData] = useState([]);

  useEffect(() => {
    listTalkshowApiCall();
  }, []);

  const listTalkshowApiCall = () => {
    setisLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_type', 3);
    formData.append('type_filter', 2);

    listEventsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          settalkshowData(res.data.events_list);
        }
      })
      .catch(console.log)
      .finally(() => {
        setisLoading(false);
      });
  };

  return (
    <HOCView
      isLoading={isLoading}
      headerType="home_header"
      isEnableTopSafeAreaHomeHeader
      headerProps={{bgColor: COLORS.transparent}}
      isEnableDefaultBackground>
      <SearchInput
        placeHolderText="Search talkshow"
        onPressSearch={setsearchText}
        isPrimarySearchButton={false}
        marginVertical={10}
      />
      <FlatList
        data={talkshowData}
        contentContainerStyle={{
          paddingBottom: 25,
        }}
        ItemSeparatorComponent={() => {
          return <View style={{height: 15}} />;
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <EventListItem item={item} eventType="talkshow" />
        )}
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
});
