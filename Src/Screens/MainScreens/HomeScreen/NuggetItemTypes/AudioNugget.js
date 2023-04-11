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

function AudioNugget({url, index, paused}) {
  const {isMuted, mediaHeight} = useNuggetParentActions();
  const {isRepeatVideo, onFinishPlaying} = useNuggetItemActions();
  const videoPlayer = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setduration] = useState(0);
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;
  const [videoDimensions, setvideoDimensions] = useState({
    width: windowWidth,
    height: windowWidth,
  });

  const videoError = error => {
    console.log(error, 'ERROR VIDEO');
  };

  const PlayBackStatusUpdate = playbackStatus => {
    try {
      let currentTime = Math.round(playbackStatus.currentTime);
      let duration = Math.round(playbackStatus.seekableDuration);
      if (currentTime)
        if (duration) setProgress((currentTime / duration) * 100);
    } catch (error) {}
  };

  const onLoadComplete = event => {
    const naturalSize = event.naturalSize;

    try {
      const naturalWidth = naturalSize.width;
      const naturalHeight = naturalSize.height;

      if (naturalWidth && naturalHeight && naturalWidth > naturalHeight) {
        setvideoDimensions({
          width: windowWidth,
          height: windowWidth * (naturalHeight / naturalWidth),
        });
      } else if (naturalWidth && naturalHeight) {
        setvideoDimensions({
          width: windowHeight * (naturalWidth / naturalHeight),
          height: windowHeight,
        });
      }
      setduration(event.duration * 1000);
    } catch (error) {
      console.log(error, 'ONLOAD COMPLETE ERROR');
    }
  };

  return useMemo(
    () => (
      <View
        style={[
          styles.mainContainer,
          {height: windowHeight, width: windowWidth},
        ]}>
        <DefaultBackground />
        <Video
          ref={videoPlayer}
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
          onProgress={PlayBackStatusUpdate}
          onEnd={() => {
            videoPlayer.current.seek(0);
            onFinishPlaying(index);
          }}
        />
      </View>
    ),
    [url, index, paused, isMuted, isRepeatVideo, mediaHeight],
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
