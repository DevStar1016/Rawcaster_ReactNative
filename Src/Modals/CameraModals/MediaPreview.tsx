import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
/*@ts-ignore*/
import Video from 'react-native-video';
import PhotoEditor from '@baronha/react-native-photo-editor';
import {COLORS} from '../../Utilities/Colors';
import {useInsets} from '../../Utilities/StoreData';
import SVGIcon from '../../Components/SVGIcon';
import CropImage from './CropImage';
import StyledText from '../../Components/StyledText';
import {IS_IOS} from '../../Utilities/Constants';
import {
  getFileName,
  getMediaMimeType,
  getUrlWithFilePrefix,
} from '../../Utilities/Methods';
import {IconType} from '../../Utilities/Icons';
import ImageZoomViewer from '../../Components/ImageZoomViewer';
import MediaProgressSlider from '../../Components/MediaProgressSlider';
import {FONTS} from '../../Utilities/Fonts';
import {Slider} from '@miblanchard/react-native-slider';

export type PreviewMediaData = {
  uri: string | '';
  mediaType: 'image' | 'video' | '';
};
type MediaItem = {
  name: string;
  uri: string;
  type: string;
};

type ActionButtonsProps = {
  onPress?: () => void;
  icon: IconType;
  iconSize?: number;
  marginRight?: number;
};

type Props = {
  setModal?: (value: boolean) => void;
  data: PreviewMediaData;
  onSendMedia?: (mediaItem: MediaItem) => void;
  isEnableDone?: boolean;
  isEnableEdit?: boolean;
};

