import {StyleSheet, View} from 'react-native';
import React from 'react';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {DIMENSIONS} from '../Utilities/Constants';
import SVGIcon from './SVGIcon';
import {secondsToMinutesAndSeconds} from '../Utilities/Methods';
import {Slider} from '@miblanchard/react-native-slider';
const windowWidth = DIMENSIONS.window.width;

type Props = {
  progress?: number;
  duration?: number;
  seekUpdate?: (value: any) => void;
  onPlayPause?: () => void;
  isPaused?: boolean;
  isEnableDurationFloor?: boolean;
  isVisiblePlayPause?: boolean;
  isVisibleStop?: boolean;
};

const MediaProgressSlider = ({
  progress = 0,
  duration = 0,
  seekUpdate,
  isEnableDurationFloor = true,
  isPaused = true,
  isVisiblePlayPause = false,
  onPlayPause,
  isVisibleStop,
}: Props) => {
  function getProgressText() {
    return secondsToMinutesAndSeconds(progress);
  }

  function getMaxValue() {
    if (isEnableDurationFloor) {
      return Math.floor(duration);
    }
    return duration;
  }

  return (
    <View style={[styles.sliderContainer, {width: '100%'}]}>
      <StyledText
        style={{...styles.timerText, left: isVisiblePlayPause ? 32 : 15}}>
        {getProgressText()}
      </StyledText>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {isVisiblePlayPause && (
          <SVGIcon
            icon={
              isPaused
                ? 'play_fill_white'
                : isVisibleStop
                ? 'stop_rounded_white'
                : 'pause_fill_white'
            }
            height={20}
            width={20}
            isButton
            onPress={onPlayPause}
          />
        )}
        <View style={{alignItems: 'center', width: '100%'}}>
          <Slider
            containerStyle={{
              height: 40,
              width: '95%',
            }}
            minimumValue={0}
            maximumValue={getMaxValue()}
            value={progress}
            minimumTrackTintColor={COLORS.white}
            maximumTrackTintColor={COLORS.white}
            thumbTintColor={COLORS.white}
            onValueChange={val => {
              if (seekUpdate) {
                seekUpdate(val[0]);
              }
            }}
            // onSlidingComplete={seekUpdate}
            trackClickable={true}
            thumbStyle={{
              height: 15,
              width: 15,
              borderRadius: 9,
            }}
          />
        </View>
      </View>
      <StyledText
        style={{...styles.timerText, right: isVisiblePlayPause ? 0 : 15}}>
        {secondsToMinutesAndSeconds(duration ?? 0)}
      </StyledText>
    </View>
  );
};

export default MediaProgressSlider;

const styles = StyleSheet.create({
  sliderContainer: {
    height: 55,
  },
  timerText: {
    color: COLORS.white,
    position: 'absolute',
    fontSize: 13,
    bottom: 5,
    paddingVertical: 5,
  },
});
