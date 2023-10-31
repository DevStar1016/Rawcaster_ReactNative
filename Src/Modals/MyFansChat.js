import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import HOCView from '../Components/HOCView';
import {COLORS} from '../Utilities/Colors';
import SubmitButton from '../Components/SubmitButton';
import SVGIcon from '../Components/SVGIcon';
import {
  compressMedia,
  getFileName,
  getUrlWithFilePrefix,
} from '../Utilities/Methods';
import {DIMENSIONS} from '../Utilities/Constants';
import {FONTS} from '../Utilities/Fonts';
import {useNavigation} from '@react-navigation/native';
import {useGroupsList, useProfile} from '../Utilities/StoreData';
import Toast from '../Components/Toast';
import {Camera} from 'react-native-vision-camera';
import CustomCameraView from './CameraModals/CustomCameraView';
import AudioRecorder from './AudioRecorder';
import {ImageVideoPicker} from '../Utilities/ImageVideoPicker';
import MediaSmallItem from '../Components/MediaSmallItem';
import moment from 'moment';
import {sendSocketMessage} from '../Services/Socket/Socket';

var isMount = true;
const MyFansChat = () => {
  const navigation = useNavigation();
  const profile = useProfile();
  const groupsList = useGroupsList();
  const [message, setmessage] = useState('');
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [uploadedMediaList, setuploadedMediaList] = useState([]);
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [loaderText, setloaderText] = useState('');

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Generates a message item object with various properties for a group chat message.
   * @returns {Object} - The message item object.
   */
  function getMessageItem() {
    const uniqueId =
      profile.user_id +
      '' +
      (getGroupId() ?? '') +
      '' +
      moment.utc().format('x') +
      '' +
      Math.floor(Math.random() * 10000 + 1);
    return {
      event: 'groupchatmessage',
      uniqueId: uniqueId,
      type: 1,
      message: message.trim(),
      groupId: getGroupId(),
      senderId: profile.user_id,
      senderName: profile.name, // data.display_name,
      userImage: profile.profile_image, //data.profile_img,
      parentMsgId: null,
      sentType: 1,
      file_upload_status: 1,
      file_download_status: 0,
      is_edited: 0,
      is_read: 0,
      msg_from: 1,
      group_name: 'My Fans',
      media_path: null,
      sent_datetime: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
      thumbnail: null,
      duration: 0,
      isContainLink: false,
      linkpreviewdata: null,
    };
  }

  /**
   * Handles sending a chat message.
   * If there are uploaded media items, it sends a separate message for each item,
   * otherwise it sends a message with just the message item.
   * @returns None
   */
  function handleSendChat() {
    if (uploadedMediaList.length > 0) {
      [...uploadedMediaList].map(item => {
        let msgData = {
          ...getMessageItem(),
          uniqueId: item.id,
          media_path: item.uri,
          type: item.type,
        };
        sendSocketMessage(msgData, 'groupchatting');
      });
    } else {
      let msgData = {
        ...getMessageItem(),
      };
      sendSocketMessage(msgData, 'groupchatting');
    }
    navigation.goBack();
  }

  /**
   * Allows the user to pick multiple media files of a specified type (photo or video).
   * The selected media files are then compressed and returned as an array of objects
   * containing the compressed media path, name, and type.
   * @param {string} type - The type of media to pick (photo or video).
   * @returns None
   */
  function pickMedia(type) {
    ImageVideoPicker({
      mediaType: type,
      multiple: true,
    })
      .then(async mediaList => {
        if (isMount) {
          setloaderText('Compressing Media');
          setisLoading(true);
        }
        let mediaType = type === 'photo' ? 1 : 2;
        Promise.all(
          mediaList.map(async item => {
            let mediaPath = await compressMedia(mediaType, item.uri);
            return {
              uri: getUrlWithFilePrefix(mediaPath),
              name: getFileName(mediaPath),
              type: item.type,
            };
          }),
        )
          .then(resMediaList => {
            if (isMount) {
              setselectedMediaList(pre => [...pre, ...resMediaList]);
            }
          })
          .catch(e => {
            Toast.fail(e.message);
          })
          .finally(() => {
            if (isMount) {
              setisLoading(false);
              setloaderText('');
            }
          });
      })
      .catch(e => {});
  }

  /**
   * Handles the removal of a selected media item from the media list.
   * @param {number} selectedIndex - The index of the selected media item to remove.
   * @returns None
   */
  function handleRemoveSelectedMediaItem(selectedIndex) {
    if (isMount) {
      setselectedMediaList(preList => {
        return [...preList].filter((_, index) => index !== selectedIndex);
      });
    }
  }

  /**
   * Handles the process of opening the camera and requesting camera and microphone permissions.
   * @returns None
   * @throws {Error} If there is an error while handling the camera or permissions.
   */
  async function handleOpenCamera() {
    try {
      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      if (
        newCameraPermission === 'granted' &&
        newMicrophonePermission === 'granted'
      ) {
        if (isMount) {
          setisLoading(false);
          setloaderText('');
          setisOpenCamera(true);
        }
      } else {
        if (isMount) {
          setisLoading(false);
          setloaderText('');
        }
        if (newCameraPermission === 'denied') {
          Toast.fail('Camera Permission Denied');
        } else if (newMicrophonePermission === 'denied') {
          Toast.fail('Microphone Permission Denied');
        } else {
          Toast.fail('Permissions Denied');
        }
      }
    } catch (e) {
      if (isMount) {
        setisLoading(false);
        setloaderText('');
      }
      Toast.fail(e.message);
    }
  }

  /**
   * Handles the action of opening the audio recorder.
   * Requests microphone permission and sets the state to open the audio recorder if permission is granted.
   * Displays a toast message if microphone permission is denied.
   * @returns None
   */
  async function handleOpenAudioRecorder() {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'granted') {
      if (isMount) {
        setisOpenAudioRecorder(true);
      }
    } else {
      Toast.fail('Microphone Permission Denied');
    }
  }

  /**
   * Handles the selection of media from the camera and adds it to the selected media list.
   * @param {Object} mediaItem - The selected media item.
   * @returns None
   */
  async function onSelectMediaFromCamera(mediaItem) {
    let mediaType = mediaItem.type.includes('image') ? 1 : 2;
    let mediaPath = await compressMedia(mediaType, mediaItem.uri);
    setselectedMediaList(pre => [
      ...pre,
      {
        name: getFileName(mediaPath),
        type: mediaItem.type,
        uri: mediaPath,
      },
    ]);
  }

  /**
   * Handles the submission of an audio file.
   * @param {Object} audioFile - The audio file to be submitted.
   * @returns None
   */
  function handleSubmitAudio(audioFile) {
    setselectedMediaList(pre => [
      ...pre,
      {
        ...audioFile,
      },
    ]);
  }

  /**
   * Retrieves the group ID of the "My Fans" group from the list of groups.
   * @returns {string | null} The group ID if found, otherwise null.
   */
  function getGroupId() {
    const fansGroupItem = [...groupsList].find(item =>
      item.group_name?.includes('My Fans'),
    );
    if (fansGroupItem) {
      return fansGroupItem?.group_id;
    }
    return null;
  }

  function renderSelectedMediaItem({item, index}) {
    return (
      <MediaSmallItem
        item={item}
        isEnableUploadDownloadProcess
        onUploadSuccess={(uniqueId, filePath, type) => {
          setuploadedMediaList(preList => {
            return [...preList, {id: uniqueId, uri: filePath, type: type}];
          });
        }}
        onUploadFailed={(uniqueId, failedMessage = '') => {
          Toast.fail(failedMessage);
          handleRemoveSelectedMediaItem(index);
        }}
        groupId={getGroupId()}
        onRemoveItem={() => {
          handleRemoveSelectedMediaItem(index);
        }}
      />
    );
  }

  return (
    <HOCView
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      paddingHorizontal={5}
      loaderProps={{
        loaderText: loaderText,
      }}
      isLoading={isLoading}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: `Send message to My Fans`,
        isEnableBackButton: false,
        isTitleCenter: true,
        isEnableRightIcon: true,
        rightIcon: 'close_white',
        onPressRightIcon: () => {
          navigation.goBack();
        },
      }}
      isEnableDefaultBackground>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.mainContainer}
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={styles.topContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={`What’s on your mind for My Fans!`}
              style={styles.textInput}
              multiline
              maxLength={500}
              value={message}
              onChangeText={setmessage}
              numberOfLines={5}
              textAlignVertical={'top'}
              placeholderTextColor={COLORS.placeHolderColor}
            />
          </View>
          <View style={styles.buttonsContainer}>
            <SVGIcon
              icon="mic_fill_white"
              height={21}
              width={21}
              marginLeft={8}
              isButton
              onPress={() => {
                handleOpenAudioRecorder();
              }}
            />
            <SVGIcon
              icon="photo_fill_white"
              height={21}
              width={21}
              marginLeft={8}
              isButton
              onPress={() => {
                // handleOpenCamera();
                pickMedia('photo');
              }}
            />
            <SVGIcon
              icon="video_fill_white"
              height={20}
              width={22}
              marginLeft={10}
              isButton
              onPress={() => {
                pickMedia('video');
              }}
            />
          </View>
        </View>
        <View>
          {selectedMediaList.length > 0 && (
            <View style={styles.selectedMediaContainer}>
              <FlatList
                data={selectedMediaList}
                renderItem={renderSelectedMediaItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
              />
            </View>
          )}
          <SubmitButton
            buttonText="Send"
            disabledColor={COLORS.dimColor}
            isDisabled={uploadedMediaList.length <= 0 && !message.trim()}
            onPress={() => {
              handleSendChat();
            }}
          />
        </View>
      </TouchableOpacity>
      <Modal
        visible={isOpenCamera}
        statusBarTranslucent
        transparent
        onRequestClose={() => {
          if (isMount) {
            setisOpenCamera(false);
          }
        }}>
        <CustomCameraView
          setModal={setisOpenCamera}
          onSendMedia={onSelectMediaFromCamera}
        />
      </Modal>

      <Modal
        visible={isOpenAudioRecorder}
        statusBarTranslucent
        transparent
        onRequestClose={() => {
          if (isMount) {
            setisOpenAudioRecorder(false);
          }
        }}>
        <AudioRecorder
          setModal={setisOpenAudioRecorder}
          onSubmitAudio={handleSubmitAudio}
        />
      </Modal>
    </HOCView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
    paddingTop: 15,
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxHeight: 200,
    minHeight: 70,
    alignItems: 'flex-start',
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.white,
    fontSize: 17,
    height: '100%',
  },
  emojiIconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 5,
    height: 35,
    width: 35,
    // paddingTop: 5,
  },
  emojiContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: DIMENSIONS.window.height / 2 + 10,
  },
  selectedMediaContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    padding: 5,
    // height: 130,
  },
});

export default MyFansChat;
