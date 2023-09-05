import {StyleSheet, View} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import DefaultBackground from '../../../../Components/DefaultBackground';
import {useInsets} from '../../../../Utilities/StoreData';
import Video from 'react-native-video';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';

function AudioNugget({
  url,
  index,
  paused,
  audioPlayer,
  progress,
  setprogress,
  duration,
  setisLoadingVideo,
  setduration,
}) {
  const {isMuted, mediaHeight} = useNuggetParentActions();
  const {isRepeatVideo, onFinishPlaying} = useNuggetItemActions();
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;

  /**
   * Handles the error that occurs when loading a video.
   * @param {Error} error - The error object that occurred.
   * @returns None
   */
  const videoError = error => {
    setisLoadingVideo(false);
  };

  /**
   * Updates the playback status with the current time and duration.
   * @param {object} playbackStatus - The playback status object.
   * @returns None
   */
  const PlayBackStatusUpdate = playbackStatus => {
    try {
      let currentTime = playbackStatus.currentTime;
      let duration = playbackStatus.seekableDuration;
      if (currentTime) {
        if (duration) {
          setprogress(currentTime);
        }
      }
    } catch (error) {}
  };

  /**
   * Callback function that is triggered when the video has finished loading.
   * It updates the duration state with the duration of the video, sets the isLoadingVideo state to false,
   * and seeks the audio player to the beginning of the video.
   * @param {Event} event - The event object containing information about the loaded video.
   * @returns None
   */
  const onLoadComplete = event => {
    setduration(event.duration);
    setisLoadingVideo(false);
    if (audioPlayer.current) {
      audioPlayer.current.seek(0);
    }
  };

  return useMemo(
    () => (
      <View
        style={[
          styles.mainContainer,
          {height: windowHeight, width: windowWidth},
        ]}>
        <DefaultBackground bgColor={COLORS.primaryDark} />
        <Video
          ref={audioPlayer}
          source={{
            uri: url,
          }}
          ignoreSilentSwitch={'ignore'}
          // style={VideoDimensions}
          style={{width: 0, height: 0}}
          resizeMode="contain"
          onError={videoError}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={1000}
          useTextureView={true}
          paused={paused}
          muted={isMuted}
          repeat={isRepeatVideo}
          onLoad={onLoadComplete}
          onBuffer={() => {}}
          onLoadStart={val => {
            setisLoadingVideo(true);
          }}
          onProgress={PlayBackStatusUpdate}
          onEnd={() => {
            audioPlayer.current.seek(0);
            onFinishPlaying(index);
          }}
        />
      </View>
    ),
    [
      url,
      index,
      paused,
      isMuted,
      isRepeatVideo,
      mediaHeight,
      progress,
      duration,
    ],
  );
}

export default AudioNugget;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
