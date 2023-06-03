import {Platform} from 'react-native';
import {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import {isHavePermissionToRecordAudio} from './Permissions';
export const handleAudioRecord = async ({
  audioPlayer,
  setisPaused = () => {},
  setisRecording = () => {},
  setrecordedAudio = () => {},
  setrecordingSeconds = () => {},
}) => {
  if (isHavePermissionToRecordAudio()) {
    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: 'rawcaster_recorded_audio.m4a',
      android: `${dirs.CacheDir}/rawcaster_recorded_audio.mp3`,
    });
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
      const result = await audioPlayer?.startRecorder(
        path,
        audioSet,
        meteringEnabled,
      );

      setrecordedAudio(result);
      audioPlayer?.addRecordBackListener(e => {
        if (Math.floor(e.currentPosition / 1000) >= 0) {
          setrecordingSeconds(Math.floor(e.currentPosition / 1000));
        }
        return;
      });
    } catch (e) {
      setisRecording(false);
    }
  }
};
