import ToastMessage, {ToastPosition} from 'react-native-toast-message';
import {ToastActionButtonProp, ToastTypes} from '../Utilities/ToastConfig';

type ToastMessageOptionsProp = {
  description?: string;
  visibilityTime?: number;
  position?: ToastPosition;
  normalActionButton?: ToastActionButtonProp;
};

/**
 * Displays a toast message with the given parameters.
 * @param {string} message - The message to display in the toast.
 * @param {ToastTypes} [toastType] - The type of toast to display.
 * @param {number} [visibilityTime=3000] - The duration in milliseconds that the toast should be visible.
 * @param {ToastPosition} [position='top'] - The position on the screen where the toast should be displayed.
 * @param {ToastActionButtonProp} [normalActionButton] - The action button to display on the toast.
 * @param {string} [description] - Additional description text to display in the toast.
 * @returns None
 */
const toastMessage = (
  message: string,
  toastType?: ToastTypes,
  visibilityTime: number = 3000,
  position: ToastPosition = 'top',
  normalActionButton?: ToastActionButtonProp,
  description?: string,
) => {
  ToastMessage.show({
    type: 'tomatoToast',
    text1: message,
    text2: description,
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
      options.description,
    ),
};
