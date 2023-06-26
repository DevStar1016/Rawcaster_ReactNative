import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
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
  const [message, setmessage] = useState<string>('');
  const [isOpenEmoji, setisOpenEmoji] = useState<boolean>(false);
  const [isOpenCamera, setisOpenCamera] = useState<boolean>(false);

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
          {message.length === 0 ? (
            <TouchableOpacity
              style={styles.actionButtons}
              activeOpacity={0.8}
              onPress={handleOpenCamera}>
              <SVGIcon icon="camera_fill_primary" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.actionButtons}
            activeOpacity={0.8}
            onPress={handlePickDocument}>
            <SVGIcon icon="upload_fill_orange" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButtonContainer}
            onPress={() => {
              if (message.length > 0) {
                onPressSend(message);
                setmessage('');
              } else {
                onPressAudio();
              }
            }}
            activeOpacity={0.8}>
            {message.length > 0 ? (
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
