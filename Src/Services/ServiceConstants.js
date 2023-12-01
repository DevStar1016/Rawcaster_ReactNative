import DeviceInfo from 'react-native-device-info';
export const SALT_KEY = 'MaeRaw7sj5d@Pgk*LO7!e4ubz&8b';
export const ENCRIPTION_STRING = 'rawcaster@!@#$QWERTxcvbn';
export const TERMS_CONDTION_URL = 'https://rawcaster.com/termsandconditions';

export const DEVICE_ID = DeviceInfo.getDeviceId();
export const APP_VERSION = DeviceInfo.getVersion();

//Local
// export const BASE_URL = 'http://192.168.1.162:8003/rawcaster/'; // Python Local

// Development
export const BASE_URL = 'https://devapi.rawcaster.com/rawcaster/';
export const MEETING_URL = 'https://dev.rawcaster.com/join/';
export const SOCIAL_SHARE_LINK = 'https://devshare.rawcaster.com/index.php?id=';

//Live
// export const BASE_URL = 'https://rawcaster.com/rawadmin/webservice/';
// export const MEETING_URL = 'https://rawcaster.com/join/';
// export const SOCIAL_SHARE_LINK =
//   'https://share.rawcaster.com/index.php?id=';
