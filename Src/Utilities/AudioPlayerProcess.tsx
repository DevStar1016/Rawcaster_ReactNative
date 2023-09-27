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
import {Camera} from 'react-native-vision-camera';
import Toast from '../Components/Toast';

type AudioPlayProps = {
  audioPlayer: any;
  setisPaused?: (val: boolean) => void;
  setisPlaying?: (val: boolean) => void;
  setplayingSeconds?: (val: number) => void;
  audioUniqueId?: string | number;
};

type AudioRecordProps = {
  audioPlayer: any;
  setisPaused?: (val: boolean) => void;
  setisRecording?: (val: boolean) => void;
  setrecordedAudio?: (val: string) => void;
  setrecordingSeconds?: (val: number) => void;
  onLimitReached?: () => void;
  audioUniqueId?: string | number;
  maxRecordingTimeInSeconds?: number;
};

export const handleAudioRecord = async ({
  audioPlayer,
  setisPaused = () => {},
  setisRecording = () => {},
  setrecordedAudio = () => {},
  setrecordingSeconds = () => {},
  maxRecordingTimeInSeconds = 150,
  onLimitReached,
  audioUniqueId = '',
}: AudioRecordProps) => {
  const newMicrophonePermission = await Camera.requestMicrophonePermission();
  const isGrantedPermission = await isHavePermissionToRecordAudio();
  if (isGrantedPermission && newMicrophonePermission === 'authorized') {
    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: `rawcaster_recorded_audio${audioUniqueId}.m4a`,
      android: `${dirs.CacheDir}/rawcaster_recorded_audio${audioUniqueId}.mp3`,
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
      audioPlayer?.addRecordBackListener((e: any) => {
        if (
          maxRecordingTimeInSeconds &&
          Math.floor(e.currentPosition / 1000) > maxRecordingTimeInSeconds
        ) {
          if (onLimitReached) {
            onLimitReached();
          }
        } else if (Math.floor(e.currentPosition / 1000) >= 0) {
          setrecordingSeconds(Math.floor(e.currentPosition / 1000));
        }
        return;
      });
    } catch (e) {
      console.log(e, 'ERRORRRR');
      setisRecording(false);
    }
  } else {
    Toast.fail('Permission Denied');
  }
};

export const handlePlayAudio = async ({
  audioPlayer,
  setisPaused = () => {},
  setisPlaying = () => {},
  setplayingSeconds = () => {},
  audioUniqueId = '',
}: AudioPlayProps) => {
  try {
    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: `rawcaster_recorded_audio${audioUniqueId}.m4a`,
      android: `${dirs.CacheDir}/rawcaster_recorded_audio${audioUniqueId}.mp3`,
    });
    setisPaused(false);
    setisPlaying(true);
    await audioPlayer.startPlayer(path);
    audioPlayer.addPlayBackListener((e: any) => {
      if (Math.floor(e.currentPosition / 1000) >= 0) {
        setplayingSeconds(Math.floor(e.currentPosition / 1000));
      }

      return;
    });
  } catch (e) {
    setisPlaying(false);
  }
};
