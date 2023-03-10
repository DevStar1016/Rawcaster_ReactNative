import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {secondsToMinutesAndSeconds} from '../Utilities/Methods';

type Props = {
  onCodeChanged: (code: string) => void;
  paddingTop?: number;
  paddingBottom?: number;
  paddingVertical?: number;
  seconds?: number;
  errorText?: string;
  onResendOtp?: () => void;
};
let interval: any;
const OTPInput = ({
  onCodeChanged,
  paddingTop,
  paddingBottom,
  paddingVertical = 10,
  seconds = 0,
  onResendOtp,
  errorText,
}: Props) => {
  const [timer, settimer] = useState(seconds);

  useEffect(() => {
    settimer(seconds);
  }, [seconds]);

  useEffect(() => {
    interval = setInterval(() => {
      settimer(pre => {
        if (pre === 0) {
          clearInterval(interval);
          return 0;
        } else {
          return pre - 1;
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds]);

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
      {errorText ? (
        <StyledText style={styles.errorText}>{errorText}</StyledText>
      ) : null}
      <View style={styles.timerResendContainer}>
        <StyledText
          style={{
            ...styles.timerResendText,
            color: timer === 0 ? COLORS.secondary : COLORS.dimColor,
          }}
          onPress={() => {
            if (timer === 0 && onResendOtp) {
              onResendOtp();
            }
          }}>
          Resend code
        </StyledText>
        <StyledText style={styles.timerResendText}>
          {secondsToMinutesAndSeconds(timer)}
        </StyledText>
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
    paddingVertical: 5,
  },
  timerResendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  timerResendText: {
    color: COLORS.dimColor,
    fontSize: 18,
    paddingVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    paddingVertical: 5,
  },
});
