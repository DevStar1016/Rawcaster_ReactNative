import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';

const Events = () => {
  return (
    <View style={styles.mainContainer}>
      <Text>Event under development</Text>
    </View>
    // <EventTalkshowCommonScreen
    //   screenType="event_and_live"
    //   onPressAddButton={() => {}}
    // />
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
