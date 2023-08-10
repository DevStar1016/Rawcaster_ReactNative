import {
  BackHandler,
  Keyboard,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../../Utilities/Colors';
import StyledText from '../../../../Components/StyledText';
import {FONTS} from '../../../../Utilities/Fonts';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import RBSheetTextInput from '../../../../Components/RBSheetTextInput';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import {
  aiChatService,
  textToAudioService,
} from '../../../../Services/ApiService';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import moment from 'moment';
import SVGIcon from '../../../../Components/SVGIcon';
import AIChatItem from './AIChatItem';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LoadingDots from '../../../../Components/LoadingDots';

var isMount = true;
var timer = undefined;
const AIChat = ({onPressBack, handleShareContent}) => {
  const audioPlayer = useRef(new AudioRecorderPlayer());
  const token = useToken();
  const profile = useProfile();
  const [chatList, setchatList] = useState([]);
  const [playingChatId, setplayingChatId] = useState(null);
  const [readMessageLoadingIdsList, setreadMessageLoadingIdsList] = useState(
    [],
  );
  const [isDisableAudioProcess, setisDisableAudioProcess] = useState(false);
  const [progress, setprogress] = useState(0);
  const [isLoadingChat, setisLoadingChat] = useState(false);
  const [audioList, setaudioList] = useState([]); //{id:1,url:''}
  const listRef = useRef(null);
  useEffect(() => {
    isMount = true;
    // aiChatAPICall();
    return () => {
      isMount = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [chatList]);

  useEffect(() => {
    const backAction = () => {
      onPressBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, []);

  const scrollToEnd = () => {
    if (chatList.length > 0) {
      // listRef?.current?.
      listRef.current.scrollToOffset({animated: false, offset: 0});
    }
  };

  function aiChatAPICall(text = '', audioFile, existingUniqueId) {
    if (isMount) {
      setisLoadingChat(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    if (text && text.trim()) {
      formData.append('user_query', text);
    }
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }

    aiChatService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data, 'DATAAA');
          const responseChatData = {
            id: getUniqueId(),
            msg: res.data.msg,
            isAI: true,
            dateTime: moment().format('hh:mm A'),
            isIntro: !((text && text.trim()) || audioFile),
          };
          if (audioFile && existingUniqueId) {
            setchatList(preList => {
              let tempChatList = [...preList];
              const tempIndex = tempChatList.findIndex(
                item => item.id === existingUniqueId,
              );
              if (tempIndex !== -1) {
                tempChatList[tempIndex] = {
                  ...tempChatList[tempIndex],
                  audioText: res.data.query || '',
                  isAudioLoading: false,
                };
              }
              return [...tempChatList];
            });
            timer = setTimeout(() => {
              if (isMount) {
                setchatList(preList => {
                  return [{...responseChatData}, ...preList];
                });
                setisLoadingChat(false);
              }
              clearTimeout(timer);
            }, 1000);
          } else {
            if (isMount) {
              setchatList(preList => {
                return [{...responseChatData}, ...preList];
              });
              setisLoadingChat(false);
            }
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            setisLoadingChat(false);
          }
          console.log(res.data.msg, 'ERROR MESSAGE');
        }
      })
      .catch(e => {
        if (isMount) {
          setisLoadingChat(false);
        }
        console.log(e.message, 'ERROR');
      });
    // .finally(() => {
    //   if (isMount) {
    //     setisLoadingChat(false);
    //   }
    // });
  }

  function handleSendMessage({text = '', audioFile, duration = 0}) {
    const uniqueId = getUniqueId();
    setchatList(preList => {
      return [
        {
          id: uniqueId,
          msg: text,
          isAI: false,
          dateTime: moment().format('hh:mm A'),
          audioUrl: audioFile?.uri,
          duration,
          isAudioLoading: audioFile ? true : false,
        },
        ...preList,
      ];
    });
    aiChatAPICall(text, audioFile, uniqueId);
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

  const onGetAudioUrl = (id, url) => {
    setaudioList(preList => {
      let tempAudiosList = [...preList];
      const index = tempAudiosList.findIndex(item => item.id === id);
      if (index === -1) {
        tempAudiosList.push({id, url});
      }
      return tempAudiosList;
    });
  };

  const onLoadingReadMessage = (id, status) => {
    setreadMessageLoadingIdsList(preList => {
      let tempList = [...preList];
      if (status) {
        if (!tempList.includes(id)) {
          tempList.push(id);
        }
      } else {
        tempList = tempList.filter(itemId => itemId !== id);
      }
      return tempList;
    });
  };

  function renderItem({item, index}) {
    return (
      <AIChatItem
        isEnableShare={index !== chatList.length - 1}
        item={item}
        progress={progress}
        setprogress={setprogress}
        audioPlayerRef={audioPlayer}
        setisDisableAudioProcess={setisDisableAudioProcess}
        playingChatId={playingChatId}
        setplayingChatId={setplayingChatId}
        readMessageLoadingIdsList={readMessageLoadingIdsList}
        audioList={audioList}
        onShareContent={handleShareContent}
        setaudioUrl={onGetAudioUrl}
        setreadMessageLoading={onLoadingReadMessage}
      />
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <View style={{width: '10%'}} />

        <StyledText style={styles.title}>Rawcaster AI</StyledText>
        <View style={{width: '10%', paddingRight: 5}}>
          <SVGIcon
            icon="close_white"
            height={15}
            width={15}
            isButton
            onPress={() => {
              onPressBack();
            }}
          />
        </View>
      </View>
      <View
        style={styles.commentsListContainer}
        // activeOpacity={1}
        // onPress={() => {
        //   Keyboard.dismiss();
        // }}
      >
        <BottomSheetFlatList
          ref={listRef}
          data={chatList}
          keyboardShouldPersistTaps="handled"
          style={{flexGrow: 0}}
          // onLayout={() => {
          //   scrollToEnd();
          // }}

          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={false}
              onRefresh={() => {}}
            />
          }
          inverted
          // onContentSizeChange={() => {
          //   scrollToEnd();
          // }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <View style={styles.bottomContainer}>
        {isLoadingChat && (
          <View style={{height: 20, alignItems: 'flex-start'}}>
            <LoadingDots size={10} bounceHeight={5} dots={3} />
          </View>
          // <StyledText
          //   style={{color: COLORS.white, paddingVertical: 10, opacity: 0.7}}>
          //   Typing...
          // </StyledText>
        )}
        <RBSheetTextInput
          isVisibleEmoji={false}
          placeholderText={`HI ${profile.name}, I am an Artificial Intelligence (AI), I can answer your question on anything. Speak or type your question here..`}
          onPressSend={text => {
            handleSendMessage({text});
          }}
          actionsContainerPaddingTop={5}
          containerAlignItems="flex-start"
          inputProps={{
            maxLength: profile?.ai_content_length ?? 0,
            multiline: true,
            textAlignVertical: 'top',
            numberOfLines: 6,
          }}
          containerHeight={110}
          isDisableAudioProcess={isDisableAudioProcess}
          isVisibleVoiceRecord={true}
          isDisableSend={isLoadingChat}
          onSendAudio={(audioFile, duration) => {
            handleSendMessage({audioFile, duration});
          }}
          isKeyboardCloseWhenSend={false}
        />
      </View>
    </View>
  );
};

export default AIChat;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.commentsBg,
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
    fontSize: 16,
  },
  commentsListContainer: {
    paddingHorizontal: 15,
    flex: 1,
    justifyContent: 'flex-end',
  },

  bottomContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
