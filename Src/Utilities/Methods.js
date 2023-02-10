import EncryptedStorage from 'react-native-encrypted-storage';
import Toast from 'react-native-toast-message';
import {SetToken} from '../Store/Slices/AuthSlice';
import {ISLOGIN, USER_DATA} from './EncryptedStoreConstants';

export const toastService = (message = '') => {
  Toast.show({
    type: 'success',
    text1: message,
  });
};

export const storeToken = async (token, user, dispatch) => {
  try {
    await EncryptedStorage.setItem(ISLOGIN, token);
    await EncryptedStorage.setItem(USER_DATA, JSON.stringify(user));
    dispatch(SetToken(token));
  } catch (error) {}
};

export const removeToken = async dispatch => {
  dispatch(SetToken(null));
  try {
    await EncryptedStorage.removeItem(ISLOGIN);
    await EncryptedStorage.removeItem(USER_DATA);
  } catch (error) {}
};

export function getyears({startingYear = 1900, decreasedYears = 0}) {
  let thisYear = new Date().getFullYear() - decreasedYears;
  const offset = thisYear - startingYear;
  let allYears = [];
  for (let x = 0; x <= offset; x++) {
    allYears.push(thisYear - x);
  }
  return allYears;
}
