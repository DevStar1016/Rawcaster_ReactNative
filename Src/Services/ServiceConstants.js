import DeviceInfo from 'react-native-device-info';
export const SALT_KEY = 'MaeRaw7sj5d@Pgk*LO7!e4ubz&8b';
// export const BASE_URL = 'https://dev.rawcaster.com/rawadmin/webservice/'; // PHP
// export const BASE_URL = 'https://cbe.themaestro.in:8010/rawcaster/'; // Python
export const BASE_URL = 'http://192.168.1.108:8003/rawcaster/'; // Python Local
// export const BASE_URL = 'https://devapi.rawcaster.com/rawcaster/'; //Python Dev

export const TERMS_CONDTION_URL = 'https://rawcaster.com/termsandconditions';
export const GOOGLE_PLACES_API_KEY = 'AIzaSyBOEl17DNwCcE0sR9LGJh72rBGF_vDfk1c';
export const GOOGLE_SERACH_ANDROID = 'AIzaSyCzQ6s5bOUc8E_SPl90yLu-vqxGvBHJbEw';
export const GOOGLE_SERACH_IOS = 'AIzaSyB3Brz3Wd5JBwUhbCFCxBL_hblMZduRTPo';
export const GOOGLE_SIGNIN_IOS_CLIENT_ID =
  '749429188201-hr5vbe4pr5j0pq2ghg0el9abp03hqmck.apps.googleusercontent.com';
export const FIREBASE_APP_ID = '1:165212392194:android:00153d39ed399c4309d01b';
export const GOOGLE_CONTACTS_SERVER_CLIENT_ID =
  '749429188201-u1e40oco3dejrfcnr7algubh0k0sf01e.apps.googleusercontent.com';
export const GOOGLE_CONTACTS_SERVER_CLIENT_SECRET =
  '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';

export const DEVICE_ID = DeviceInfo.getDeviceId();
export const APP_VERSION = DeviceInfo.getVersion();
