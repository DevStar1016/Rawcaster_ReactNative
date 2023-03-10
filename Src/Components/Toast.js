import ToastMessage from 'react-native-toast-message';

const toastMessage = (message, isSuccess, visibilityTime = 3000) => {
  ToastMessage.show({
    type: 'tomatoToast',
    text1: message,
    visibilityTime: visibilityTime,
    props: {isSuccess: isSuccess},
  });
};

export default Toast = {
  success: (message = '', visibilityTime = 3000) =>
    toastMessage(message, true, visibilityTime),
  fail: (message = '', visibilityTime = 3000) =>
    toastMessage(message, false, visibilityTime),
};
