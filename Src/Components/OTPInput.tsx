import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';

type Props = {
  onCodeChanged: (code: string) => void;
  paddingTop?: number;
  paddingBottom?: number;
  paddingVertical?: number;
};

const OTPInput = ({
  onCodeChanged,
  paddingTop,
  paddingBottom,
  paddingVertical = 10,
}: Props) => {
  return (
    <View
      style={[
        styles.mainContainer,
        {paddingTop, paddingBottom, paddingVertical},
      ]}>
      <StyledText style={styles.titleText}>Enter OTP</StyledText>
      <View style={styles.inputContainer}>
        <OTPInputView
          style={{width: '100%', height: '100%'}}
          pinCount={6}
          autoFocusOnLoad
          codeInputFieldStyle={styles.inputField}
          codeInputHighlightStyle={styles.focusedField}
          onCodeChanged={onCodeChanged}
        />
      </View>
      <View style={styles.timerResendContainer}>
        <StyledText style={styles.timerResendText} isButton onPress={() => {}}>
          Resend code
        </StyledText>
        <StyledText style={styles.timerResendText}>59:00</StyledText>
      </View>
    </View>
  );
};

export default OTPInput;

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 10,
  },
  inputContainer: {
    height: 60,
    justifyContent: 'center',
  },

  inputField: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    borderBottomWidth: 1,
    color: '#000',
  },

  focusedField: {
    borderColor: COLORS.primary,
  },
  titleText: {
    color: COLORS.black,
  },
  timerResendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  timerResendText: {
    color: COLORS.dimColor,
    fontSize: 18,
  },
});
