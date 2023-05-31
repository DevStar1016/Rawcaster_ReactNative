import {
  Keyboard,
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';
import ProfileWithBadge from './ProfileWithBadge';
import SVGIcon from './SVGIcon';
import {useProfile} from '../Utilities/StoreData';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';

type Props = {
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  placeholderText?: string;
  onPressSend?: (text: string) => void;
  inpuFieldRef?: (e: any) => void;
  isInsideTextChange?: boolean;
  onChangeText?: (text: string) => void;
  text?: string;
  isEnableEmoji?: boolean;
  isEnableVoiceRecord?: boolean;
  onPressEmoji?: () => void;
};

const RBSheetTextInput = ({
  onFocus,
  placeholderText = '',
  onPressSend,
  inpuFieldRef,
  isInsideTextChange = true,
  onChangeText,
  text = '',
  isEnableEmoji = true,
  onPressEmoji,
  isEnableVoiceRecord = false,
}: Props) => {
  const profile = useProfile();
  const [typedText, settypedText] = useState<string>('');
  return (
    <View style={styles.inputContainer}>
      <ProfileWithBadge
        profileSize={35}
        profileImage={profile?.profile_image}
      />
      <BottomSheetTextInput
        ref={inpuFieldRef}
        style={styles.input}
        onChangeText={isInsideTextChange ? settypedText : onChangeText}
        value={isInsideTextChange ? typedText : text}
        keyboardType="twitter"
        onFocus={onFocus}
        placeholder={placeholderText}
        placeholderTextColor={COLORS.placeHolderColor}
      />
      <View style={styles.actionsContainer}>
        {isEnableVoiceRecord &&
          ((isInsideTextChange && !typedText) ||
            (!isInsideTextChange && !text)) && (
            <SVGIcon
              icon="mic_fill_white"
              marginRight={5}
              height={22}
              width={22}
              isButton
              onPress={() => {
                Keyboard.dismiss();
              }}
            />
          )}

        {isEnableEmoji && (
          <SVGIcon
            icon="emojee"
            marginRight={5}
            isButton
            onPress={() => {
              Keyboard.dismiss();
              if (onPressEmoji) {
                onPressEmoji();
              }
            }}
          />
        )}
        <SVGIcon
          icon="send"
          marginRight={5}
          isButton
          height={27}
          width={27}
          onPress={() => {
            if (
              (isInsideTextChange && typedText.trim()) ||
              (!isInsideTextChange && text.trim())
            ) {
              Keyboard.dismiss();
              if (onPressSend) {
                onPressSend(
                  isInsideTextChange ? typedText.trim() : text.trim(),
                );
              }
              if (isInsideTextChange) {
                settypedText('');
              }
            }
          }}
        />
      </View>
    </View>
  );
};

export default RBSheetTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 45,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  input: {
    flex: 1,
    height: '90%',
    borderRadius: 20,
    fontFamily: FONTS.DMSans.regular,
    fontSize: 15,
    color: COLORS.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
});
