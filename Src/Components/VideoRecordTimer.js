import {StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import {getMinutesSecondsFormate} from '../Utilities/Methods';

var timerInterval = undefined;
const VideoRecordTimer = ({onReachMaxTime, maxSeconds = 120}) => {
  const [timer, settimer] = useState(0);

  useEffect(() => {
    let timerInterval = setInterval(() => {
      settimer(pre => pre + 1);
    }, 1000);
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (timer >= maxSeconds) {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      onReachMaxTime();
    }
  }, [timer]);

  return (
    <StyledText style={styles.timerText}>
      {getMinutesSecondsFormate(timer)}
    </StyledText>
  );
};

export default VideoRecordTimer;

const styles = StyleSheet.create({
  timerText: {
    color: COLORS.red,
    fontSize: 16,
    fontFamily: FONTS.DMSans.bold,
    alignSelf: 'center',
    paddingVertical: 5,
  },
});