const MediaPreview = ({
  setModal,
  data,
  onSendMedia,
  isEnableDone = true,
  isEnableEdit = true,
}: Props) => {
  const insets = useInsets();
  const videoPlayer = useRef<any>(null);
  const [mediaData, setmediaData] = useState<PreviewMediaData>(data);
  const [isOpenCrop, setisOpenCrop] = useState(false);
  const [pausedVideo, setpausedVideo] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setduration] = useState(0);
  const [isLoadingMedia, setisLoadingMedia] = useState(true);

  const openEditer = async () => {
    try {
      const resultUri: any = await PhotoEditor.open({
        path: mediaData.uri,
        stickers: [
          'https://cdn-icons-png.flaticon.com/512/5272/5272912.png',
          'https://cdn-icons-png.flaticon.com/512/5272/5272913.png',
          'https://cdn-icons-png.flaticon.com/512/5272/5272916.png',
        ],
      });

      setmediaData(pre => ({
        ...pre,
        uri: getUrlWithFilePrefix(resultUri),
      }));
    } catch (e) {
      console.log(e, 'ERRORR');
    }
  };

  const getDurationFormat = (tempDuration: any) => {
    let time = tempDuration / 1000;
    let minutes = Math.floor(time / 60);
    let timeForSeconds = time - minutes * 60;
    let seconds = Math.floor(timeForSeconds);
    let secondsReadable = seconds > 9 ? seconds : `0${seconds}`;
    return `${minutes}:${secondsReadable}`;
  };

  const seekUpdate = useCallback(
    async (seekTime: any) => {
      try {
        if (videoPlayer.current) videoPlayer.current.seek(seekTime);
      } catch (error) {}
    },
    [duration],
  );

  const playBackStatusUpdate = (playbackStatus: any) => {
    try {
      let currentTime = Math.round(playbackStatus.currentTime);
      let duration = Math.round(playbackStatus.seekableDuration);
      if (currentTime)
        if (duration) setProgress((currentTime / duration) * 100);
    } catch (error) {}
  };

  const onLoadComplete = (event: any) => {
    try {
      setduration(event.duration * 1000);
    } catch (error) {
      console.log(error, 'ONLOAD COMPLETE ERROR');
    }
  };

  const TopActionButton = ({
    onPress,
    icon,
    iconSize = 25,
    marginRight = 10,
  }: ActionButtonsProps) => {
    return (
      <TouchableOpacity
        style={[styles.topActionButtonContainer, {marginRight}]}
        activeOpacity={0.7}
        onPress={onPress}>
        <SVGIcon icon={icon} height={iconSize} width={iconSize} />
      </TouchableOpacity>
    );
  };

  const getSlider = useMemo(
    () => (
      <View style={[styles.sliderContainer, {width: '100%'}]}>
        <StyledText style={styles.timeOne}>
          {getDurationFormat(Math.floor((progress * duration) / 100))}
        </StyledText>
        <View style={{alignItems: 'center', width: '100%'}}>
          <Slider
            containerStyle={{height: 30, width: '90%'}}
            thumbTintColor={COLORS.white}
            maximumTrackTintColor={COLORS.white}
            minimumTrackTintColor={COLORS.primary}
            minimumValue={0}
            maximumValue={100}
            value={progress}
            onValueChange={data => seekUpdate(data[0])}
            thumbStyle={{
              height: 15,
              width: 15,
              borderRadius: 9,
            }}
          />
        </View>
        <StyledText style={styles.timeTwo}>
          {getDurationFormat(duration || 0)}
        </StyledText>
      </View>
    ),
    [duration, progress],
  );
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          paddingTop: insets.top ? insets.top : StatusBar.currentHeight,
          paddingBottom: 10,
          backgroundColor: COLORS.black,
        }}>
        <View style={styles.topBottomContainer}>
          <TopActionButton
            icon={'close_white'}
            iconSize={18}
            marginRight={0}
            onPress={() => {
              if (setModal) {
                setModal(false);
              }
            }}
          />
          {isEnableEdit && mediaData.mediaType.includes('image') && (
            <View style={styles.headerRightContainer}>
              <TopActionButton
                icon={'crop'}
                iconSize={23}
                // marginRight={15}
                marginRight={0}
                onPress={() => {
                  setisOpenCrop(true);
                }}
              />

              {/* <TopActionButton
                icon={'edit'}
                iconSize={22}
                marginRight={0}
                onPress={() => {
                  openEditer();
                }}
              /> */}
            </View>
          )}
        </View>
      </View>
      <View style={styles.dataContainer}>
        {mediaData &&
          (mediaData.mediaType.includes('image') ? (
            <View style={styles.mediaContainer}>
              {/* <ImageZoomViewer imageUri={mediaData.uri} /> */}
              <Image
                source={{uri: mediaData.uri}}
                resizeMode="contain"
                style={{height: '100%', width: '100%'}}
              />
            </View>
          ) : (
            <View style={styles.mediaContainer}>
              <Video
                ref={videoPlayer}
                repeat={IS_IOS}
                resizeMode="contain"
                posterResizeMode="cover"
                playInBackground={false}
                paused={pausedVideo}
                source={{uri: mediaData.uri}}
                style={{height: '80%', width: '100%'}}
                playWhenInactive={false}
                progressUpdateInterval={100}
                useTextureView={true}
                onBuffer={() => {}}
                onProgress={playBackStatusUpdate}
                onLoad={onLoadComplete}
                onEnd={() => {
                  setProgress(0);
                  if (videoPlayer.current) {
                    videoPlayer.current.seek(0);
                  }
                  if (!IS_IOS) {
                    setpausedVideo(true);
                  }
                }}
              />
              <TouchableOpacity
                style={styles.videoControlersContainer}
                activeOpacity={0.8}
                onPress={() => {
                  setpausedVideo(pre => !pre);
                }}>
                {pausedVideo && (
                  <View style={styles.playPauseButton}>
                    <SVGIcon
                      icon="play_white"
                      height={20}
                      width={20}
                      marginLeft={5}
                    />
                  </View>
                )}
              </TouchableOpacity>
              <View
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 0,
                  left: 0,
                }}>
                {/* <MediaProgressSlider
                  duration={duration}
                  progress={progress}
                  seekUpdate={seekUpdate}
                /> */}
                <View style={styles.videoControllerContainer}>{getSlider}</View>
              </View>
            </View>
          ))}
      </View>
      {isEnableDone && (
        <View
          style={[
            styles.topBottomContainer,
            {
              paddingTop: 10,
              paddingBottom: insets.bottom ? insets.bottom : 20,
              justifyContent: 'flex-end',
            },
          ]}>
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.7}
            onPress={() => {
              if (setModal) {
                setModal(false);
              }
              if (onSendMedia) {
                onSendMedia({
                  name: getFileName(mediaData.uri),
                  uri: mediaData.uri,
                  type: getMediaMimeType(mediaData.uri, mediaData.mediaType),
                });
              }
            }}>
            <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
              Done
            </StyledText>
            {/* <SVGIcon icon="send" marginLeft={-4} /> */}
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={isOpenCrop}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {
          setisOpenCrop(false);
        }}>
        <CropImage
          setModal={setisOpenCrop}
          uri={mediaData?.uri}
          onCropImage={(cropedUri: string) => {
            setmediaData(pre => ({
              ...pre,
              uri: getUrlWithFilePrefix(cropedUri),
            }));
          }}
        />
      </Modal>
    </View>
  );
};

export default MediaPreview;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  dataContainer: {
    flex: 1,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topBottomContainer: {
    backgroundColor: COLORS.black,
    paddingTop: 15,
    paddingHorizontal: 15,

    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topActionButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  headerRightContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // height: 50,
    // width: 50,
    // borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  videoControlersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '80%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  sliderContainer: {
    position: 'absolute',
    height: 55,
    bottom: 10,
    zIndex: 100,
  },
  timeOne: {
    color: COLORS.white,
    position: 'absolute',
    left: 15,
    fontSize: 13,
    bottom: 10,
    paddingVertical: 5,
    fontFamily: FONTS.DMSans.medium,
  },
  timeTwo: {
    color: COLORS.white,
    position: 'absolute',
    right: 15,
    fontSize: 13,
    bottom: 10,
    paddingVertical: 5,
    fontFamily: FONTS.DMSans.medium,
  },
  videoControllerContainer: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
