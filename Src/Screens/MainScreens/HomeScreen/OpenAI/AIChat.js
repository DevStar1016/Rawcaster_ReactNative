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
import {aiChatService} from '../../../../Services/ApiService';
import {useToken} from '../../../../Utilities/StoreData';
import moment from 'moment';

const AIChat = ({onPressBack}) => {
  const token = useToken();
  const [chatList, setchatList] = useState([]);
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
    const formData = new FormData();
    formData.append('token', token);
    formData.append('user_query', text);

    aiChatService(formData)
      .then(res => {
        console.log(res.data, 'RESPONSE');
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
    return (
      <View
        style={[
          styles.messageContainer,
          {alignSelf: item.isAI ? 'flex-start' : 'flex-end'},
          item.isAI
            ? {
                borderBottomStartRadius: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.30)',
              }
            : {
                borderBottomEndRadius: 0,
                backgroundColor: COLORS.primary,
              },
        ]}>
        {item.isAI && (
          <ProfileWithBadge extraMargin={0} padding={0} profileSize={35} />
        )}
        <View
          style={[
            {maxWidth: '70%'},
            item.isAI ? {paddingLeft: 10} : {paddingRight: 10},
          ]}>
          <StyledText style={{color: COLORS.white}}>{item.msg}</StyledText>
          <StyledText style={{color: COLORS.white}}>{item.dateTime}</StyledText>
        </View>
        {!item.isAI && (
          <ProfileWithBadge extraMargin={0} padding={0} profileSize={35} />
        )}
      </View>
    );
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
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 10}} />}
          showsVerticalScrollIndicator={false}
        />
      </TouchableOpacity>

      <View style={styles.bottomContainer}>
        <RBSheetTextInput
          isEnableEmoji={false}
          placeholderText="Type or ask your question here..."
          onPressSend={handleSendMessage}
          isEnableVoiceRecord={true}
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
  messageContainer: {
    padding: 8,
    flexDirection: 'row',
    borderRadius: 10,
    maxWidth: '80%',
  },
});
