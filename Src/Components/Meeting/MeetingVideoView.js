import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {MeetingVideo} from '../../Native/Components/MeetingVideo';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';

const MeetingVideoView = ({tileId}) => {
  return (
    <View style={styles.mainContainer}>
      <MeetingVideo style={styles.video} tileId={tileId} />
    </View>
  );
};

export default MeetingVideoView;

const styles = StyleSheet.create({
  mainContainer: {
    height: (WINDOW_WIDTH - 10) / 2,
    width: (WINDOW_WIDTH - 10) / 2,
  },
  video: {
    height: '100%',
    width: '100%',
  },
});
