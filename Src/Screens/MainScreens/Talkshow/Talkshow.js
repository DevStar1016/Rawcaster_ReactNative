import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';

const Talkshow = () => {
  const navigation = useNavigation();

  return (
    <EventTalkshowCommonScreen
      screenType="talkshow"
      onPressAddButton={() => {
        navigation.navigate('CreateEditTalkshow');
      }}
      onEditEvent={eventId => {
        navigation.navigate('CreateEditTalkshow', {
          eventId: eventId,
        });
      }}
    />
  );
};

export default Talkshow;

const styles = StyleSheet.create({});
