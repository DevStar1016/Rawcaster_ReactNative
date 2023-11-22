import {StyleSheet, TextInput, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import {secondsToMinutesAndSeconds} from '../Utilities/Methods';
import {IS_IOS} from '../Utilities/Constants';
import AutoFetchOtp from './AutoFetchOtp';

type Props = {
  onCodeChanged: (code: string) => void;
  paddingTop?: number;
  paddingBottom?: number;
  paddingVertical?: number;
  seconds?: number;
  numberOfDigits?: number;
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
  numberOfDigits = 6,
  onResendOtp,
  errorText,
}: Props) => {
  const [otpValue, setotp] = useState(['', '', '', '', '', '']);

  const [errorString, seterrorString] = useState('');
  const [timer, settimer] = useState(seconds);

  const inputs = useRef<any[]>([]);
  const [forcusedIndex, setforcusedIndex] = useState(0);

  useEffect(() => {
    onCodeChanged(otpValue?.join(''));
  }, [otpValue]);

  useEffect(() => {
    settimer(seconds);
  }, [seconds]);

  useEffect(() => {
    inputs.current[forcusedIndex]?.focus();
  }, []);

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

  const clearOtp = () => {
    setotp(['', '', '', '', '', '']);
  };

  const handleOtpChange = (value: string, index: number) => {
    seterrorString('');
    let isInvalid = false;
    value.split('').map(val => {
      /* @ts-ignore */
      if (isNaN(val) || !val.trim()) {
        isInvalid = true;
      }
    });
    if (isInvalid) {
      seterrorString('Enter valid OTP');
      return;
    }
    if (index > 0 && value === '') {
      inputs.current[index - 1]?.focus();
      setforcusedIndex(index - 1);
    }

    if (value.length >= 6) {
      clearOtp();
      let newOtp = [...otpValue];
      if (value.length === 6) {
        value.split('').map((val, ind) => (newOtp[ind] = val));
      } else {
        value
          .split('')
          .filter((_, ind) => ind !== 0)
          .map((val, ind) => (newOtp[ind] = val));
      }
      setotp(newOtp);
      inputs.current[5]?.focus();
      setforcusedIndex(5);
    } else if (value.length > 2) {
      seterrorString('OTP must have 6 digits');
      return;
    } else {
      const newOtp = [...otpValue];
      newOtp[index] = value.charAt(0);
      setotp(newOtp);
      // Move focus to the next box if the current one has a value
      if (value && index < newOtp.length - 1) {
        inputs.current[index + 1]?.focus();
        setforcusedIndex(index + 1);
      }
    }
  };

  const handleKeyPressTextInput = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (index > 0) {
        inputs.current[index - 1]?.focus();
        handleOtpChange('', index);
      }
    }
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {paddingTop, paddingBottom, paddingVertical},
      ]}>
      {!IS_IOS && (
        <AutoFetchOtp
          numberOfDigits={numberOfDigits}
          onResult={value => {
            setotp(value);
          }}
        />
      )}
      <StyledText style={styles.titleText}>Enter OTP</StyledText>
      <View style={styles.inputContainer}>
        {otpValue.map((digit, index) => (
          <TextInput
            key={index}
            style={[
              styles.inputField,
              {
                borderColor:
                  forcusedIndex === index ? COLORS.primary : COLORS.borderColor,
              },
            ]}
            onKeyPress={e => handleKeyPressTextInput(index, e.nativeEvent.key)}
            keyboardType="numeric"
            onChangeText={value => handleOtpChange(value, index)}
            value={digit}
            onFocus={() => {
              setforcusedIndex(index);
            }}
            // maxLength={1}
            selectTextOnFocus={true}
            textContentType="oneTimeCode"
            ref={input => {
              inputs.current[index] = input;
            }}
          />
        ))}
      </View>
      {errorText || errorString ? (
        <StyledText style={styles.errorText}>
          {errorText ? errorText : errorString}
        </StyledText>
      ) : null}
      <View style={styles.timerResendContainer}>
        <StyledText
          style={{
            ...styles.timerResendText,
            color: timer === 0 ? COLORS.secondary : COLORS.dimColor,
          }}
          onPress={() => {
            if (timer === 0 && onResendOtp) {
              setotp(['', '', '', '', '', '']);
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
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  inputField: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 10,
    borderBottomWidth: 1,
    color: '#000',
    textAlign: 'center',
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
  box: {
    borderWidth: 1,
    borderColor: 'black',
    width: 40,
    height: 40,
    margin: 10,
    textAlign: 'center',
    fontSize: 20,
  },
});
