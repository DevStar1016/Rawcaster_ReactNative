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

  const videoError = error => {
    setisLoadingVideo(false);
  };

  const PlayBackStatusUpdate = playbackStatus => {
    try {
      let currentTime = Math.round(playbackStatus.currentTime);
      let duration = Math.round(playbackStatus.seekableDuration);
      if (currentTime)
        if (duration) setprogress((currentTime / duration) * 100);
    } catch (error) {}
  };

  const onLoadComplete = event => {
    setduration(event.duration * 1000);
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
          onBuffer={() => {
            console.log('BUFFERINg');
          }}
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
