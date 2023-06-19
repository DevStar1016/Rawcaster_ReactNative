import DeviceInfo from 'react-native-device-info';
export const SALT_KEY = 'MaeRaw7sj5d@Pgk*LO7!e4ubz&8b';
// export const BASE_URL = 'https://dev.rawcaster.com/rawadmin/webservice/'; // PHP
// export const BASE_URL = 'https://cbe.themaestro.in:8010/rawcaster/'; // Python
export const BASE_URL = 'http://192.168.1.108:8003/rawcaster/'; // Python Local
// export const BASE_URL = 'https://devapi.rawcaster.com/rawcaster/'; //Python Dev

export const TERMS_CONDTION_URL = 'https://rawcaster.com/termsandconditions';

export const DEVICE_ID = DeviceInfo.getDeviceId();
export const APP_VERSION = DeviceInfo.getVersion();

// Development
// export const BASE_URL = 'https://devapi.rawcaster.com/rawcaster/';
