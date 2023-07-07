import {SafeAreaView, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import SVGIcon from '../Components/SVGIcon';
import TextBox, {TextBoxProps} from '../Components/TextBox';
import SubmitButton, {SubmitButtonProps} from '../Components/SubmitButton';

type Props = {
  closePopup: () => void;
  title?: string;
  isRequired?: boolean;
  requiredErrorText?: string;
  textInputProps?: Omit<TextBoxProps, 'value' | 'onChangeText'>;
  submitButtonProps?: Omit<SubmitButtonProps, 'onPress'>;
  onSubmit: (value: string) => void;
};

const InputPopup = ({
  closePopup,
  title = '',
  textInputProps,
  requiredErrorText = 'Required',
  isRequired = true,
  submitButtonProps,
  onSubmit,
}: Props) => {
  const [value, setvalue] = useState('');
  const [errorText, seterrorText] = useState('');
  return (
    <View style={styles.mainContainer}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps={'handled'}
        style={{flexGrow: 0}}
        contentContainerStyle={{
          justifyContent: 'center',
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.subContainer}>
          <View style={styles.titleContainer}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <StyledText style={styles.titleText}>{title}</StyledText>
            </View>
            <SVGIcon
              icon="close_rounded_black"
              isButton
              height={20}
              width={20}
              onPress={closePopup}
            />
          </View>
          <TextBox
            value={value}
            errorText={errorText}
            onChangeText={text => {
              if (text.trim()) {
                seterrorText('');
              }
              setvalue(text);
            }}
            {...textInputProps}
          />
          <SubmitButton
            buttonText="SUBMIT"
            marginTop={5}
            onPress={() => {
              if (!value.trim() && isRequired) {
                seterrorText(requiredErrorText);
                return;
              }
              onSubmit(value);
            }}
            {...submitButtonProps}
          />
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default InputPopup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
