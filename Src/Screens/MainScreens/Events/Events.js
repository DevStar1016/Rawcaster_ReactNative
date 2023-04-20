import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';

const Events = () => {
  const navigation = useNavigation();
  return (
    <EventTalkshowCommonScreen
      screenType="event_and_live"
      onPressAddButton={() => {
        navigation.navigate('CreateEditEvent');
      }}
      onEditEvent={eventId => {
        // navigation.navigate('CreateEditTalkshow', {
        //   eventId: eventId,
        // });
      }}
    />
  );
};

export default Events;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
