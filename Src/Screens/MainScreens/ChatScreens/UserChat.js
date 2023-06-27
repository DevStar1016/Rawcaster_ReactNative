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
} from '../../../Utilities/Methods';
import ChatItem from './ChatItem';

var isMount = true;
const UserChat = ({route}) => {
  const {userData} = route.params ?? {};
  const [headerHeight, setheaderHeight] = useState(20);
  const profile = useProfile();
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
      document_name: 'Rawcaster File',
      document_size: '13 MB',
      document_type: 'PDF',
      document_url: profile.profile_image,
    },
    {
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
      image: profile.profile_image,
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
