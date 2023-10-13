import {
  FlexAlignType,
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import ProfileWithBadge from './ProfileWithBadge';
import SVGIcon from './SVGIcon';
import {useProfile} from '../Utilities/StoreData';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import StyledText from './StyledText';
import {
  getFileName,
  getMediaMimeType,
  secondsToMinutesAndSeconds,
} from '../Utilities/Methods';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {
  handleAudioRecord,
  handlePlayAudio,
} from '../Utilities/AudioPlayerProcess';
import OpacityAnimatedView from './OpacityAnimatedView';
import moment from 'moment';
import RoundedIconButton from './RoundedIconButton';

type FileType = {
  uri: string;
  name: string;
  type: string;
};

type Props = {
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  placeholderText?: string;
  onPermissionRejection?: () => void;
  onPressSend?: (text: string) => void;
  inpuFieldRef?: (e: any) => void;
  isInsideTextChange?: boolean;
  onChangeText?: (text: string) => void;
  text?: string;
  isSearchBar?: boolean;
  containerAlignItems?: FlexAlignType;
  actionsContainerPaddingTop?: number;
  containerHeight?: number;
  isDisableSend?: boolean;
  isVisibleEmoji?: boolean;
  isKeyboardCloseWhenSend?: boolean;
  isVisibleVoiceRecord?: boolean;
  onPressEmoji?: () => void;
  onPressSearch?: () => void;
  onSendAudio?: (audioFile: FileType, duration: number) => void;
  isEnableOnSubmitEditing?: boolean;
  isDisableAudioProcess?: boolean;
  isVisibleSendButton?: boolean;
  isVisibleProfileImage?: boolean;
  containerPaddingHorizontal?: number;
  inputProps?: Omit<
    TextInputProps,
    | 'ref'
    | 'style'
    | 'onChangeText'
    | 'value'
    | 'keyboardType'
    | 'onFocus'
    | 'placeholder'
    | 'placeholderTextColor'
    | 'onSubmitEditing'
  >;
};
const RBSheetTextInput = ({
  onFocus,
  onBlur,
  placeholderText = '',
  onPressSend,
  inpuFieldRef,
  isInsideTextChange = true,
  onChangeText,
  text = '',
  onPermissionRejection,
  isSearchBar = false,
  onSendAudio,
  containerAlignItems = 'center',
  isKeyboardCloseWhenSend = true,
  isVisibleEmoji = true,
  isDisableSend = false,
  onPressEmoji,
  onPressSearch,
  containerHeight = 45,
  isVisibleVoiceRecord = false,
  isEnableOnSubmitEditing = false,
  inputProps,
  actionsContainerPaddingTop,
  isDisableAudioProcess,
  isVisibleSendButton = true,
  isVisibleProfileImage = true,
  containerPaddingHorizontal = 0,
}: Props) => {
  const audioPlayer = useRef(new AudioRecorderPlayer()).current;
  const profile = useProfile();
  const [recordingAudioUniqueId, setrecordingAudioUniqueId] = useState('');
  const [isRecording, setisRecording] = useState<boolean>(false);
  const [isPlaying, setisPlaying] = useState<boolean>(false);
  const [recordingSeconds, setrecordingSeconds] = useState<number>(0);
  const [playingSeconds, setplayingSeconds] = useState<number>(0);
  const [recordedAudio, setrecordedAudio] = useState<string | null>(null);
  const [typedText, settypedText] = useState<string>('');
  useEffect(() => {
    return () => {
      if (isRecording) {
        handleStopRecording();
      }
      if (isPlaying) {
        handleStopPlaying();
      }
    };
  }, []);

  useEffect(() => {
    if (isDisableAudioProcess) {
      if (isRecording) {
        handleStopRecording();
      }
      if (isPlaying) {
        handleStopPlaying();
      }
    }
  }, [isDisableAudioProcess]);

  useEffect(() => {
    if (isPlaying && playingSeconds >= recordingSeconds) {
      setisPlaying(false);
      setplayingSeconds(recordingSeconds);
    }
  }, [playingSeconds]);

  function handleSubmit() {
    if (recordedAudio) {
      if (onSendAudio) {
        onSendAudio(
          {
            name: getFileName(recordedAudio),
            uri: recordedAudio,
            type: getMediaMimeType(recordedAudio, 'audio'),
          },
          recordingSeconds,
        );
        setrecordedAudio(null);
      }
      if (isRecording) {
        handleStopRecording();
        setrecordingSeconds(0);
      }
      if (isPlaying) {
        handleStopPlaying();
        setplayingSeconds(0);
      }
    } else {
      if (
        (isInsideTextChange && typedText.trim()) ||
        (!isInsideTextChange && text.trim())
      ) {
        if (isKeyboardCloseWhenSend) {
          Keyboard.dismiss();
        }
        if (onPressSend) {
          onPressSend(isInsideTextChange ? typedText.trim() : text.trim());
        }
        if (isInsideTextChange) {
          settypedText('');
        }
      }
    }
  }

  function handleStopPlaying() {
    try {
      audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    } catch (e) {
    } finally {
      setisPlaying(false);
    }
  }

  function handleStopRecording() {
    try {
      audioPlayer.stopRecorder();
      audioPlayer.removeRecordBackListener();
    } catch (e) {
    } finally {
      setisRecording(false);
    }
  }

  function handleDeleteAudio() {
    if (isRecording) {
      handleStopRecording();
      setrecordingSeconds(0);
    } else if (isPlaying) {
      handleStopPlaying();
      setplayingSeconds(0);
    }
    setrecordedAudio(null);
  }

  const getUniqueId = () => {
    return (
      profile?.user_id +
      '' +
      moment.utc().format('x') +
      '' +
      Math.floor(Math.random() * 10000 + 1)
    );
  };

  return (
    <View
      style={[
        styles.inputContainer,
        {
          height: containerHeight,
          alignItems: containerAlignItems,
          paddingHorizontal: containerPaddingHorizontal,
        },
      ]}>
      {recordedAudio || isRecording || isPlaying ? (
        <View
          style={[
            styles.recordTimerMicIconContainer,
            {paddingTop: (actionsContainerPaddingTop ?? 0) + 3},
          ]}>
          <OpacityAnimatedView
            opacityMinimumValue={
              recordedAudio && (isRecording || isPlaying) ? 0.3 : 1
            }>
            <SVGIcon
              icon="mic_fill_secondary"
              marginRight={5}
              height={20}
              width={20}
            />
          </OpacityAnimatedView>
          <StyledText style={{color: COLORS.white}}>
            {secondsToMinutesAndSeconds(
              isRecording
                ? recordingSeconds
                : isPlaying
                ? playingSeconds
                : recordedAudio
                ? recordingSeconds
                : 0,
            )}
          </StyledText>
        </View>
      ) : (
        isVisibleProfileImage && (
          <ProfileWithBadge
            profileSize={35}
            profileImage={profile?.profile_image}
          />
        )
      )}
      {!recordedAudio && !isRecording && !isPlaying && (
        <BottomSheetTextInput
          ref={inpuFieldRef}
          style={styles.input}
          onChangeText={isInsideTextChange ? settypedText : onChangeText}
          value={isInsideTextChange ? typedText : text}
          keyboardType="twitter"
          onFocus={onFocus}
          placeholder={placeholderText}
          placeholderTextColor={COLORS.placeHolderColor}
          onSubmitEditing={() => {
            if (isEnableOnSubmitEditing) {
              handleSubmit();
            }
          }}
          onBlur={onBlur}
          {...inputProps}
        />
      )}
      {isSearchBar ? (
        <RoundedIconButton
          icon="search"
          bgColor={COLORS.secondary}
          disabled={!isInsideTextChange}
          buttonStyle={{marginHorizontal: 5}}
          onPress={onPressSearch}
        />
      ) : (
        <View
          style={[
            styles.actionsContainer,
            {paddingTop: actionsContainerPaddingTop},
          ]}>
          {isVisibleVoiceRecord &&
            ((isInsideTextChange && !typedText) ||
              (!isInsideTextChange && !text)) && (
              <>
                <SVGIcon
                  icon={
                    isRecording || isPlaying
                      ? 'stop_rounded_white'
                      : recordedAudio
                      ? 'play_fill_white'
                      : 'mic_fill_white'
                  }
                  marginRight={12}
                  height={22}
                  width={22}
                  isButton={!isDisableAudioProcess}
                  onPress={() => {
                    if (isRecording) {
                      handleStopRecording();
                    } else if (isPlaying) {
                      handleStopPlaying();
                    } else {
                      if (recordedAudio) {
                        handlePlayAudio({
                          audioPlayer,
                          setisPlaying,
                          setplayingSeconds,
                          audioUniqueId: recordingAudioUniqueId,
                        });
                      } else {
                        Keyboard.dismiss();
                        setrecordingSeconds(0);
                        const uniqueId = getUniqueId();
                        setrecordingAudioUniqueId(uniqueId);
                        handleAudioRecord({
                          audioPlayer,
                          onPermissionRejection,
                          setisRecording,
                          setrecordedAudio,
                          setrecordingSeconds,
                          maxRecordingTimeInSeconds: 119,
                          onLimitReached: handleStopRecording,
                          audioUniqueId: uniqueId,
                        });
                      }
                    }
                  }}
                />
                {recordedAudio && (
                  <SVGIcon
                    icon={'delete_white'}
                    marginRight={5}
                    height={22}
                    width={22}
                    isButton
                    onPress={() => {
                      handleDeleteAudio();
                    }}
                  />
                )}
              </>
            )}

          {isVisibleEmoji && !isRecording && (
            <SVGIcon
              icon="emojee"
              marginRight={5}
              isButton
              onPress={() => {
                Keyboard.dismiss();
                if (onPressEmoji) {
                  onPressEmoji();
                }
              }}
            />
          )}
          {isVisibleSendButton && (
            <SVGIcon
              icon="send"
              marginRight={5}
              isButton={!isDisableSend}
              height={27}
              width={27}
              onPress={handleSubmit}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default RBSheetTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 45,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  input: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
    fontFamily: FONTS.DMSans.regular,
    fontSize: 15,
    color: COLORS.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  recordTimerMicIconContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
});
