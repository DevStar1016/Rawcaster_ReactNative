import {GoogleSignin} from '@react-native-google-signin/google-signin';
import moment from 'moment';
import {PermissionsAndroid, Platform} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Geolocation from 'react-native-geolocation-service';
import Geocode from 'react-geocode';
import sha1 from 'sha1';
import Compressor from 'react-native-compressor';
import {SALT_KEY} from '../Services/ServiceConstants';
import {setToken, setUserData} from '../Store/Slices/AuthSlice';
import momentTZ from 'moment-timezone';
import {
  setGlobalLoading,
  setLocationDetails,
} from '../Store/Slices/UtilitySlice';
import {ISLOGIN, USER_DATA} from './EncryptedStoreConstants';
import {decode as htmldecode} from 'html-entities';
import ImageCropPicker from 'react-native-image-crop-picker';

export const getAuthCode = (value = '') => {
  return sha1(SALT_KEY + value);
};

export const storeToken = async (token, user, dispatch) => {
  try {
    await EncryptedStorage.setItem(ISLOGIN, token);
    await EncryptedStorage.setItem(USER_DATA, JSON.stringify(user));
    dispatch(setToken(token));
    dispatch(setUserData(user));
  } catch (error) {}
};

export const removeToken = async dispatch => {
  dispatch(setToken(null));
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
  let tempSlicedValue = value.slice(0, sliceValue);
  if (value.length > sliceValue && isEnableDots) {
    tempSlicedValue = tempSlicedValue.trim() + '...';
  }
  return tempSlicedValue;
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
    const x = acc.find(item => item[fieldName] === current[fieldName]);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
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
            // dispatch(
            //   setLocationDetails({
            //     latitude: location.coords.latitude,
            //     longitude: location.coords.longitude,
            //   }),
            // );
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
  return moment(moment(localTime).format('YYYY-MM-DD HH:mm:ss')).fromNow();
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

export const getMinutesSecondsFormate = seconds => {
  let time = '';
  let min = Math.floor(seconds / 60);

  if (min < 10) {
    time = '0';
  }
  time = `${time + min}:`;
  if (Math.floor(seconds % 60) < 10) {
    time = `${time}0`;
  }
  if (seconds >= 60) {
    time = `${time + Math.floor(seconds % 60)}`;
  } else {
    time = `${time + seconds}`;
  }

  return time;
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

export const utcToUserTimezone = (time, zonename) => {
  let utcCutoff = moment.utc(time, 'YYYY-MM-DD HH:mm:ss');
  let displayCutoff = momentTZ(utcCutoff)
    .tz(getTimezoneName(zonename))
    .format('YYYY-MM-DD HH:mm:ss');
  return moment(displayCutoff);
};

export function imageVideoPicker({
  width = undefined,
  height = undefined,
  isCrop = true,
  multiple = false,
  mediaType,
}) {
  const promise = new Promise(async (resolve, reject) => {
    ImageCropPicker.openPicker({
      width: width,
      height: height,
      cropping: mediaType === 'photo',
      multiple: multiple,
      mediaType: mediaType,
      smartAlbums: [
        'PhotoStream',
        'Generic',
        'Panoramas',
        'Videos',
        'Favorites',
        'Timelapses',
        'AllHidden',
        'RecentlyAdded',
        'Bursts',
        'SlomoVideos',
        'UserLibrary',
        'SelfPortraits',
        'Screenshots',
        'DepthEffect',
        'LivePhotos',
        'Animated',
        'LongExposure',
      ],
    })
      .then(res => {
        if (multiple) {
          let selectedMediaList = [...res].map(item => {
            return {
              uri: getUrlWithFilePrefix(item.path),
              type: item.mime,
              name: getFileName(item.path),
            };
          });
          resolve(selectedMediaList);
        } else {
          resolve({
            uri: getUrlWithFilePrefix(res.path),
            type: res.mime,
            name: getFileName(res.path),
          });
        }
      })
      .catch(err => {
        reject(err);
      });
  });
  return promise;
}
