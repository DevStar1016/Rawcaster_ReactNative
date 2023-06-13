import {Pressable, StatusBar, StyleSheet, View} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import {COLORS} from '../../../../Utilities/Colors';
import {DIMENSIONS, IS_IOS} from '../../../../Utilities/Constants';
import {useInsets} from '../../../../Utilities/StoreData';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../../Utilities/Contexts';
import StyledText from '../../../../Components/StyledText';
import {getMediaDurationFormat} from '../../../../Utilities/Methods';

function VideoNugget({
  videoPlayer,
  url,
  index,
  paused,
  progress,
  setprogress,
  duration,
  setisLoadingVideo,
  setduration,
}) {
  // const videoPlayer = useRef(null);
  const {isMuted, mediaHeight} = useNuggetParentActions();
  const {isRepeatVideo, onFinishPlaying} = useNuggetItemActions();
  const insets = useInsets();

  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;
  // const [videoDimensions, setvideoDimensions] = useState({
  //   width: windowWidth,
  //   height: windowWidth,
  // });

  const videoError = error => {
    console.log(error, 'ERROR VIDEO');
    setisLoadingVideo(false);
  };

  const onLoadComplete = event => {
    setduration(event.duration);
    setisLoadingVideo(false);
    // const naturalSize = event.naturalSize;

    // try {
    //   const naturalWidth = naturalSize.width;
    //   const naturalHeight = naturalSize.height;

    //   if (naturalWidth && naturalHeight && naturalWidth > naturalHeight) {
    //     setvideoDimensions({
    //       width: windowWidth,
    //       height: windowWidth * (naturalHeight / naturalWidth),
    //     });
    //   } else if (naturalWidth && naturalHeight) {
    //     setvideoDimensions({
    //       width: windowHeight * (naturalWidth / naturalHeight),
    //       height: windowHeight,
    //     });
    //   }
    //   setduration(event.duration * 1000);
    // } catch (error) {
    //   console.log(error, 'ONLOAD COMPLETE ERROR');
    // }
  };

  // fuction to Go back 10 seconds
  // const onFirstHalfPress = async () => {
  //   try {
  //     if (videoPlayer.current) {
  //       let toSeek = Math.floor((progress * duration) / 100) / 1000;
  //       if (toSeek > 10) videoPlayer.current.seek(toSeek - 10);
  //     }
  //   } catch (error) {}
  // };

  // fuction to skip 10 seconds
  // const onSecondHalfPress = async () => {
  //   try {
  //     if (videoPlayer.current) {
  //       let toSeek = Math.floor((progress * duration) / 100) / 1000;
  //       videoPlayer.current.seek(toSeek + 10);
  //     }
  //   } catch (error) {}
  // };

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

  return useMemo(
    () => (
      <View
        style={[styles.container, {height: windowHeight, width: windowWidth}]}
        // onPress={onMiddlePress}
      >
        {/* <Pressable
            style={[
              styles.firstHalf,
              {width: windowWidth * 0.25, height: windowHeight},
            ]}
            onPress={onFirstHalfPress}
          /> */}
        {/* <Pressable
            style={[
              styles.secondHalf,
              {width: windowWidth * 0.25, height: windowHeight},
            ]}
            onPress={onSecondHalfPress}
          /> */}
        <Video
          ref={videoPlayer}
          source={{
            uri: url,
          }}
          ignoreSilentSwitch={'ignore'}
          // style={VideoDimensions}
          style={{width: windowWidth, height: windowHeight}}
          resizeMode="contain"
          onError={videoError}
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={100}
          useTextureView={true}
          paused={paused}
          muted={isMuted}
          repeat={isRepeatVideo}
          onBuffer={() => {
            // console.log('BUFFERINg');
          }}
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
        {/* <Pressable
            style={{
              padding: 10,
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: 100,
              right: 20,
              borderRadius: 20,
              zIndex: 10000,
            }}
            onPress={() => {
              //   videoPlayer.current.presentFullscreenPlayer();
              setisMuted(pre => !pre);
            }}>
            <Text>{isMuted ? 'Un Mute' : 'Mute'}</Text>
          </Pressable> */}
        {/* {ShowOptions ? <>{GetSlider}</> : null} */}
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

export default VideoNugget;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  firstHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
  },
  secondHalf: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 99,
  },
});
