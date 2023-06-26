import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import {TextInput} from 'react-native-gesture-handler';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import EmojiContainer from 'react-native-emoji-container';
import {WINDOW_HEIGHT} from '@gorhom/bottom-sheet';
import {Camera} from 'react-native-vision-camera';
import Toast from '../../../Components/Toast';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import moment from 'moment';
import {useProfile} from '../../../Utilities/StoreData';
import {handleAudioRecord} from '../../../Utilities/AudioPlayerProcess';

type Document = {
  uri: string;
  type: string | null;
  name: string | null;
};

type Props = {
  onPressSend: (value: string) => void;
  onSendMedia: (item: any) => void;
  onSelectDocuments: (documentsList: Document[]) => void;
  onPressAudio: () => void;
};

const ChatTextInput = ({
  onPressSend,
  onPressAudio,
  onSendMedia,
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
      .catch(e => {
        console.log(e, 'ERRORRR');
      });
  };

  return (
    <>
      <View style={styles.mainContainer}>
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

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputBox}
            value={message}
            onChangeText={setmessage}
            placeholder="type message here..."
            onFocus={() => {
              setisOpenEmoji(false);
            }}
          />
        </View>
        <View style={styles.actionButtonsContainer}>
          {isRecording || isPlaying ? (
            <>
              <SVGIcon
                icon="stop_rounded_primary"
                marginRight={10}
                isButton
                onPress={handleStopRecording}
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
              if (message.length > 0) {
                onPressSend(message);
                setmessage('');
              } else {
                Keyboard.dismiss();
                setmessage('');
                setrecordingSeconds(0);
                handleAudioRecord({
                  audioPlayer,
                  setisRecording,
                  setrecordedAudio,
                  setrecordingSeconds,
                  maxRecordingTimeInSeconds: 119,
                  onLimitReached: handleStopRecording,
                  audioUniqueId: getUniqueId(),
                });
              }
            }}
            activeOpacity={0.8}>
            {message.length > 0 || isRecording ? (
              <SVGIcon icon="send" />
            ) : (
              <SVGIcon icon="mic_fill_white" height={20} width={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isOpenEmoji && (
        <View style={[styles.emojiContainer]}>
          <EmojiContainer
            enableTitle={false}
            numColumns={7}
            onPressEmoji={emojiData => {
              setmessage(preMsg => preMsg + emojiData.emoji);
            }}
          />
        </View>
      )}

      <Modal
        visible={isOpenCamera}
        statusBarTranslucent
        transparent
        animationType="slide"
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginHorizontal: 10,
    // paddingHorizontal: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    height: 45,
  },
  inputBox: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    flex: 1,
    backgroundColor: COLORS.white,
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
    height: WINDOW_HEIGHT / 2 - 120,
    backgroundColor: COLORS.white,
  },
});
