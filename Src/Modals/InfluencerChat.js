import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import HOCView from '../Components/HOCView';
import {COLORS} from '../Utilities/Colors';
import SubmitButton from '../Components/SubmitButton';
import SVGIcon from '../Components/SVGIcon';
import {
  compressMedia,
  getFileName,
  getSlicedText,
  getUrlWithFilePrefix,
} from '../Utilities/Methods';
import ProfileWithBadge from '../Components/ProfileWithBadge';
import Badges from '../Utilities/Badges';
import {DIMENSIONS} from '../Utilities/Constants';
import {FONTS} from '../Utilities/Fonts';
import {useNavigation} from '@react-navigation/native';
import {useToken} from '../Utilities/StoreData';
import {influencerChatService} from '../Services/ApiService';
import Toast from '../Components/Toast';
import {Camera} from 'react-native-vision-camera';
import CustomCameraView from './CameraModals/CustomCameraView';
import AudioRecorder from './AudioRecorder';

var isMount = true;
const InfluencerChat = ({route}) => {
  const navigation = useNavigation();
  const token = useToken();
  const [message, setmessage] = useState('');
  const [type, settype] = useState(1);
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function handleSendChat() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    formData.append('message', message.trim());
    console.log(formData, 'FORM');
    influencerChatService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.goBack();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function pickMedia(type) {
    openCloseEmojiPicker(false);
    ImageCropPicker.openPicker({
      multiple: true,
      mediaType: type,
      smartAlbums: [
        'PhotoStream',
        'Generic',
        'Panoramas',
        'Videos',
        'Favorites',
        'Timelapses',
        'AllHidden',
        'RecentlyAdded',
        'Bursts',
        'SlomoVideos',
        'UserLibrary',
        'SelfPortraits',
        'Screenshots',
        'DepthEffect',
        'LivePhotos',
        'Animated',
        'LongExposure',
      ],
    })
      .then(async mediaList => {
        if (isMount) {
          setisLoading(true);
        }
        let mediaType = type === 'photo' ? 1 : 2;
        Promise.all(
          mediaList.map(async item => {
            let mediaPath = await compressMedia(mediaType, item.path);
            return {
              uri: getUrlWithFilePrefix(mediaPath),
              name: getFileName(mediaPath),
              type: item.mime,
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
            }
          });
      })
      .catch(e => {
        console.log(e, 'ERRORRR');
      });
  }

  function handleRemoveSelectedMediaItem(selectedIndex) {
    const filteredSelectedMediaList = [...selectedMediaList].filter(
      (_, index) => index !== selectedIndex,
    );
    if (isMount) {
      setselectedMediaList(filteredSelectedMediaList);
    }
  }

  async function handleOpenCamera() {
    try {
      // const cameraPermission = await Camera.getCameraPermissionStatus();
      // const microphonePermission = await Camera.getMicrophonePermissionStatus();

      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      if (
        newCameraPermission === 'authorized' &&
        newMicrophonePermission === 'authorized'
      ) {
        if (isMount) {
          setisLoading(false);
          setisOpenCamera(true);
        }
      } else {
        if (isMount) {
          setisLoading(false);
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
      }
      Toast.fail(e.message);
    }
  }

  async function handleOpenAudioRecorder() {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'authorized') {
      if (isMount) {
        setisOpenAudioRecorder(true);
      }
    } else {
      Toast.fail('Microphone Permission Denied');
    }
  }

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

  function handleSubmitAudio(audioFile) {
    setselectedMediaList(pre => [
      ...pre,
      {
        ...audioFile,
      },
    ]);
  }

  return (
    <HOCView
      //   isLoading={isLoading}
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      paddingHorizontal={5}
      loaderProps={{
        loaderText: 'Sending Message',
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
          // openCloseEmojiPicker(false);
          Keyboard.dismiss();
        }}>
        <View>
          <View style={styles.topContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={`What’s on your mind for My Fans!`}
                style={styles.textInput}
                multiline
                maxLength={500}
                // onFocus={() => {
                //   openCloseEmojiPicker(false);
                // }}
                value={message}
                onChangeText={setmessage}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholderTextColor={COLORS.placeHolderColor}
              />
              {/* <View style={styles.emojiIconContainer}>
                <SVGIcon
                  icon={'emojee'}
                  // height={30}
                  // width={30}
                  isButton
                  onPress={() => {
                    Keyboard.dismiss();
                    // openCloseEmojiPicker(true);
                  }}
                />
              </View> */}
            </View>
            <View style={styles.buttonsContainer}>
              <SVGIcon
                icon="mic_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                // onPress={() => {
                //   handleOpenAudioRecorder();
                // }}
              />
              <SVGIcon
                icon="camera_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                // onPress={() => {
                //   handleOpenCamera();
                // }}
              />
              <SVGIcon
                icon="video_fill_white"
                height={20}
                width={22}
                marginLeft={10}
                isButton
                // onPress={() => {
                //   pickMedia('video');
                // }}
              />
            </View>
          </View>
        </View>
        <View>
          <View>
            <SubmitButton
              buttonText="Send"
              // isDisabled={isDisabledPostButton()}
              disabledColor={COLORS.dimColor}
              onPress={() => {
                if (message.trim()) {
                  handleSendChat();
                }
                // if (!isDisabledPostButton()) {
                //   if (
                //     (selectedShareType.id === 3 ||
                //       selectedShareType.id === 4) &&
                //     shareConnectionsGroupsIdsList.length <= 0
                //   ) {
                //     Toast.fail(
                //       selectedShareType.id === 3
                //         ? 'Select groups'
                //         : 'Select connections',
                //     );
                //     setisOpenSelectionModal(true);
                //     return;
                //   }
                //   if (nugget) {
                //     handleEditNugget();
                //   } else {
                //     handlePostNuggets();
                //   }
                // }
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
      <Modal
        visible={isOpenCamera}
        statusBarTranslucent
        transparent
        animationType="slide"
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
  selectedNuggetsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    padding: 5,
    // height: 130,
  },

  backgroundVideo: {
    width: '100%',
    height: '100%',
  },

  removeIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  emojiContaine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: DIMENSIONS.screen.height / 2 - 50,
  },
  playIconContainer: {
    height: 25,
    width: 25,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
  itemActionButtonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSelectedItemIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 20 / 2,
    height: 20,
    width: 20,
  },
  itemRemoveIconContainer: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 22,
    width: 22,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
});

export default InfluencerChat;
