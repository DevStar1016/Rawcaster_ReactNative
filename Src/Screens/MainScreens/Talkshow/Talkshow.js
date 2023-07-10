import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';

const Talkshow = () => {
  return (
    <EventTalkshowCommonScreen
      screenType="talkshow"
      onPressStartJoinEvent={() => {}}
    />
  );
};

export default Talkshow;

const styles = StyleSheet.create({});
