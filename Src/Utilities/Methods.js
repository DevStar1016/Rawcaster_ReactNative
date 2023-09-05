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
import {clearNuggetActionsReduxData} from '../Store/Slices/NuggetActionsSlice';
import {clearUtilityReduxData} from '../Store/Slices/UtilitySlice';

/**
 * Generates an authentication code by hashing the given value with a salt key.
 * @param {string} [value=''] - The value to be hashed.
 * @returns {string} The hashed authentication code.
 */
export const getAuthCode = (value = '') => {
  return sha1(SALT_KEY + value);
};

/**
 * Stores the token in encrypted storage, saves user data, and dispatches the token to the store.
 * @param {string} token - The token to store.
 * @param {object} user - The user data to save.
 * @param {function} dispatch - The dispatch function from the Redux store.
 * @returns None
 */
export const storeToken = async (token, user, dispatch) => {
  try {
    await EncryptedStorage.setItem(ISLOGIN, token);
    await storeUserData(user, dispatch);
    dispatch(setToken(token));
  } catch (error) {}
};

/**
 * Stores user data in encrypted storage and dispatches an action to update the user data in the Redux store.
 * @param {object} user - The user data to be stored.
 * @param {function} dispatch - The dispatch function from the Redux store.
 * @returns None
 */
export const storeUserData = async (user, dispatch) => {
  try {
    await EncryptedStorage.setItem(USER_DATA, JSON.stringify(user));
    dispatch(setUserData(user));
  } catch (error) {}
};

/**
 * Removes the user token and clears all relevant Redux data and stored user data.
 * @param {function} dispatch - The Redux dispatch function.
 * @returns None
 */
export const removeToken = async dispatch => {
  dispatch(setToken(null));
  dispatch(clearAuthReduxData());
  dispatch(clearHomeReduxData());
  dispatch(clearNuggetsListReduxData());
  dispatch(clearNuggetActionsReduxData());
  dispatch(clearUtilityReduxData());

  try {
    await EncryptedStorage.removeItem(ISLOGIN);
    await EncryptedStorage.removeItem(USER_DATA);
    const isGoogleSignedIn = await GoogleSignin.isSignedIn();
    if (isGoogleSignedIn) {
      await GoogleSignin.signOut();
    }
  } catch (error) {}
};

/**
 * Returns a sliced version of the given text with optional ellipsis.
 * @param {string} value - The text to be sliced.
 * @param {number} [sliceValue=40] - The number of characters to slice the text.
 * @param {boolean} [isEnableDots=true] - Whether to add ellipsis if the text is longer than the slice value.
 * @returns {string} - The sliced text.
 */
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

/**
 * Calculates an array of years based on the starting year and the number of decreased years.
 * @param {Object} options - The options object.
 * @param {number} [options.startingYear=1900] - The starting year for the calculation.
 * @param {number} [options.decreasedYears=0] - The number of years to decrease from the current year.
 * @returns {number[]} An array of years.
 */
export function getyears({startingYear = 1900, decreasedYears = 0}) {
  let thisYear = new Date().getFullYear() - decreasedYears;
  const offset = thisYear - startingYear;
  let allYears = [];
  for (let x = 0; x <= offset; x++) {
    allYears.push(thisYear - x);
  }
  return allYears;
}

/**
 * Converts a given number of milliseconds to a string representation of minutes and seconds.
 * @param {number} millis - The number of milliseconds to convert.
 * @returns {string} A string representation of minutes and seconds in the format "mm:ss".
 */
export const secondsToMinutesAndSeconds = millis => {
  var minutes = Math.floor(millis / 60);
  var seconds = (millis % 60).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};

/**
 * Extracts the file name from a given URL.
 * @param {string} url - The URL from which to extract the file name.
 * @returns {string} The file name extracted from the URL.
 */
export const getFileName = url => {
  let name = url.split('/').pop();
  return name;
};

/**
 * Get the media MIME type for the given URL and type.
 * @param {string} url - The URL of the media file.
 * @param {string} type - The type of the media file (e.g., "image", "video", "audio").
 * @returns {string} The MIME type of the media file.
 */
export const getMediaMimeType = (url, type) => {
  let fileExtension = getFileName(url).split('.').pop();
  return `${type}/${fileExtension}`;
};

/**
 * Returns a filtered list of duplicates from the given data list based on the specified field name.
 * @param {Array} dataList - The list of data to filter for duplicates.
 * @param {string} fieldName - The field name to check for duplicates. If not provided, the entire object will be checked for duplicates.
 * @returns {Array} - A filtered list of duplicates.
 */
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

