import ImageCropPicker from 'react-native-image-crop-picker';
import {getFileName, getUrlWithFilePrefix} from './Methods';

type Props = {
  width?: number;
  height?: number;
  isCrop?: boolean;
  multiple?: boolean;
  mediaType?: 'photo' | 'video' | 'any';
};

type ResponseProp = {
  uri: string;
  name: string;
  type: string;
};

export function ImageVideoPicker({
  width = undefined,
  height = undefined,
  isCrop = true,
  multiple = false,
  mediaType = 'any',
}: Props) {
  const promise = new Promise(async (resolve, reject) => {
    ImageCropPicker.openPicker({
      width: width,
      height: height,
      cropping: mediaType === 'photo' && isCrop,
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
      .then((res: any) => {
        if (multiple) {
          let selectedMediaList: ResponseProp[] = res.map((item: any) => {
            return {
              uri: getUrlWithFilePrefix(item.path),
              type: item.mime,
              name: getFileName(item.path),
            };
          });
          resolve(selectedMediaList);
        } else {
          let selectdeMedia: ResponseProp = {
            uri: getUrlWithFilePrefix(res.path),
            type: res.mime,
            name: getFileName(res.path),
          };
          resolve(selectdeMedia);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
  return promise;
}
