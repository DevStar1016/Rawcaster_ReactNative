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
var readoutController = undefined;
var translateController = undefined;
const AIChat = ({onPressBack, handleShareContent, onPermissionResult}) => {
  const audioPlayerRef = useRef(new AudioRecorderPlayer());
  const token = useToken();
  const profile = useProfile();
  const [chatList, setchatList] = useState([]);

  const [translationData, settranslationData] = useState({
    id: null,
    text: '',
    isLoading: false,
  });
  const [readoutChatData, setreadoutChatData] = useState({
    id: null,
    isLoading: false,
    url: null,
    isPlaying: false,
  });
  const [progress, setprogress] = useState(0);
  const [isLoadingChat, setisLoadingChat] = useState(false);
  const [audioList, setaudioList] = useState([]); //{id:1,url:''}

  useEffect(() => {
    isMount = true;
    // aiChatAPICall();
    return () => {
      isMount = false;
      handleStopAudio();
      if (readoutController) {
        readoutController.abort();
      }
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

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

  /**
   * Stops the audio playback and removes the playback listener.
   * If an error occurs during the process, it is caught and ignored.
   * Finally, sets the 'isReadMuted' state to false.
   * @returns None
   */
  const handleStopAudio = () => {
    try {
      audioPlayerRef.current?.stopPlayer();
      audioPlayerRef.current?.removePlayBackListener();
      if (isMount) {
        setprogress(0);
      }
    } catch (e) {
    } finally {
      if (isMount) {
        setreadoutChatData(pre => ({
          ...pre,
          isPlaying: false,
        }));
      }
    }
  };

  /**
   * Handles playing audio from the given URL.
   * @param {string} url - The URL of the audio file to play.
   * @returns None
   */
  const handlePlayAudio = async url => {
    handleStopAudio();
    try {
      await audioPlayerRef.current?.startPlayer(url);
      audioPlayerRef.current?.addPlayBackListener(e => {
        if (Math.floor(e.currentPosition / 1000) >= 0) {
          setprogress(Math.floor(e.currentPosition / 1000));
        }
        if (Math.floor(e.currentPosition) === 0) {
          if (isMount) {
            setreadoutChatData(pre => ({
              ...pre,
              isPlaying: true,
            }));
          }
        } else if (e.currentPosition >= e.duration) {
          handleStopAudio();
        }
        return;
      });
    } catch (e) {
      if (isMount) {
        setreadoutChatData(pre => ({
          ...pre,
          isPlaying: false,
        }));
      }
    }
  };

  /**
   * Makes an API call to the AI chat service with the provided text and audio file.
   * @param {string} text - The user's query text.
   * @param {File} audioFile - The audio file to send to the AI chat service.
   * @param {string} existingUniqueId - The unique ID of the existing chat message.
   * @returns None
   */
  function aiChatAPICall(text = '', audioFile, existingUniqueId) {
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
        if (res.data.status === 1 || res.data.status === 0) {
          const uniqueId = getUniqueId();
          const responseChatData = {
            id: uniqueId,
            msg: res.data.msg,
            isAI: true,
            dateTime: moment().format('hh:mm A'),
            isIntro: !((text && text.trim()) || audioFile),
          };
          if (audioFile && existingUniqueId) {
            setchatList(preList => {
              let tempChatList = [...preList];
              const tempIndex = [...tempChatList].findIndex(
                item => item.id === existingUniqueId,
              );
              if (tempIndex !== -1) {
                tempChatList[tempIndex] = {
                  ...tempChatList[tempIndex],
                  audioText: res.data.query || '',
                  isAudioLoading: false,
                };
              }
              return [{...responseChatData}, ...tempChatList];
            });
            // timer = setTimeout(() => {
            //   if (isMount) {
            //     setchatList(preList => {
            //       return [{...responseChatData}, ...preList];
            //     });
            //     setisLoadingChat(false);
            //   }
            //   clearTimeout(timer);
            // }, 1000);
            setisLoadingChat(false);
          } else {
            if (isMount) {
              setchatList(preList => {
                let tempList = [...preList];
                const ind = [...tempList].findIndex(
                  item => item.id === existingUniqueId,
                );
                if (ind !== -1) {
                  tempList[ind] = {...tempList[ind], msgQuery: res.data.query};
                }
                return [{...responseChatData}, ...tempList];
              });
              setisLoadingChat(false);
            }
          }
        }
      })
      .catch(e => {
        if (isMount) {
          console.log(e, 'ERROR AI');
          setisLoadingChat(false);
        }
      });
    // .finally(() => {
    //   if (isMount) {
    //     setisLoadingChat(false);
    //   }
    // });
  }

  const handleReadoutChat = (msg, chatId) => {
    handleStopAudio();
    if (isMount) {
      setreadoutChatData(pre => ({
        ...pre,
        id: chatId,
        isLoading: true,
      }));
    }
    if (readoutController) {
      readoutController.abort();
    }
    readoutController = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('message', msg);
    formData.append('translation_type', 1);

    textToAudioService(formData, readoutController.signal)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            setreadoutChatData(pre => ({
              ...pre,
              isLoading: false,
              url: res.data.file_path,
            }));
            handlePlayAudio(res.data.file_path);
          } else if (res.data.status === 0) {
            Toast.fail(res.data.msg);
            setreadoutChatData(pre => ({
              ...pre,
              id: null,
              isLoading: false,
              url: null,
              isPlaying: false,
            }));
          }
        }
      })
      .catch(e => {
        if (!e.message.includes('cancel')) {
          Toast.fail(e.message);
          if (isMount) {
            setreadoutChatData(pre => ({
              ...pre,
              id: null,
              isLoading: false,
              url: null,
              isPlaying: false,
            }));
          }
        }
      });
  };

  const handleTranslate = (msg, chatId) => {
    if (isMount) {
      settranslationData(pre => ({
        ...pre,
        text: '',
        id: chatId,
        isLoading: true,
      }));
    }
    if (translateController) {
      translateController.abort();
    }
    translateController = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('message', msg);
    formData.append('translation_type', 2);
    textToAudioService(formData, translateController.signal)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            settranslationData(pre => ({
              ...pre,
              text: res.data.translation,
              isLoading: false,
            }));
          }
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
          handleSeeOriginal();
        }
      })
      .catch(e => {
        if (!e.message.includes('cancel')) {
          Toast.fail(e.message);
          handleSeeOriginal();
        }
      });
  };

  const handlePlayLocalAudio = (url, chatId) => {
    if (readoutController) {
      readoutController.abort();
    }
    if (isMount) {
      setreadoutChatData(pre => ({
        ...pre,
        id: chatId,
        isLoading: false,
        url: url,
      }));
    }
    handlePlayAudio(url);
  };

  /**
   * Handles sending a message in the chat.
   * @param {Object} options - The options for the message.
   * @param {string} options.text - The text of the message.
   * @param {Object} options.audioFile - The audio file object.
   * @param {number} options.duration - The duration of the audio file.
   * @returns None
   */
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
    if (isMount) {
      setisLoadingChat(true);
    }
    timer = setTimeout(() => {
      aiChatAPICall(text, audioFile, uniqueId);
      clearTimeout(timer);
    }, 1000);
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

  const handleSeeOriginal = () => {
    if (isMount) {
      settranslationData({
        id: null,
        text: '',
        isLoading: false,
      });
    }
  };

  function renderItem({item, index}) {
    return (
      <AIChatItem
        isEnableShare={index !== chatList.length - 1}
        item={item}
        isMount={isMount}
        readoutChatData={readoutChatData}
        progress={progress}
        handleSeeOriginal={handleSeeOriginal}
        handleTranslate={handleTranslate}
        translationData={translationData}
        handleReadoutChat={handleReadoutChat}
        handlePlayAudio={handlePlayAudio}
        handlePlayLocalAudio={handlePlayLocalAudio}
        handleStopAudio={handleStopAudio}
        onShareContent={handleShareContent}
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
          onPermissionResult={onPermissionResult}
          containerHeight={110}
          isDisableAudioProcess={readoutChatData && readoutChatData.isPlaying}
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