/**
 * Determines whether friend requests are enabled based on the given status.
 * @param {number} status - The status code indicating the current state of friend requests.
 * @returns {boolean} - True if friend requests are enabled, false otherwise.
 */
export const getIsEnableFriendRequest = status => {
  switch (status) {
    case 0:
    case 1:
    case 3:
      return false;
    default:
      return true;
  }
};

/**
 * Checks if the app has been granted location permission.
 * @returns {Promise<boolean>} - A promise that resolves to true if location permission is granted, false otherwise.
 */
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

/**
 * Retrieves the latitude and longitude coordinates of the current device location.
 * @returns {Promise<{latitude: number, longitude: number}>} - A promise that resolves to an object containing the latitude and longitude coordinates.
 * @throws {Error} - If there is an error retrieving the location or if permission is not granted.
 */
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

/**
 * Retrieves the address of the current location using latitude and longitude coordinates.
 * @returns {Promise} A promise that resolves to an object containing the latitude, longitude, and address of the location.
 */
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
      .catch(e => {});
  });

  return promise;
};

/**
 * Returns a double-digit representation of the given value.
 * @param {number} value - The value to convert to double-digit representation.
 * @returns {string} - The double-digit representation of the value.
 */
export const getDoubleDigit = value => {
  if (value < 10) {
    return '0' + value;
  }
  return value;
};

/**
 * Converts a given date and time to a short date format.
 * @param {Date} dateTime - The date and time to convert.
 * @returns {string} The short date format of the given date and time, followed by "ago".
 */
export const dateToShortDate = dateTime => {
  var localTime = moment.utc(dateTime).toDate();
  return (
    moment(moment(localTime).format('YYYY-MM-DD HH:mm:ss')).fromNow(true) +
    ' ago'
  );
};

/**
 * Converts a given date and time to a short text date format.
 * @param {Date} dateTime - The date and time to convert.
 * @param {string} timeZone - The time zone to use for the conversion.
 * @param {boolean} [isShowYear=false] - Whether to include the year in the output.
 * @returns {string} The formatted short text date.
 */
export const dateToShortTextDate = (dateTime, timeZone, isShowYear = false) => {
  let userTime = utcToUserTimezone(dateTime, timeZone);
  return isShowYear
    ? userTime.format('MMM D YYYY [ • ] h:mm A ')
    : userTime.format('MMM D [ • ] h:mm A ');
};

/**
 * Formats a given number into a more readable format by adding suffixes like 'K', 'M', or 'B'
 * to represent thousands, millions, or billions respectively.
 * @param {number} num - The number to format.
 * @returns {string} The formatted number with the appropriate suffix.
 */
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

/**
 * Adds a file prefix to a given URL if it does not already have one.
 * @param {string} fileUrl - The URL to add the file prefix to.
 * @returns {string} The URL with the file prefix added.
 */
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

/**
 * Compresses media files based on their type.
 * @param {number} mediaType - The type of media file (1 for image, 2 for video).
 * @param {string} mediaPath - The path to the media file.
 * @returns {Promise<string>} - The compressed media file path.
 */
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

/**
 * Decodes HTML entities in the given text.
 * @param {string} text - The text to decode.
 * @returns The decoded text.
 */
export const htmlDecodeText = text => {
  return htmldecode(text);
};

/**
 * Extracts the timezone name from a string.
 * @param {string} str - The string containing the timezone information.
 * @returns {string} The extracted timezone name.
 */
export const getTimezoneName = str => {
  let index;
  try {
    index = str.indexOf('(');
  } catch (error) {}
  if (index > -1) return str.substr(0, index - 1).trim();
  else return str;
};

/**
 * Converts a UTC time to the user's timezone with the timezone abbreviation.
 * @param {string} time - The UTC time to convert in the format 'YYYY-MM-DD HH:mm:ss'.
 * @param {string} zonename - The name of the user's timezone.
 * @returns The timezone abbreviation for the converted time.
 */
export const utctoUserTimezonewithAbbr = (time, zonename) => {
  let utcCutoff = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  let displayCutoff = momentTZ(utcCutoff).tz(getTimezoneName(zonename));
  let timezoneabbrs = displayCutoff?.tz(getTimezoneName(zonename))?.format('z');
  return timezoneabbrs; // this return time zone i.e IST or GMT
};

