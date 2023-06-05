import {StyleSheet, View} from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';
import StyledText from './StyledText';
import {COLORS} from '../Utilities/Colors';
import {DIMENSIONS} from '../Utilities/Constants';
import SVGIcon from './SVGIcon';
import {secondsToMinutesAndSeconds} from '../Utilities/Methods';
const windowWidth = DIMENSIONS.window.width;

type Props = {
  progress?: number;
  duration?: number;
  seekUpdate?: (value: any) => void;
  onPlayPause?: () => void;
  isPaused?: boolean;
  isVisiblePlayPause?: boolean;
};

const MediaProgressSlider = ({
  progress = 0,
  duration = 0,
  seekUpdate,
  isPaused = true,
  isVisiblePlayPause = false,
  onPlayPause,
}: Props) => {
  return (
    <View style={[styles.sliderContainer, {width: '100%'}]}>
      <StyledText
        style={{...styles.timerText, left: isVisiblePlayPause ? 32 : 15}}>
        {secondsToMinutesAndSeconds(Math.floor((progress * duration) / 100))}
      </StyledText>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {isVisiblePlayPause && (
          <SVGIcon
            icon={isPaused ? 'play_fill_white' : 'pause_fill_white'}
            height={20}
            width={20}
            isButton
            onPress={onPlayPause}
          />
        )}
        <Slider
          style={{
            height: 40,
            width: '100%',
          }}
          minimumValue={0}
          maximumValue={100}
          value={progress}
          minimumTrackTintColor={COLORS.white}
          maximumTrackTintColor={COLORS.white}
          thumbTintColor={COLORS.white}
          onValueChange={seekUpdate}
          // onSlidingComplete={seekUpdate}
        />
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
    // position: 'absolute',
    height: 55,
    // bottom: 100,
    // zIndex: 100,
  },
  timerText: {
    color: COLORS.white,
    position: 'absolute',
    fontSize: 13,
    bottom: 5,
    paddingVertical: 5,
  },
});
