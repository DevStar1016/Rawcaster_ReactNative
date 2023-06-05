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

type AudioPlayProps = {
  audioPlayer: any;
  setisPaused?: (val: boolean) => void;
  setisPlaying?: (val: boolean) => void;
  setplayingSeconds?: (val: number) => void;
};

type AudioRecordProps = {
  audioPlayer: any;
  setisPaused?: (val: boolean) => void;
  setisRecording?: (val: boolean) => void;
  setrecordedAudio?: (val: string) => void;
  setrecordingSeconds?: (val: number) => void;
};

export const handleAudioRecord = async ({
  audioPlayer,
  setisPaused = () => {},
  setisRecording = () => {},
  setrecordedAudio = () => {},
  setrecordingSeconds = () => {},
}: AudioRecordProps) => {
  const isGrantedPermission = await isHavePermissionToRecordAudio();
  if (isGrantedPermission) {
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
      audioPlayer?.addRecordBackListener((e: any) => {
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

export const handlePlayAudio = async ({
  audioPlayer,
  setisPaused = () => {},
  setisPlaying = () => {},
  setplayingSeconds = () => {},
}: AudioPlayProps) => {
  try {
    const dirs = RNFetchBlob.fs.dirs;
    const path = Platform.select({
      ios: 'rawcaster_recorded_audio.m4a',
      android: `${dirs.CacheDir}/rawcaster_recorded_audio.mp3`,
    });
    setisPaused(false);
    setisPlaying(true);
    await audioPlayer.startPlayer(path);
    audioPlayer.addPlayBackListener((e: any) => {
      console.log(e, 'PLAYING');

      if (Math.floor(e.currentPosition / 1000) >= 0) {
        setplayingSeconds(Math.floor(e.currentPosition / 1000));
      }

      return;
    });
  } catch (e) {
    console.log(e, 'ERROR');
    setisPlaying(false);
  }
};
