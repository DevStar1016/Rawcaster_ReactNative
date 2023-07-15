import {GoogleSignin} from '@react-native-google-signin/google-signin';
import moment from 'moment';
import {PermissionsAndroid, Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Geolocation from 'react-native-geolocation-service';
import Geocode from 'react-geocode';
import sha1 from 'sha1';
import Compressor from 'react-native-compressor';
import {SALT_KEY} from '../Services/ServiceConstants';
import {
  clearAuthReduxData,
  setToken,
  setUserData,
} from '../Store/Slices/AuthSlice';
import momentTZ from 'moment-timezone';
import {ISLOGIN, USER_DATA} from './EncryptedStoreConstants';
import {decode as htmldecode} from 'html-entities';
import {getTimezone} from 'countries-and-timezones';
import {clearHomeReduxData} from '../Store/Slices/HomeSlice';
import {clearNuggetsListReduxData} from '../Store/Slices/NuggetsListSlice';

export const getAuthCode = (value = '') => {
  return sha1(SALT_KEY + value);
};

export const storeToken = async (token, user, dispatch) => {
  try {
    await EncryptedStorage.setItem(ISLOGIN, token);
    await storeUserData(user, dispatch);
    dispatch(setToken(token));
  } catch (error) {}
};

export const storeUserData = async (user, dispatch) => {
  try {
    await EncryptedStorage.setItem(USER_DATA, JSON.stringify(user));
    dispatch(setUserData(user));
  } catch (error) {}
};

export const removeToken = async dispatch => {
  dispatch(setToken(null));
  dispatch(clearAuthReduxData());
  dispatch(clearHomeReduxData());
  dispatch(clearNuggetsListReduxData());
  try {
    await EncryptedStorage.removeItem(ISLOGIN);
    await EncryptedStorage.removeItem(USER_DATA);
    const isGoogleSignedIn = await GoogleSignin.isSignedIn();
    if (isGoogleSignedIn) {
      await GoogleSignin.signOut();
    }
  } catch (error) {}
};

export const getSlicedText = (
  value = '',
  sliceValue = 40,
  isEnableDots = true,
) => {
  if (value) {
    let tempSlicedValue = value.slice(0, sliceValue);
    if (value.length > sliceValue && isEnableDots) {
      tempSlicedValue = tempSlicedValue.trim() + '...';
    }
    return tempSlicedValue;
  }
  return '';
};

export function getyears({startingYear = 1900, decreasedYears = 0}) {
  let thisYear = new Date().getFullYear() - decreasedYears;
  const offset = thisYear - startingYear;
  let allYears = [];
  for (let x = 0; x <= offset; x++) {
    allYears.push(thisYear - x);
  }
  return allYears;
}

export const secondsToMinutesAndSeconds = millis => {
  var minutes = Math.floor(millis / 60);
  var seconds = (millis % 60).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

export const getFileName = url => {
  let name = url.split('/').pop();
  return name;
};

export const getMediaMimeType = (url, type) => {
  let fileExtension = getFileName(url).split('.').pop();
  return `${type}/${fileExtension}`;
};

export const getFilteredDuplicatesList = (dataList = [], fieldName) => {
  return dataList.reduce((acc, current) => {
    const x = acc.find(item =>
      fieldName ? item[fieldName] === current[fieldName] : item === current,
    );
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
};

export const getIsEnableFriendRequest = status => {
  switch (status) {
    case 0:
      return false;
    case 1:
      return false;
    case 3:
      return false;
    default:
      return true;
  }
};

const getIsGrantedLocationPermission = async () => {
  let result;
  if (Platform.OS === 'ios') {
    result = await Geolocation.requestAuthorization('always')
      .then(res => {
        if (res === 'granted') {
          return true;
        } else {
          return false;
        }
      })
      .catch(e => {
        return false;
      });
  } else {
    result = await PermissionsAndroid.requestMultiple([
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ])
      .then(res => {
        if (
          res['android.permission.ACCESS_COARSE_LOCATION'] === 'granted' &&
          res['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        ) {
          return true;
        } else {
          return false;
        }
      })
      .catch(e => {
        return false;
      });
  }
  return result;
};

const getLatitudeLongitude = async () => {
  const promise = new Promise(async (resolve, reject) => {
    try {
      let isPermissionGranted = await getIsGrantedLocationPermission();
      if (isPermissionGranted) {
        Geolocation.getCurrentPosition(
          location => {
            resolve({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          },
          error => {
            reject(error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } else {
        reject('Permission not granted');
      }
    } catch (e) {
      reject(e);
    }
  });

  return promise;
};

export const getLocationAddress = () => {
  const promise = new Promise(async (resolve, reject) => {
    getLatitudeLongitude()
      .then(res => {
        Geocode.fromLatLng(res.latitude, res.longitude).then(
          response => {
            let locationArr = [
              'locality',
              'administrative_area_level_1',
              'country',
            ];

            const addressArr = response.results[0].address_components.filter(
              data => {
                if (Array.isArray(data.types) && data.types.length > 0) {
                  return locationArr.includes(data.types[0]);
                }
              },
            );

            let address = '';
            addressArr.forEach((ele, ind) => {
              address += ele.long_name;
              address += addressArr.length - 1 === ind ? '.' : ', ';
            });
            resolve({
              latitude: res.latitude,
              longitude: res.longitude,
              geoLocation: address,
            });
          },
          error => {
            reject(error);
          },
        );
      })
      .catch(e => {
        console.log(e, 'ERROROROOROORR');
      });
  });

  return promise;
};

export const getDoubleDigit = value => {
  if (value < 10) {
    return '0' + value;
  }
  return value;
};

export const dateToShortDate = dateTime => {
  var localTime = moment.utc(dateTime).toDate();
  return (
    moment(moment(localTime).format('YYYY-MM-DD HH:mm:ss')).fromNow(true) +
    ' ago'
  );
};

export const bigNumberFormater = num => {
  if (num >= 1000000000) {
    // Divide by 1 billion and round to one decimal place
    num = (num / 1000000000).toFixed(1);
    if (num % 1 === 0) {
      num = num.slice(0, -2);
    }
    num += 'B';
  } else if (num >= 1000000) {
    // Divide by 1 million and round to one decimal place
    num = (num / 1000000).toFixed(1);
    if (num % 1 === 0) {
      num = num.slice(0, -2);
    }
    num += 'M';
  } else if (num >= 1000) {
    // Divide by 1000 and round to one decimal place
    num = (num / 1000).toFixed(1);
    if (num % 1 === 0) {
      num = num.slice(0, -2);
    }
    num += 'K';
  }
  return num;
};

export const getUrlWithFilePrefix = (fileUrl = '') => {
  let url = fileUrl ?? '';

  if (
    url.toLowerCase().includes('content://') ||
    url.toLowerCase().includes('file://') ||
    url.toLowerCase().includes('http://') ||
    url.toLowerCase().includes('https://')
  ) {
    return url;
  }
  return `file://${url}`;
};

export const compressMedia = async (mediaType, mediaPath) => {
  // mediaType --- 1 - image , 2 - Video
  mediaPath = getUrlWithFilePrefix(mediaPath);
  let result = mediaPath;
  if (mediaType === 1) {
    let fileExtension = getFileName(mediaPath).split('.').pop();
    if (!fileExtension.includes('gif')) {
      result = await Compressor.Image.compress(mediaPath, {
        compressionMethod: 'auto',
      });
    }
  } else if (mediaType === 2) {
    result = await Compressor.Video.compress(
      mediaPath,
      {
        compressionMethod: 'auto',
      },
      progress => {},
    );
  }
  return result;
};

export const htmlDecodeText = text => {
  return htmldecode(text);
};

export const getTimezoneName = str => {
  let index;
  try {
    index = str.indexOf('(');
  } catch (error) {}
  if (index > -1) return str.substr(0, index - 1).trim();
  else return str;
};

export const utctoUserTimezonewithAbbr = (time, zonename) => {
  let utcCutoff = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  let displayCutoff = momentTZ(utcCutoff).tz(getTimezoneName(zonename));
  let timezoneabbrs = displayCutoff?.tz(getTimezoneName(zonename))?.format('z');
  return timezoneabbrs; // this return time zone i.e IST or GMT
};

export const utcToUserTimezone = (time, zonename) => {
  let utcCutoff = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  let displayCutoff = momentTZ(utcCutoff)
    .tz(getTimezoneName(zonename))
    ?.format('YYYY-MM-DD HH:mm:ss');
  return moment(displayCutoff);
};

export const getUtcToSystemTime = dateTime => {
  return moment(dateTime, 'YYYY-MM-DD HH:mm:ss')
    .subtract(-moment().utcOffset(), 'minutes')
    .toDate();
};

export const {utcOffsetStr} = getTimezone(moment.tz.guess());

export const getDisplayEventTime = time => {
  if (time) {
    return moment(time, 'YYYY-MM-DD hh:mm:ss').format('hh:mm A');
  }
  return '';
};

export const getMediaDurationFormat = tempDuration => {
  let time = tempDuration / 1000;
  let minutes = Math.floor(time / 60);
  let timeForSeconds = time - minutes * 60;
  let seconds = Math.floor(timeForSeconds);
  let secondsReadable = seconds > 9 ? seconds : `0${seconds}`;
  return `${minutes}:${secondsReadable}`;
};

export const getDisplayEventDate = (
  receivedDate,
  dateFormat = 'MM/DD/YYYY',
) => {
  if (receivedDate) {
    let todaysDate;
    if (utcOffsetStr) {
      todaysDate = utcToUserTimezone(
        receivedDate,
        moment.tz.guess() + ' (+' + utcOffsetStr + ')',
      ).format(dateFormat);
    }
    return utcOffsetStr ? todaysDate : '';
  }
  return '';
};

export const getDefaultRawcasterPage = val => {
  switch (val) {
    case 1:
      return 'Nugget';
    case 2:
      return 'Event';
    case 3:
      return 'Chat';
    default:
      return 'Nugget';
  }
};

export const getNotificationMessage = type => {
  switch (parseInt(type)) {
    case 1:
      return 'Posted a new Nugget';
    case 2:
      return 'Edited the Nugget';
    case 3:
      return 'Commented on your Nugget';
    case 4:
      return 'Replied on your comment';
    case 5:
      return 'Agreed your Nugget';
    case 6:
      return 'Agreed your Comment';
    case 7:
      return 'Agreed your reply';
    case 8:
      return 'Shared your Nugget';
    case 9:
      return 'Posted a new Event';
    case 10:
      return 'Updated the Event';
    case 11:
      return 'Sent a connection request';
    case 12:
      return 'Accepted your connection request';
    case 13:
      return 'Posted a talkshow';
    case 14:
      return 'Live now';
    case 15:
      return 'Started following you';
    case 16:
      return 'Poll Results';
    default:
      return '';
  }
};

export const getUniqueId = (userId = '') => {
  return (
    (userId ?? '') +
    '' +
    moment.utc().format('x') +
    '' +
    Math.floor(Math.random() * 10000 + 1)
  );
};

export const calcualteAge = dob => {
  var diff_ms = Date.now() - dob;
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export function isAlphabet(char) {
  return /[a-zA-Z]/.test(char);
}

export const getNotificationType = type => {
  switch (parseInt(type)) {
    case 1:
      return 'nuggets';
    case 2:
      return 'events';
    case 3:
      return 'connections';
    case 4:
      return 'groups';
    case 5:
      return 'fans';
    case 6:
      return 'poll_results';

    default:
      return '';
  }
};

export const getNuggetsReduxStoreDataFormate = (categoryName, nuggetsList) => {
  return {
    categoryName,
    nuggetsList,
  };
};

export const getMillisToMinutesNumber = millis => {
  return parseFloat(parseFloat(millis) / 60000);
};
