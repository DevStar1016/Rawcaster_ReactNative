import {PermissionsAndroid} from 'react-native';
import {DEVICE_VERSION, IS_IOS} from './Constants';

export const isHavePermissionToRecordAudio = async () => {
  if (IS_IOS) {
    return true;
  }
  try {
    const grants = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    if (
      (grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED ||
        parseInt(DEVICE_VERSION) >= 33) &&
      (grants['android.permission.READ_EXTERNAL_STORAGE'] ===
        PermissionsAndroid.RESULTS.GRANTED ||
        parseInt(DEVICE_VERSION) >= 33) &&
      grants['android.permission.RECORD_AUDIO'] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};
