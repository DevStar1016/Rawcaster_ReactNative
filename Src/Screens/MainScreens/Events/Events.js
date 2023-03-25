import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';

const Events = () => {
  return (
    <EventTalkshowCommonScreen
      screenType="event_and_live"
      onPressAddButton={() => {}}
    />
  );
};

export default Events;

const styles = StyleSheet.create({});
