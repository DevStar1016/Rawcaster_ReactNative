import {Alert, FlatList, KeyboardAvoidingView, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import Clipboard from '@react-native-community/clipboard';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import EncryptedMessageContainer from './EncryptedMessageContainer';
import {IS_IOS} from '../../../Utilities/Constants';
import {useProfile} from '../../../Utilities/StoreData';
import ChatTextInput from './ChatTextInput';
import {compressMedia, getFileName} from '../../../Utilities/Methods';
import ChatItem from './ChatItem';
import Toast from '../../../Components/Toast';

const UserChat = ({route}) => {
  const {userData} = route.params ?? {};
  const [headerHeight, setheaderHeight] = useState(20);
  const profile = useProfile();
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [selectedMsgIds, setselectedMsgIds] = useState([]);
  const [chatList, setchatList] = useState([
    {
      msgId: 15,
      date: '2023-06-25',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      video_url:
        'https://rawcaster.com/rawadmin/uploads/default/myluckyzone.mp4',
      user_id: 2,
    },
    {
      msgId: 14,
      date: '2023-06-25',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      video_url:
        'https://rawcaster.com/rawadmin/uploads/default/myluckyzone.mp4',
      user_id: 1,
    },
    {
      msgId: 13,
      date: '2023-06-25',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      audio_url:
        'https://rawcaster.s3.us-west-2.amazonaws.com/nuggets/converted_audio_39221687864620.mp3',
      audio_duration: '00:18',
      user_id: 1,
    },
    {
      msgId: 12,
      date: '2023-06-25',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      audio_url:
        'https://rawcaster.s3.us-west-2.amazonaws.com/nuggets/converted_audio_39221687864620.mp3',
      audio_duration: '00:18',
      user_id: 2,
    },
    {
      msgId: 11,
      date: '2023-06-25',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'No, I am not😂, and did you heard about my Ooruu?😂',
      image: profile.profile_image,
      user_id: 2,
    },
    {
      msgId: 10,
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content:
        'Ohooo appadiyaaa😏... I am from thani ooruuuu😁😁😁., Did you heard about this??',
      user_id: 1,
    },
    {
      msgId: 9,
      date: '2023-06-24',
      name: 'Evano Oruvan',
      forwarded: true,
      profile_img: profile.profile_image,
      content: 'I am from Eatho Oru Ooru😂, and where are you from?',
      user_id: 2,
    },
    {
      msgId: 8,
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      image: profile.profile_image,
      content: 'Where are you from?',
      user_id: 1,
    },
    {
      msgId: 7,
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Ok Nice to meet you Evano Oruvan',
      user_id: 1,
    },
    {
      msgId: 6,
      date: '2023-06-24',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: 'Poda Venna',
      user_id: 1,
      document_name: 'Rawcaster File',
      document_size: '13 MB',
      document_type: 'PDF',
      document_url: profile.profile_image,
    },
    {
      msgId: 5,
      date: '2023-06-23',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Eppudiiii😎😎',
      user_id: 2,
      document_name: 'Rawcaster File',
      document_size: '13 MB',
      document_type: 'PDF',
      document_url: profile.profile_image,
    },

    {
      msgId: 4,
      date: '2023-06-23',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Nee Thani Oruvan na Naan Evano Oruvan da',
      user_id: 2,
    },

    {
      msgId: 3,
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      content: "It's me Thani Oruvan",
      user_id: 1,
    },

    {
      msgId: 2,
      date: '2023-06-22',
      name: 'Evano Oruvan',
      profile_img: profile.profile_image,
      content: 'Hiii',
      image: profile.profile_image,
      user_id: 2,
    },

    {
      msgId: 1,
      date: '2023-06-22',
      name: 'Thani Oruvan',
      profile_img: profile.profile_image,
      image: profile.profile_image,
      content: 'Hiii',
      user_id: 1,
    },
  ]);

  useEffect(() => {
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
    };
  }, []);

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
   * Handles the selection of a message by adding or removing its ID from the selectedMsgIds array.
   * @param {string} msgId - The ID of the message to be selected or deselected.
   * @returns None
   */
  function handleSelectMessage(msgId) {
    let tempSelectedIds = [...selectedMsgIds];
    if (tempSelectedIds.includes(msgId)) {
      tempSelectedIds = tempSelectedIds.filter(id => id !== msgId);
    } else {
      tempSelectedIds.push(msgId);
    }
    setselectedMsgIds([...tempSelectedIds]);
  }

  /**
   * Checks if the chat list includes any media items that have been selected.
   * @returns {boolean} - true if there is at least one selected media item in the chat list, false otherwise.
   */
  function isIncludeMedia() {
    return [...chatList].reduce((resultValue, item) => {
      if (
        selectedMsgIds.includes(item.msgId) &&
        (item.audio_url || item.document_url || item.image)
      ) {
        resultValue = true;
      }
      return resultValue;
    }, false);
  }

  /**
   * Determines whether the copy action is enabled based on the selected message IDs and
   * the presence of media in the selected messages.
   * @returns {boolean} - true if the copy action is enabled, false otherwise.
   */
  function getIsEnableCopy() {
    if (selectedMsgIds.length > 0) {
      return !isIncludeMedia();
    }
    return false;
  }

  /**
   * Checks if the given message ID belongs to the current user.
   * @param {number} msgId - The ID of the message to check.
   * @returns {boolean} - True if the message belongs to the current user, false otherwise.
   */
  function isSelfMsgId(msgId) {
    const tempChatList = [...chatList];
    const tempMessage = tempChatList.find(item => item.msgId === msgId);
    if (tempMessage) {
      return tempMessage.user_id === 2;
    }
    return false;
  }

  /**
   * Checks if the edit feature is enabled for the currently selected message.
   * @returns {boolean} - true if the edit feature is enabled, false otherwise.
   */
  function getIsEnableEdit() {
    return (
      selectedMsgIds.length === 1 &&
      !isIncludeMedia() &&
      isSelfMsgId(selectedMsgIds[0])
    );
  }

  /**
   * Handles copying selected messages to the clipboard.
   * @returns None
   */
  function handleCopyOnClipboard() {
    const tempContentsList = [...chatList]
      .filter(item => selectedMsgIds.includes(item.msgId))
      .map(item => item.content)
      .reverse();
    Clipboard.setString(tempContentsList.toString());
    Toast.success(
      `${
        selectedMsgIds.length > 1
          ? selectedMsgIds.length + ' messages'
          : 'Message'
      } copied`,
    );
    setselectedMsgIds([]);
  }

  /**
   * Retrieves the username associated with a given message ID.
   * @param {string} msgId - The ID of the message.
   * @returns {string} The username associated with the message, or an empty string if the message is from the current user or if the message ID is not found in the chat list.
   */
  function getMsgUserNameText(msgId) {
    if (isSelfMsgId(msgId)) {
      return '';
    }
    const tempChatList = [...chatList];
    const tempMessage = tempChatList.find(item => item.msgId === msgId);
    if (tempMessage) {
      return ` from ${tempMessage.name}`;
    }
    return '';
  }

  /**
   * Deletes selected messages based on the message IDs.
   * If the selected messages contain messages from other users, it prompts the user to choose
   * whether to delete the messages for themselves only or for everyone.
   * @returns None
   */
  function onDeleteMessages() {
    const isContainOtherUsersMessageIds = [...selectedMsgIds].reduce(
      (result, id) => {
        if (!isSelfMsgId(id)) {
          result = true;
        }
        return result;
      },
      false,
    );
    const buttonOptions = [
      {text: 'Cancel', onPress: () => {}},
      {text: 'Delete for me', onPress: () => {}},
    ];
    if (!isContainOtherUsersMessageIds) {
      buttonOptions.push({text: 'Delete for everyone', onPress: () => {}});
    }
    Alert.alert(
      '',
      `Delete ${
        selectedMsgIds.length === 1
          ? 'message' + getMsgUserNameText(selectedMsgIds[0])
          : selectedMsgIds.length + ' messages'
      }?`,
      [...buttonOptions],
      {
        cancelable: true,
      },
    );
  }

  const renderChatItem = ({item, index}) => {
    return (
      <ChatItem
        item={item}
        isPreChatSame={
          index < chatList.length - 1 &&
          item.user_id === chatList[index + 1].user_id
        }
        isSelected={selectedMsgIds.includes(item.msgId)}
        onPress={() => {
          if (selectedMsgIds.length > 0) {
            handleSelectMessage(item.msgId);
          }
        }}
        onLongPress={() => {
          handleSelectMessage(item.msgId);
        }}
        isDisableOtherClickables={selectedMsgIds.length > 0}
        onSelectMsg={handleSelectMessage}
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
        title: userData?.display_name,
        titleTextProps: {normalTextModeTextProps: {numberOfLines: 1}},
        isEnableProfileImage: true,
        isEnableVideoCallIcon: selectedMsgIds.length === 0,
        isEnableAudioCallIcon: selectedMsgIds.length === 0,
        isEnableDeleteIcon: selectedMsgIds.length > 0,
        isEnableEditIcon: getIsEnableEdit(),
        isEnableCopyIcon: getIsEnableCopy(),
        isEnableshareIcon: selectedMsgIds.length === 1,
        onPressShareButton: () => {},
        onPressDeleteButton: onDeleteMessages,
        onPressCopyButton: handleCopyOnClipboard,
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
          keyboardShouldPersistTaps="handled"
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
          onSendMedia={onSelectMediaFromCamera}
          onSelectDocuments={documentsList => {
            setselectedMediaList(pre => [...pre, ...documentsList]);
          }}
          onSendAudio={() => {}}
        />
      </KeyboardAvoidingView>
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
