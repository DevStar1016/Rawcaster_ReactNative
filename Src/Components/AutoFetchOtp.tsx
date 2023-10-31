import React, {useEffect} from 'react';
import {isArray} from 'lodash';
import {IS_IOS} from '../Utilities/Constants';

type AutoFetchOtpProps = {
  numberOfDigits?: number;
  onResult: (val: string[]) => void;
};

const AutoFetchOtp = ({numberOfDigits = 6, onResult}: AutoFetchOtpProps) => {
  if (!IS_IOS) {
    const {startOtpListener, useOtpVerify} = require('react-native-otp-verify');
    const {stopListener} = useOtpVerify({
      numberOfDigits,
    });
    useEffect(() => {
      startOtpListener((message: any) => {
        if (message) {
          const otpDigits = /(\d{6})/g.exec(message);
          if (otpDigits && isArray(otpDigits)) {
            const codeArray = otpDigits[0].split('');

            if (isArray(codeArray) && codeArray.length === numberOfDigits) {
              onResult(codeArray);
            }
          }
        }
      });
      return () => stopListener();
    }, []);
  }

  return <></>;
};

export default AutoFetchOtp;
