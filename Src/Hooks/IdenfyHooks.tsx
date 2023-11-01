import {start} from '@idenfy/react-native-sdk';

export const StartIdenfyVerification = (authToken: string = '') => {
  return start({
    authToken,
  });
};
