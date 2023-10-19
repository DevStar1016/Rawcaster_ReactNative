import {
  Keyboard,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import {TextInput} from 'react-native-gesture-handler';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import {Camera} from 'react-native-vision-camera';
import Toast from '../../../Components/Toast';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import moment from 'moment';
import {useProfile} from '../../../Utilities/StoreData';
import {
  handleAudioRecord,
  handlePlayAudio,
} from '../../../Utilities/AudioPlayerProcess';
import StyledText from '../../../Components/StyledText';
import {secondsToMinutesAndSeconds} from '../../../Utilities/Methods';
import OpacityAnimatedView from '../../../Components/OpacityAnimatedView';
import {DIMENSIONS} from '../../../Utilities/Constants';
import {EmojiKeyboard} from 'rn-emoji-keyboard';

type Document = {
  uri: string;
  type: string | null;
  name: string | null;
};

type Props = {
  onPressSend: (value: string) => void;
  onSendMedia: (item: any) => void;
  onSendAudio: (item: any) => void;
  onSelectDocuments: (documentsList: Document[]) => void;
};

const ChatTextInput = ({
  onPressSend,
  onSendMedia,
  onSendAudio,
  onSelectDocuments,
}: Props) => {
  const profile = useProfile();
  const audioPlayer = useRef(new AudioRecorderPlayer()).current;
  const [message, setmessage] = useState<string>('');
  const [isOpenEmoji, setisOpenEmoji] = useState<boolean>(false);
  const [isOpenCamera, setisOpenCamera] = useState<boolean>(false);
  const [isRecording, setisRecording] = useState<boolean>(false);
  const [isPlaying, setisPlaying] = useState<boolean>(false);
  const [recordingSeconds, setrecordingSeconds] = useState<number>(0);
  const [playingSeconds, setplayingSeconds] = useState<number>(0);
  const [recordedAudio, setrecordedAudio] = useState<string | null>(null);
  const [recordingAudioUniqueId, setrecordingAudioUniqueId] = useState('');

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
    if (isPlaying && playingSeconds >= recordingSeconds) {
      setisPlaying(false);
      setplayingSeconds(recordingSeconds);
    }
  }, [playingSeconds]);

  /**
   * Handles the stop playing action by stopping the audio player, removing the playback listener,
   * and setting the isPlaying state to false.
   * @returns None
   */
  function handleStopPlaying() {
    try {
      audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    } catch (e) {
    } finally {
      setisPlaying(false);
    }
  }

  /**
   * Stops the audio recording and removes the record back listener.
   * @returns None
   */
  function handleStopRecording() {
    try {
      audioPlayer.stopRecorder();
      audioPlayer.removeRecordBackListener();
    } catch (e) {
    } finally {
      setisRecording(false);
    }
  }

  /**
   * Handles the deletion of audio.
   * If audio is currently being recorded, stops the recording and resets the recording seconds.
   * If audio is currently being played, stops the playback and resets the playing seconds.
   * Sets the recorded audio to null.
   * @returns None
   */
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

  /**
   * Generates a unique ID by combining the user ID, current timestamp, and a random number.
   * @returns {string} - A unique ID string.
   */
  const getUniqueId = () => {
    return (
      profile?.user_id +
      '' +
      moment.utc().format('x') +
      '' +
      Math.floor(Math.random() * 10000 + 1)
    );
  };

  /**
   * Handles the action of opening the camera.
   * Requests camera and microphone permissions and sets the state of isOpenCamera to true if both permissions are granted.
   * Displays an error toast message if any of the permissions are denied.
   * @returns None
   */
  const handleOpenCamera = async () => {
    try {
      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      if (
        newCameraPermission === 'authorized' &&
        newMicrophonePermission === 'authorized'
      ) {
        setisOpenCamera(true);
      } else {
        if (newCameraPermission === 'denied') {
          Toast.fail('Camera Permission Denied');
        } else if (newMicrophonePermission === 'denied') {
          Toast.fail('Microphone Permission Denied');
        } else {
          Toast.fail('Permissions Denied');
        }
      }
    } catch (e: any) {
      Toast.fail(e.message);
    }
  };

  /**
   * Handles the selection of multiple documents using the DocumentPicker library.
   * @returns None
   */
  const handlePickDocument = () => {
    DocumentPicker.pick({
      allowMultiSelection: true,
      type: DocumentPicker.types.allFiles,
    })
      .then(mediaList => {
        Promise.all(
          mediaList.map(async item => {
            return {
              uri: item.uri,
              name: item.name,
              type: item.type,
            };
          }),
        )
          .then((resMediaList: Document[]) => {
            onSelectDocuments([...resMediaList]);
          })
          .catch(e => {
            Toast.fail(e.message);
          });
      })
      .catch(e => {});
  };

  return (
    <>
      <View style={styles.mainContainer}>
        {recordedAudio || isRecording || isPlaying ? (
          <View style={styles.recordTimerMicIconContainer}>
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
            <StyledText style={{color: COLORS.red}}>
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
          <View
            style={{
              alignItems: 'flex-end',
              flexDirection: 'row',
              height: '100%',
              paddingVertical: 12,
            }}>
            <SVGIcon
              icon="emoji_dark"
              marginRight={5}
              marginLeft={10}
              isButton
              onPress={() => {
                Keyboard.dismiss();
                setisOpenEmoji(pre => !pre);
              }}
            />
          </View>
        )}

        {!recordedAudio && !isRecording && !isPlaying && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputBox}
              value={message}
              multiline
              onChangeText={setmessage}
              placeholder="type message here..."
              onFocus={() => {
                setisOpenEmoji(false);
              }}
            />
          </View>
        )}
        <View style={styles.actionButtonsContainer}>
          {isRecording || isPlaying || recordedAudio ? (
            <>
              <SVGIcon
                icon={
                  isRecording || isPlaying
                    ? 'stop_rounded_primary'
                    : 'play_fill_primary'
                }
                marginRight={10}
                isButton
                onPress={() => {
                  if (isRecording) {
                    handleStopRecording();
                  } else if (isPlaying) {
                    handleStopPlaying();
                  } else {
                    handlePlayAudio({
                      audioPlayer,
                      setisPlaying,
                      setplayingSeconds,
                      audioUniqueId: recordingAudioUniqueId,
                    });
                  }
                }}
              />
              <SVGIcon
                icon="delete_red"
                marginRight={10}
                isButton
                onPress={handleDeleteAudio}
              />
            </>
          ) : (
            <>
              {message.length === 0 ? (
                <SVGIcon
                  icon="camera_fill_primary"
                  marginRight={10}
                  isButton
                  onPress={handleOpenCamera}
                />
              ) : null}
              <SVGIcon
                icon="upload_fill_orange"
                marginRight={10}
                isButton
                onPress={handlePickDocument}
              />
            </>
          )}
          <TouchableOpacity
            style={styles.sendButtonContainer}
            onPress={() => {
              if (message.length > 0 || recordedAudio) {
                if (recordedAudio) {
                  onSendAudio(recordedAudio);
                  handleDeleteAudio();
                } else {
                  onPressSend(message);
                  setmessage('');
                }
              } else {
                Keyboard.dismiss();
                setmessage('');
                setrecordingSeconds(0);
                const uniqueId = getUniqueId();
                setrecordingAudioUniqueId(uniqueId);
                handleAudioRecord({
                  audioPlayer,
                  setisRecording,
                  setrecordedAudio,
                  setrecordingSeconds,
                  maxRecordingTimeInSeconds: 119,
                  onLimitReached: handleStopRecording,
                  audioUniqueId: uniqueId,
                });
              }
            }}
            activeOpacity={0.8}>
            {message.length > 0 || isRecording || isPlaying || recordedAudio ? (
              <SVGIcon icon="send" />
            ) : (
              <SVGIcon icon="mic_fill_white" height={20} width={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isOpenEmoji && (
        <View style={[styles.emojiContainer]}>
          <EmojiKeyboard
            onEmojiSelected={res => {
              setmessage(pre => pre + res.emoji);
            }}
            // enableSearchBar
            // disabledCategories={['people_body', 'flags']}
            categoryPosition="bottom"
            enableCategoryChangeGesture={false}
            defaultHeight={'100%'}
            emojiSize={25}
            styles={{
              header: {fontFamily: FONTS.DMSans.medium},
              // container
              // container: {width: },
            }}
          />
        </View>
      )}

      <Modal
        visible={isOpenCamera}
        statusBarTranslucent
        transparent
        onRequestClose={() => {
          setisOpenCamera(false);
        }}>
        <CustomCameraView
          setModal={setisOpenCamera}
          onSendMedia={onSendMedia}
        />
      </Modal>
    </>
  );
};

export default ChatTextInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginHorizontal: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    maxHeight: 100,
  },
  inputBox: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 45,
  },
  sendButtonContainer: {
    borderRadius: 45 / 2,
    height: 45,
    width: 45,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    marginRight: 10,
  },
  emojiContainer: {
    height: DIMENSIONS.window.height / 2,
    backgroundColor: COLORS.white,
  },
  recordTimerMicIconContainer: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
});
