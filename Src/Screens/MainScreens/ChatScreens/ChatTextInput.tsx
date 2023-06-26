import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import {TextInput} from 'react-native-gesture-handler';
import TextBox from '../../../Components/TextBox';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import EmojiContainer from 'react-native-emoji-container';
import {WINDOW_HEIGHT} from '@gorhom/bottom-sheet';

type Props = {
  onPressSend: (value: string) => void;
};

const ChatTextInput = ({onPressSend}: Props) => {
  const [message, setmessage] = useState<string>('');
  const [isOpenEmoji, setisOpenEmoji] = useState<boolean>(false);
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
            placeholder="type message here..."
            onFocus={() => {
              setisOpenEmoji(false);
            }}
          />
        </View>
        <View style={styles.actionButtonsContainer}>
          {message.length === 0 ? (
            <TouchableOpacity style={styles.actionButtons} activeOpacity={0.8}>
              <SVGIcon icon="camera_fill_primary" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={styles.actionButtons} activeOpacity={0.8}>
            <SVGIcon icon="upload_fill_orange" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButtonContainer}
            onPress={() => {
              if (message.length > 0) {
                onPressSend(message);
                setmessage('');
              } else {
              }
            }}
            activeOpacity={0.8}>
            {message.length > 0 ? (
              <SVGIcon icon="send" />
            ) : (
              <SVGIcon icon="mic_fill_white" height={20} width={20} />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {isOpenEmoji && (
        <View style={[styles.emojiContainer]}>
          <EmojiContainer
            enableTitle={false}
            numColumns={7}
            onPressEmoji={emojiData => {
              setmessage(preMsg => preMsg + emojiData.emoji);
            }}
          />
        </View>
      )}
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
    alignItems: 'center',
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
  actionButtons: {
    marginRight: 10,
  },
  emojiContainer: {
    height: WINDOW_HEIGHT / 2 - 120,
    backgroundColor: COLORS.white,
  },
});
