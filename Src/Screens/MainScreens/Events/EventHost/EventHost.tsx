import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import HOCView from '../../../../Components/HOCView';
import EventHostBottomTabView from './EventHostBottomTabView';
import {COLORS} from '../../../../Utilities/Colors';
import {
  MobileSDKEvent,
  NativeFunction,
  getSDKEventEmitter,
} from './ChimeMeetingBridge';

const EventHost = () => {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <HOCView
      backHeaderProps={{
        title: 'Events',
        bgColor: COLORS.transparent,
        isTitleCenter: true,
      }}
      isEnableRLogo={false}
      isEnableDefaultBackground
      paddingHorizontal={0}>
      <View style={styles.mainContainer}>
        <View style={styles.videoTilesContainer}></View>
        <EventHostBottomTabView />
      </View>
    </HOCView>
  );
};

export default EventHost;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  videoTilesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 5,
  },
});
