import {StyleSheet, View} from 'react-native';
import React, {useMemo} from 'react';
import Video from 'react-native-video';
import {COLORS} from '../../../../Utilities/Colors';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {useInsets} from '../../../../Utilities/StoreData';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';
import DefaultBackground from '../../../../Components/DefaultBackground';

function VideoNugget({
  url,
  index,
  paused,
  videoPlayer,
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
   * Updates the playback status based on the provided playback status object.
   * @param {object} playbackStatus - The playback status object.
   * @returns None
   */
  const playBackStatusUpdate = playbackStatus => {
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
   * It updates the duration state variable with the duration of the loaded video
   * and sets the isLoadingVideo state variable to false.
   * @param {Event} event - The event object containing information about the loaded video.
   * @returns None
   */
  const onLoadComplete = event => {
    setduration(event.duration);
    setisLoadingVideo(false);
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
          ref={videoPlayer}
          source={{
            uri: url,
          }}
          ignoreSilentSwitch={'ignore'}
          style={{width: windowWidth, height: windowHeight}}
          resizeMode="contain"
          onError={videoError}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={1000}
          useTextureView={true}
          paused={paused}
          muted={isMuted}
          repeat={isRepeatVideo}
          // repeat={false}
          onBuffer={() => {}}
          onLoadStart={val => {
            setisLoadingVideo(true);
          }}
          onLoad={onLoadComplete}
          onProgress={playBackStatusUpdate}
          onEnd={() => {
            videoPlayer.current.seek(0);
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
      insets.mediaHeight,
    ],
  );
}

export default VideoNugget;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
