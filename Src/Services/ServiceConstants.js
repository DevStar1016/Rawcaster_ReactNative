import DeviceInfo from 'react-native-device-info';
export const SALT_KEY = 'MaeRaw7sj5d@Pgk*LO7!e4ubz&8b';
export const ENCRIPTION_STRING = 'rawcaster@!@#$QWERTxcvbn';
// export const TERMS_CONDTION_URL = 'https://www.rawcaster.com/termsandconditions';
// export const PRIVACY_POLICY_URL = 'https://www.rawcaster.com/privacypolicy';
// export const COOKIES_POLICY = 'https://www.rawcaster.com/cookiespolicy';

export const TERMS_CONDTION_URL =
  'https://dev.rawcaster.com/mobiletermsandconditions';
export const PRIVACY_POLICY_URL =
  'https://dev.rawcaster.com/mobileprivacypolicy';
export const COOKIES_POLICY = 'https://dev.rawcaster.com/mobilecookiespolicy';

export const DEVICE_ID = DeviceInfo.getDeviceId();
export const APP_VERSION = DeviceInfo.getVersion();

//Local
// export const BASE_URL = 'http://192.168.1.162:8003/rawcaster/'; // Python Local

// Development
export const BASE_URL = 'https://api.rawcaster.com/rawcaster/';
export const MEETING_URL = 'https://dev.rawcaster.com/join/';
export const NUGGET_SHARE_LINK =
  'https://devshare.rawcaster.com/nugget/index.php?id=';

// Production
// export const BASE_URL = 'https://api.rawcaster.com/rawcaster/';

//Live
// export const BASE_URL = 'https://rawcaster.com/rawadmin/webservice/';
// export const MEETING_URL = 'https://rawcaster.com/join/';
// export const NUGGET_SHARE_LINK =
//   'https://share.rawcaster.com/index.php?id=';
