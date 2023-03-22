import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../Components/HOCView';
import {COLORS} from '../../Utilities/Colors';
import {useNavigation} from '@react-navigation/native';
import SearchInput from '../../Components/SearchInput';
import EventListItem from './EventListItem';
import {useToken} from '../../Utilities/StoreData';
import {listEventsService} from '../../Services/ApiService';

const Talkshow = () => {
  const navigation = useNavigation();
  const token = useToken();
  const [isLoading, setisLoading] = useState(false);
  const [isSearchClicked, setisSearchClicked] = useState(true);
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
    listEventsService(formData)
      .then(res => {
        console.log(res.data, '===>Talkshow');
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
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      isEnableKeyboardAware={isSearchClicked ? true : false}
      // paddingHorizontal={5}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: 'Talkshows',
        // isEnableBackButton: true,
        isTitleCenter: true,
        // isEnableRightIcon: false,
        // backIcon: 'back',
      }}
      isEnableDefaultBackground>
      <SearchInput
        placeHolderText="Search talkshow"
        onPressSearch={setsearchText}
        isPrimarySearchButton={false}
      />
      <FlatList
        data={talkshowData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <EventListItem item={item} eventType="talkshow" />
        )}
      />
    </HOCView>
  );
};

export default Talkshow;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
