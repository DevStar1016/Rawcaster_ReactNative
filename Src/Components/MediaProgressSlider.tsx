import {StyleSheet, View} from 'react-native';
import React from 'react';
import Slider from '@react-native-community/slider';
import StyledText from './StyledText';
import {getMediaDurationFormat} from '../Utilities/Methods';
import {COLORS} from '../Utilities/Colors';
import {DIMENSIONS} from '../Utilities/Constants';
const windowWidth = DIMENSIONS.window.width;

type Props = {
  progress?: number;
  duration?: number;
  seekUpdate?: (value: any) => void;
};

const MediaProgressSlider = ({
  progress = 0,
  duration = 0,
  seekUpdate,
}: Props) => {
  return (
    <View style={[styles.sliderContainer, {width: '100%'}]}>
      <StyledText style={{...styles.timerText, left: 15}}>
        {getMediaDurationFormat(Math.floor((progress * duration) / 100))}
      </StyledText>
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
      <StyledText style={{...styles.timerText, right: 15}}>
        {getMediaDurationFormat(duration || 0)}
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
