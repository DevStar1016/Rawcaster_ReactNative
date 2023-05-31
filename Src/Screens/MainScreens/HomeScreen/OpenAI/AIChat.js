import {
  BackHandler,
  Keyboard,
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
import {useToken} from '../../../../Utilities/StoreData';
import moment from 'moment';
import SVGIcon from '../../../../Components/SVGIcon';
import AIChatItem from './AIChatItem';

var isMount = true;
const AIChat = ({onPressBack}) => {
  const token = useToken();
  const [chatList, setchatList] = useState([]);
  const [isLoadingChat, setisLoadingChat] = useState(false);
  const listRef = useRef(null);
  useEffect(() => {
    isMount = true;

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
      listRef?.current?.scrollToEnd();
    }
  };

  function aiChatAPICall(text) {
    if (isMount) {
      setisLoadingChat(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_query', text);

    aiChatService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setchatList(preList => {
            return [
              ...preList,
              {
                msg: res.data.msg,
                isAI: true,
                dateTime: moment().format('hh:mm A'),
              },
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
        ...preList,
        {msg: text, isAI: false, dateTime: moment().format('hh:mm A')},
      ];
    });
    aiChatAPICall(text);
  }

  function renderItem({item, index}) {
    return <AIChatItem item={item} />;
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.titleContainer}>
        <StyledText style={styles.title}>Rawcaster AI</StyledText>
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
          onLayout={() => {
            scrollToEnd();
          }}
          onContentSizeChange={() => {
            scrollToEnd();
          }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          showsVerticalScrollIndicator={false}
        />
      </TouchableOpacity>

      <View style={styles.bottomContainer}>
        {isLoadingChat && (
          <StyledText
            style={{color: COLORS.white, paddingVertical: 10, opacity: 0.7}}>
            Typing...
          </StyledText>
        )}
        <RBSheetTextInput
          isEnableEmoji={false}
          placeholderText="Type or ask your question here..."
          onPressSend={handleSendMessage}
          isEnableVoiceRecord={true}
          isDisableSend={isLoadingChat}
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
