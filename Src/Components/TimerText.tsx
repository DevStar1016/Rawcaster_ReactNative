import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import StyledText from './StyledText';
import {secondsToMinutesAndSeconds} from '../Utilities/Methods';
import {COLORS} from '../Utilities/Colors';

interface Props {
  style?: StyleProp<TextStyle>;
  timerType?: 'forward' | 'backward';
  startSeconds?: number;
  isPlayTimer?: boolean;
  endTimeSeconds?: number | undefined | null;
  onEndTime?: (val: number) => void;
}

var interval: any;
const TimerText = ({
  style,
  timerType = 'forward',
  startSeconds = 0,
  isPlayTimer = false,
  endTimeSeconds,
  onEndTime,
}: Props) => {
  const [timer, settimer] = useState<number>(startSeconds);
  useEffect(() => {
    if (isPlayTimer) {
      interval = setInterval(() => {
        settimer(pre => {
          if (timerType === 'backward') {
            if (pre === 0) {
              if (onEndTime) {
                onEndTime(pre);
              }
              clearInterval(interval);
              return 0;
            } else {
              return pre - 1;
            }
          } else if (timerType === 'forward') {
            if (typeof endTimeSeconds === 'number') {
              if (pre === endTimeSeconds) {
                if (onEndTime) {
                  onEndTime(pre);
                }
                clearInterval(interval);
                return 0;
              }
            }
            return pre + 1;
          }
          return 0;
        });
      }, 1000);
    } else {
      if (interval) {
        if (onEndTime) {
          onEndTime(timer);
        }
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlayTimer]);

  const getStyle = () => {
    if (style) {
      if (Array.isArray(style)) {
        return [styles.text, ...style];
      }
      return [styles.text, style];
    }
    return styles.text;
  };

  return (
    <StyledText style={getStyle()}>
      {secondsToMinutesAndSeconds(timer)}
    </StyledText>
  );
};

export default TimerText;

const styles = StyleSheet.create({
  text: {
    color: COLORS.white,
  },
});
