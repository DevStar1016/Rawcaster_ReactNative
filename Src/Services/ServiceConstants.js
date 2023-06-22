import DeviceInfo from 'react-native-device-info';
export const SALT_KEY = 'MaeRaw7sj5d@Pgk*LO7!e4ubz&8b';
export const TERMS_CONDTION_URL = 'https://rawcaster.com/termsandconditions';

export const DEVICE_ID = DeviceInfo.getDeviceId();
export const APP_VERSION = DeviceInfo.getVersion();

//Local
export const BASE_URL = 'http://192.168.1.108:8003/rawcaster/'; // Python Local

// Development
// export const BASE_URL = 'https://devapi.rawcaster.com/rawcaster/';
