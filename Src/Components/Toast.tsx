import ToastMessage, {ToastPosition} from 'react-native-toast-message';
import {ToastActionButtonProp, ToastTypes} from '../Utilities/ToastConfig';

type ToastMessageOptionsProp = {
  visibilityTime?: number;
  position?: ToastPosition;
  normalActionButton?: ToastActionButtonProp;
};

const toastMessage = (
  message: string,
  toastType?: ToastTypes,
  visibilityTime: number = 3000,
  position: ToastPosition = 'top',
  normalActionButton?: ToastActionButtonProp,
) => {
  ToastMessage.show({
    type: 'tomatoToast',
    text1: message,
    visibilityTime: visibilityTime,
    props: {toastType, normalActionButton},
    position: position,
  });
};

export default {
  success: (
    message = '',
    options: ToastMessageOptionsProp = {visibilityTime: 3000, position: 'top'},
  ) =>
    toastMessage(message, 'success', options.visibilityTime, options.position),
  fail: (
    message = '',
    options: ToastMessageOptionsProp = {visibilityTime: 3000, position: 'top'},
  ) =>
    toastMessage(message, 'failed', options.visibilityTime, options.position),
  normal: (
    message = '',
    options: ToastMessageOptionsProp = {visibilityTime: 3000, position: 'top'},
  ) =>
    toastMessage(
      message,
      'normal',
      options.visibilityTime,
      options.position,
      options.normalActionButton,
    ),
};
