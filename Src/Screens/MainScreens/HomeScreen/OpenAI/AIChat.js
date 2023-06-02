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
const AIChat = ({onPressBack, handleShareContent}) => {
  const audioPlayer = useRef(new AudioRecorderPlayer());
  const token = useToken();
  const profile = useProfile();
  const [chatList, setchatList] = useState([]);
  const [playingChatId, setplayingChatId] = useState(null);
  const [readMessageLoadingIdsList, setreadMessageLoadingIdsList] = useState(
    [],
  );
  const [isLoadingChat, setisLoadingChat] = useState(false);
  const [audioList, setaudioList] = useState([]); //{id:1,url:''}
  const [audioUrl, setaudioUrl] = useState(null);
  const listRef = useRef(null);
  useEffect(() => {
    isMount = true;
    aiChatAPICall();
    return () => {
      isMount = false;
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

  function aiChatAPICall(text = '') {
    if (isMount) {
      setisLoadingChat(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    if (text && text.trim()) {
      formData.append('user_query', text);
    }

    aiChatService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setchatList(preList => {
            return [
              {
                id: getUniqueId(),
                msg: res.data.msg,
                isAI: true,
                dateTime: moment().format('hh:mm A'),
              },
              ...preList,
            ];
          });
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {
        console.log(e.message, 'ERROR');
      })
      .finally(() => {
        if (isMount) {
          setisLoadingChat(false);
        }
      });
  }

  function handleSendMessage(text) {
    setchatList(preList => {
      return [
        {
          id: getUniqueId(),
          msg: text,
          isAI: false,
          dateTime: moment().format('hh:mm A'),
        },
        ...preList,
      ];
    });
    aiChatAPICall(text);
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
        item={item}
        audioPlayerRef={audioPlayer}
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
      <TouchableOpacity
        style={styles.commentsListContainer}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
        }}>
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
      </TouchableOpacity>

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
          placeholderText="Type or ask your question here..."
          onPressSend={handleSendMessage}
          isVisibleVoiceRecord={true}
          isDisableSend={isLoadingChat}
          onSendAudio={() => {}}
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
