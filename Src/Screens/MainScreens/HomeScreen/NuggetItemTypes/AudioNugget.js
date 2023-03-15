import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {DIMENSIONS} from '../../../../Utilities/Constants';
import {COLORS} from '../../../../Utilities/Colors';
import DefaultBackground from '../../../../Components/DefaultBackground';
import {useInsets} from '../../../../Utilities/StoreData';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
const audioRecorderPlayer = new AudioRecorderPlayer();
var eventListener = undefined;
const AudioNugget = ({
  url,
  paused,
  isMuted,
  onFinishPlaying,
  index,
  mediaHeight,
}) => {
  const insets = useInsets();
  const windowHeight = mediaHeight ?? insets.mediaHeight;
  const windowWidth = DIMENSIONS.window.width;

  useEffect(() => {
    if (paused) {
      stopPlayer();
    } else {
      startPlayer();
    }
  }, [paused]);

  useEffect(() => {
    setPlayerVolume();
  }, [isMuted, paused]);

  const setPlayerVolume = async () => {
    if (!paused) {
      try {
        await audioRecorderPlayer.setVolume(isMuted ? 0.0 : 1.0);
      } catch (e) {
        console.log(e, 'ERROR SET VOLUME');
      }
    }
  };

  const stopPlayer = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    } catch (e) {
      console.log(e, 'STOP ERROR');
    }
  };

  const startPlayer = async () => {
    audioRecorderPlayer
      .startPlayer(url)
      .then(res => {
        setPlayerVolume();
        audioRecorderPlayer.addPlayBackListener(e => {
          console.log('playBackListener', e);
          if (e.currentPosition === e.duration) {
            stopPlayer();
            onFinishPlaying(index);
          }
        });

        console.log(res, 'AUDIO PLAY');
      })
      .catch(e => {
        console.log('startPlayer error', err.message);
      });
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {height: windowHeight, width: windowWidth},
      ]}>
      <DefaultBackground />
    </View>
  );
};

export default AudioNugget;

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
});
