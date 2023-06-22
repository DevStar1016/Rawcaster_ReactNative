import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import {TextInput} from 'react-native-gesture-handler';
import TextBox from '../../../Components/TextBox';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import EmojiContainer from 'react-native-emoji-container';
import {WINDOW_HEIGHT} from '@gorhom/bottom-sheet';

type Props = {};

const ChatTextInput = ({}: Props) => {
  const [message, setmessage] = useState<string>('');
  const [isOpenEmoji, setisOpenEmoji] = useState(false);
  return (
    <>
      <View style={styles.mainContainer}>
        <SVGIcon
          icon="emoji_dark"
          marginRight={5}
          marginLeft={10}
          isButton
          onPress={() => {
            Keyboard.dismiss();
            setisOpenEmoji(pre => !pre);
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputBox}
            value={message}
            onChangeText={setmessage}
            placeholder="Message"
          />
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.sendButtonContainer}
            activeOpacity={0.8}>
            <SVGIcon icon="message_symbol" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.emojiContainer,
          {display: isOpenEmoji ? 'flex' : 'none'},
        ]}>
        <EmojiContainer
          enableTitle={false}
          onPressEmoji={emojiData => {
            setmessage(preMsg => preMsg + emojiData.emoji);
            console.log(emojiData, 'EMOJIII');
          }}
        />
      </View>
    </>
  );
};

export default ChatTextInput;

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    marginHorizontal: 10,
    // paddingHorizontal: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 1,
    height: 45,
  },
  inputBox: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.black,
    flex: 1,
    backgroundColor: COLORS.white,
  },
  sendButtonContainer: {
    borderRadius: 45 / 2,
    height: 45,
    width: 45,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainer: {
    height: WINDOW_HEIGHT / 2 - 80,
    backgroundColor: COLORS.white,
  },
});
