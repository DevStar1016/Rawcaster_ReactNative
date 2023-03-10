import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
} from 'react-native-audio-recorder-player';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import {
  getFileName,
  getMediaMimeType,
  getMinutesSecondsFormate,
} from '../Utilities/Methods';
import {FONTS} from '../Utilities/Fonts';
import BOX_SHADOW from '../Utilities/BoxShadow';

const AudioRecorder = ({setModal, onSubmitAudio}) => {
  const audioPlayer = useRef(new AudioRecorderPlayer()).current;
  const [recordingSeconds, setrecordingSeconds] = useState(0);
  const [playingSeconds, setplayingSeconds] = useState(0);
  const [isRecording, setisRecording] = useState(false);
  const [isPlaying, setisPlaying] = useState(false);
  const [recordedAudio, setrecordedAudio] = useState(undefined);
  const [isPaused, setisPaused] = useState(false);

  useEffect(() => {
    return () => {
      handleStopPlayer();
      handleStopAudioRecord();
    };
  }, []);

  useEffect(() => {
    if (isPlaying && playingSeconds >= recordingSeconds) {
      setisPlaying(false);
    }
  }, [playingSeconds]);

  const handleAudioRecord = async () => {
    try {
      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVModeIOS: AVModeIOSOption.measurement,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };
      const meteringEnabled = false;
      setisPaused(false);
      setisRecording(true);
      const result = await audioPlayer.startRecorder(
        recordedAudio,
        audioSet,
        meteringEnabled,
      );
      setrecordedAudio(result);
      audioPlayer.addRecordBackListener(e => {
        if (Math.floor(e.currentPosition / 1000) >= 0) {
          setrecordingSeconds(Math.floor(e.currentPosition / 1000));
        }
        return;
      });
    } catch (e) {
      setisRecording(false);
    }
  };

  const handleStopAudioRecord = () => {
    try {
      audioPlayer.stopRecorder();
      audioPlayer.removeRecordBackListener();
    } catch (e) {
    } finally {
      setisRecording(false);
      setisPaused(false);
    }
  };

  const handlePlayRecordedAudio = async () => {
    try {
      setisPaused(false);
      setisPlaying(true);
      await audioPlayer.startPlayer();
      audioPlayer.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition / 1000) >= 0) {
          setplayingSeconds(Math.floor(e.currentPosition / 1000));
        }
        return;
      });
    } catch (e) {
      setisPlaying(false);
    }
  };

  const handleStopPlayer = () => {
    try {
      audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    } catch (e) {
    } finally {
      console.log('FINALLY');
      setisPlaying(false);
      setisPaused(false);
    }
  };

  const handlePauseRecorder = async () => {
    try {
      await audioPlayer.pauseRecorder();
      setisPaused(true);
    } catch (e) {}
  };

  const handlePausePlayer = async () => {
    try {
      await audioPlayer.pausePlayer();
      setisPaused(true);
    } catch (e) {}
  };

  const ActionButton = ({onPress, icon, marginLeft = 0, iconSize = 15}) => {
    return (
      <TouchableOpacity
        style={styles.actionButton}
        activeOpacity={0.7}
        onPress={onPress}>
        <SVGIcon
          icon={icon}
          height={iconSize}
          width={iconSize}
          marginLeft={marginLeft}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <View style={styles.titleContainer}>
          <View style={{width: '20%', alignItems: 'flex-start'}}>
            <TouchableOpacity
              style={styles.headerButton}
              activeOpacity={0.7}
              onPress={() => {
                setModal(false);
              }}>
              <SVGIcon icon="close" />
            </TouchableOpacity>
          </View>
          <View style={{flex: 1, alignItems: 'center'}}>
            <StyledText style={styles.timerText}>
              {getMinutesSecondsFormate(
                isPlaying ? playingSeconds : recordingSeconds,
              )}
            </StyledText>
          </View>
          <View
            style={{
              width: '20%',
              alignItems: 'flex-end',
            }}>
            {recordedAudio && recordingSeconds >= 2 ? (
              <TouchableOpacity
                style={[styles.headerButton, {padding: 5}]}
                activeOpacity={0.7}
                onPress={() => {
                  handleStopAudioRecord();
                  onSubmitAudio({
                    name: getFileName(recordedAudio),
                    uri: recordedAudio,
                    type: getMediaMimeType(recordedAudio, 'audio'),
                  });
                  setModal(false);
                }}>
                <SVGIcon icon="tick_black" height={18} width={18} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={styles.actionButtonsContainer}>
          {isRecording || isPlaying ? (
            <>
              {/* <ActionButton
                onPress={() => {
                  if (isRecording) {
                    if (isPaused) {
                      handleAudioRecord();
                    } else {
                      handlePauseRecorder();
                    }
                  } else if (isPlaying) {
                    if (isPaused) {
                      handlePlayRecordedAudio();
                    } else {
                      handlePausePlayer();
                    }
                  }
                }}
                icon={isPaused ? 'play_fill_primary' : 'pause_fill_primary'}
              /> */}
              <ActionButton
                onPress={() => {
                  console.log(isRecording, isPlaying, 'ISRECORDING');
                  if (isRecording) {
                    handleStopAudioRecord();
                  } else if (isPlaying) {
                    handleStopPlayer();
                  }
                }}
                icon={'stop_fill_primary'}
              />
            </>
          ) : recordedAudio ? (
            <ActionButton
              onPress={() => {
                handlePlayRecordedAudio();
              }}
              icon={'play_fill_primary'}
              marginLeft={5}
            />
          ) : (
            <ActionButton
              onPress={() => {
                handleAudioRecord();
              }}
              icon={'mic_fill_primary'}
              iconSize={20}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default AudioRecorder;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subContainer: {
    width: '90%',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 5,
    width: '80%',
    alignSelf: 'center',
    paddingTop: 15,
  },
  actionButton: {
    height: 40,
    width: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...BOX_SHADOW,
  },
  timerText: {
    color: COLORS.red,
    fontSize: 17,
    fontFamily: FONTS.DMSans.medium,
    paddingVertical: 5,
  },
});
