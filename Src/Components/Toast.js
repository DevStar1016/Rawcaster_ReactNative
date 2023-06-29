import ToastMessage from 'react-native-toast-message';

const toastMessage = (
  message,
  isSuccess,
  visibilityTime = 3000,
  position = 'top',
) => {
  ToastMessage.show({
    type: 'tomatoToast',
    text1: message,
    visibilityTime: visibilityTime,
    props: {isSuccess: isSuccess},
    position: position,
  });
};

export default Toast = {
  success: (message = '', visibilityTime = 3000, position = 'top') =>
    toastMessage(message, true, visibilityTime, position),
  fail: (message = '', visibilityTime = 3000, position = 'top') =>
    toastMessage(message, false, visibilityTime, position),
};