/**
 * Converts a UTC time to the user's timezone.
 * @param {string} time - The UTC time to convert in the format 'YYYY-MM-DD HH:mm:ss'.
 * @param {string} zonename - The name of the user's timezone.
 * @returns {moment.Moment} - The converted time in the user's timezone.
 */
export const utcToUserTimezone = (time, zonename) => {
  let utcCutoff = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  let displayCutoff = momentTZ(utcCutoff)
    .tz(getTimezoneName(zonename))
    ?.format('YYYY-MM-DD HH:mm:ss');
  return moment(displayCutoff);
};

/**
 * Converts a UTC date and time to the system's local date and time.
 * @param {string} dateTime - The UTC date and time in the format 'YYYY-MM-DD HH:mm:ss'.
 * @returns {Date} - The converted local date and time.
 */
export const getUtcToSystemTime = dateTime => {
  return moment(dateTime, 'YYYY-MM-DD HH:mm:ss')
    .subtract(-moment().utcOffset(), 'minutes')
    .toDate();
};

/**
 * Retrieves the UTC offset string for the current timezone.
 * @param {string} moment.tz.guess() - The guessed timezone string.
 * @returns The UTC offset string for the current timezone.
 */
export const {utcOffsetStr} = getTimezone(moment.tz.guess());

/**
 * Converts a given time string to a formatted display event time.
 * @param {string} time - The time string to convert.
 * @returns {string} - The formatted display event time.
 */
export const getDisplayEventTime = time => {
  if (time) {
    return moment(time, 'YYYY-MM-DD hh:mm:ss').format('hh:mm A');
  }
  return '';
};

/**
 * Converts a given duration in milliseconds to a formatted string in the format "minutes:seconds".
 * @param {number} tempDuration - The duration in milliseconds.
 * @returns {string} - The formatted duration string.
 */
export const getMediaDurationFormat = tempDuration => {
  let time = tempDuration / 1000;
  let minutes = Math.floor(time / 60);
  let timeForSeconds = time - minutes * 60;
  let seconds = Math.floor(timeForSeconds);
  let secondsReadable = seconds > 9 ? seconds : `0${seconds}`;
  return `${minutes}:${secondsReadable}`;
};

/**
 * Returns the formatted display event date based on the received date and the specified date format.
 * @param {Date} receivedDate - The received date of the event.
 * @param {string} [dateFormat='MM/DD/YYYY'] - The format to use for the date. Defaults to 'MM/DD/YYYY'.
 * @returns {string} The formatted display event date.
 */
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

/**
 * Returns the default page for the given value.
 * @param {number} val - The value to determine the default page.
 * @returns {string} The default page based on the given value.
 */
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

/**
 * Returns a notification message based on the given type.
 * @param {number} type - The type of notification.
 * @returns {string} The notification message.
 */
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

/**
 * Generates a unique ID by combining the provided user ID (if any), the current UTC timestamp,
 * and a random number.
 * @param {string} [userId=''] - The user ID to include in the unique ID. Defaults to an empty string.
 * @returns {string} A unique ID string.
 */
export const getUniqueId = (userId = '') => {
  return (
    (userId ?? '') +
    '' +
    moment.utc().format('x') +
    '' +
    Math.floor(Math.random() * 10000 + 1)
  );
};

/**
 * Calculates the age based on the given date of birth.
 * @param {Date} dob - The date of birth.
 * @returns The calculated age.
 */
export const calcualteAge = dob => {
  var diff_ms = Date.now() - dob;
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

/**
 * Checks if a character is an alphabet letter.
 * @param {string} char - The character to check.
 * @returns {boolean} - True if the character is an alphabet letter, false otherwise.
 */
export function isAlphabet(char) {
  return /[a-zA-Z]/.test(char);
}

/**
 * Returns the corresponding notification type based on the given type value.
 * @param {number} type - The type value of the notification.
 * @returns {string} The notification type.
 */
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

/**
 * Formats the data for the Redux store by creating an object with the given category name
 * and nuggets list.
 * @param {string} categoryName - The name of the category.
 * @param {Array} nuggetsList - The list of nuggets.
 * @returns {Object} - The formatted data object for the Redux store.
 */
export const getNuggetsReduxStoreDataFormate = (categoryName, nuggetsList) => {
  return {
    categoryName,
    nuggetsList,
  };
};

/**
 * Converts milliseconds to minutes as a number.
 * @param {number} millis - The number of milliseconds to convert.
 * @returns {number} The converted value in minutes.
 */
export const getMillisToMinutesNumber = millis => {
  return parseFloat(parseFloat(millis) / 60000);
};
