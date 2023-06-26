import {FlatList, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import EncryptedMessageContainer from './EncryptedMessageContainer';
import {IS_IOS} from '../../../Utilities/Constants';
import {useProfile} from '../../../Utilities/StoreData';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import ChatTextInput from './ChatTextInput';
import {
  compressMedia,
  getFileName,
  getSlicedText,
  getUrlWithFilePrefix,
} from '../../../Utilities/Methods';
import ChatItem from './ChatItem';
import {Modal} from 'react-native';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import AudioRecorder from '../../../Modals/AudioRecorder';
import Toast from '../../../Components/Toast';
import {Camera} from 'react-native-vision-camera';
import {pick} from 'react-native-document-picker';

var isMount = true;
const UserChat = ({route}) => {
  const {userData} = route.params ?? {};
  const [headerHeight, setheaderHeight] = useState(20);
  const profile = useProfile();
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [chatList, setchatList] = useState([
    {
      date: '2023-06-25',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'No, I am not😂, and did you heard about my Ooruu?😂',
      image: profile.profile_image,
      user_id: 2,
    },
    {
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content:
        'Ohooo appadiyaaa😏... I am from thani ooruuuu😁😁😁., Did you heard about this??',
      user_id: 1,
    },
    {
      date: '2023-06-24',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'I am from Eatho Oru Ooru😂, and where are you from?',
      user_id: 2,
    },
    {
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      image: profile.profile_image,
      content: 'Where are you from?',
      user_id: 1,
    },
    {
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Ok Nice to meet you Evano Oruvan',
      user_id: 1,
    },
    {
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Poda Venna',
      user_id: 1,
    },
    {
      date: '2023-06-23',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Eppudiiii😎😎',
      user_id: 2,
    },

    {
      date: '2023-06-23',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Nee Thani Oruvan na Naan Evano Oruvan da',
      user_id: 2,
    },

    {
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: "It's me Thani Oruvan",
      user_id: 1,
    },

    {
      date: '2023-06-22',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Hiii',
      user_id: 2,
    },

    {
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      image: profile.profile_image,
      content: 'Hiii',
      user_id: 1,
    },
  ]);

  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
      isMount = false;
    };
  }, []);

  function pickDocument() {
    pick({allowMultiSelection: true})
      .then(mediaList => {
        console.log(mediaList, 'ASASASASAS');
        Promise.all(
          mediaList.map(async item => {
            return {
              uri: getUrlWithFilePrefix(item.uri),
              name: item.name,
              type: item.type,
            };
          }),
        )
          .then(resMediaList => {
            console.log(resMediaList, 'YUIO');
            setselectedMediaList(pre => [...pre, ...resMediaList]);
          })
          .catch(e => {
            Toast.fail(e.message);
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
    setselectedMediaList(filteredSelectedMediaList);
  }

  async function handleOpenCamera() {
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
    } catch (e) {
      Toast.fail(e.message);
    }
  }

  async function handleOpenAudioRecorder() {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'authorized') {
      setisOpenAudioRecorder(true);
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

  const renderChatItem = ({item, index}) => {
    return (
      <ChatItem
        item={item}
        isPreChatSame={
          index < chatList.length - 1 &&
          item.user_id === chatList[index + 1].user_id
        }
        isGroup
      />
    );
  };

  return (
    <HOCView
      isEnableDefaultBackground
      isEnableRLogo={false}
      paddingHorizontal={0}
      headerType="header_with_back"
      onLayoutHeaderHeight={setheaderHeight}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: getSlicedText(userData?.display_name, 25),
        isEnableProfileImage: true,
        isEnableVideoCallIcon: true,
        titlePaddingHorizontal: 5,
        profileImageProps: {
          profileSize: 30,
          extraMargin: 0,
          padding: 0,
        },
        profileContainer: {marginVertical: 2, marginLeft: 5},
      }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={!IS_IOS ? 0 : headerHeight}
        behavior={IS_IOS ? 'padding' : null}
        style={{flex: 1}}>
        <FlatList
          data={chatList}
          inverted
          contentContainerStyle={{paddingTop: 10}}
          ListFooterComponent={() => <EncryptedMessageContainer />}
          renderItem={renderChatItem}
          keyExtractor={(_, index) => index.toString()}
          style={{flexGrow: 0}}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />

        <ChatTextInput
          onPressSend={() => {}}
          onPressAudio={handleOpenAudioRecorder}
          onPressCamera={handleOpenCamera}
          onPressDocument={pickDocument}
        />
      </KeyboardAvoidingView>
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

export default UserChat;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
  },
  leftContainer: {
    flexDirection: 'row',
  },
  chatListContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
  },
  header: {
    fontSize: 32,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
  },
});
