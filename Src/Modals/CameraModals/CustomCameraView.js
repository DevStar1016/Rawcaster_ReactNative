import {
  Animated,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {COLORS} from '../../Utilities/Colors';
import Loader from '../../Components/Loader';
import SVGIcon from '../../Components/SVGIcon';
import {useInsets} from '../../Utilities/StoreData';
import {IS_IOS} from '../../Utilities/Constants';
import MediaPreview from './MediaPreview';
import {getUrlWithFilePrefix} from '../../Utilities/Methods';
import StyledText from '../../Components/StyledText';
import {FONTS} from '../../Utilities/Fonts';
import VideoRecordTimer from '../../Components/VideoRecordTimer';

const MAX_VIDEO_SECONDS = 180;

const CustomCameraView = ({setModal, onSendMedia}) => {
  const [cameraSetting, setcameraSetting] = useState({
    flashMode: 0, // 0 - off , 1 - on , 2 - auto
    cameraType: IS_IOS ? 1 : 2, // 1 - back , 2 - front
  });
  const [isOpenPreview, setisOpenPreview] = useState(false);
  const camera = useRef(null);
  const device = useCameraDevices();
  const [isVideoRecording, setisVideoRecording] = useState(false);
  const [mediaData, setmediaData] = useState({
    uri: '',
    mediaType: '',
  });
  const animatedButtonScale = new Animated.Value(1);
  const insets = useInsets();

  const getCameraType = () => {
    switch (cameraSetting.cameraType) {
      case 1:
        return device.back;
      case 2:
        return device.front;
      default:
        return device.back;
    }
  };

  const getFlashIcon = () => {
    if (cameraSetting.flashMode === 0) {
      return 'flash_off';
    } else if (cameraSetting.flashMode === 1) {
      return 'flash_on';
    }
    return 'flash_auto';
  };

  const getFlashMode = () => {
    switch (cameraSetting.flashMode) {
      case 0:
        return 'off';
      case 1:
        return 'on';
      case 2:
        return 'auto';
      default:
        'off';
    }
  };

  const handleTakePicture = async () => {
    if (camera.current) {
      try {
        const options = {
          flash: getFlashMode(),
        };
        const data = await camera.current.takePhoto(options);
        setmediaData({
          uri: getUrlWithFilePrefix(data.path),
          mediaType: 'image',
        });
        setisOpenPreview(true);
      } catch (e) {
        console.log(e, 'ERROR');
      }
    }
  };

  const onVideoRecordFinished = data => {
    setisVideoRecording(false);
    setmediaData({uri: getUrlWithFilePrefix(data.path), mediaType: 'video'});
    setisOpenPreview(true);
  };

  const onVideoRecordError = error => {
    console.log(error, 'RECORD ERROR');
    setisVideoRecording(false);
  };

  const handleStopVideoRecording = async () => {
    try {
      await camera.current.stopRecording();
      setisVideoRecording(false);
    } catch (e) {
      setisVideoRecording(false);
    }
  };

  const handleRecordVideo = async () => {
    if (camera.current) {
      try {
        setisVideoRecording(true);
        const options = {
          flash: getFlashMode(),
          onRecordingFinished: onVideoRecordFinished,
          onRecordingError: onVideoRecordError,
        };
        camera.current.startRecording(options);
      } catch (e) {
        console.log(e, 'ERROR RECORDING');
        setisVideoRecording(false);
      }
    }
  };

  const onPressInMediaActionButton = () => {
    Animated.spring(animatedButtonScale, {
      toValue: 1.5,
      useNativeDriver: true,
    }).start();
  };

  const onPressOutMediaActionButton = () => {
    Animated.spring(animatedButtonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    if (isVideoRecording) {
      handleStopVideoRecording();
    }
  };

  const MediaActionButton = () => {
    return (
      <TouchableOpacity
        style={[styles.mediaActionButton]}
        activeOpacity={0.7}
        delayLongPress={400}
        onLongPress={() => {
          if (!isVideoRecording) {
            handleRecordVideo();
          }
        }}
        onPress={() => {
          if (isVideoRecording) {
            handleStopVideoRecording();
          } else {
            handleTakePicture();
          }
        }}>
        <View
          style={[
            styles.innerMediaActionButtonContainer,
            {backgroundColor: isVideoRecording ? COLORS.red : COLORS.white},
          ]}></View>
      </TouchableOpacity>
    );
  };

  const TopActionButton = ({onPress, icon, iconSize = 25}) => {
    return (
      <TouchableOpacity
        style={styles.topActionButtonContainer}
        activeOpacity={0.7}
        onPress={onPress}>
        <SVGIcon icon={icon} height={iconSize} width={iconSize} />
      </TouchableOpacity>
    );
  };

  const BottomActionButton = ({onPress, icon, iconSize = 25}) => {
    return (
      <TouchableOpacity
        style={styles.bottomActionButtonContainer}
        activeOpacity={0.7}
        onPress={onPress}>
        <SVGIcon icon={icon} height={iconSize} width={iconSize} />
      </TouchableOpacity>
    );
  };

  return getCameraType() ? (
    <View style={styles.mainContainer}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={getCameraType()}
        isActive={true}
        audio={true}
        photo={true}
        video={true}
        enableZoomGesture={true}
      />

      <View
        style={[
          styles.actionsOverlay,
          {paddingTop: insets.top ? insets.top : StatusBar.currentHeight},
        ]}>
        <View
          style={[
            styles.topBottomActionButtonsContainer,
            {justifyContent: isVideoRecording ? 'center' : 'space-between'},
          ]}>
          {!isVideoRecording ? (
            <>
              <TopActionButton
                icon={'close_white'}
                iconSize={18}
                onPress={() => {
                  setModal(false);
                }}
              />
              <TopActionButton
                icon={getFlashIcon()}
                onPress={() => {
                  setcameraSetting(preSetting => {
                    let tempFlashMode = preSetting.flashMode;
                    if (tempFlashMode === 2) {
                      tempFlashMode = 0;
                    } else {
                      tempFlashMode = tempFlashMode + 1;
                    }
                    return {...preSetting, flashMode: tempFlashMode};
                  });
                }}
              />
            </>
          ) : (
            <VideoRecordTimer
              maxSeconds={MAX_VIDEO_SECONDS}
              onReachMaxTime={() => {
                handleStopVideoRecording();
              }}
            />
          )}
        </View>
        <View
          style={{
            paddingTop: 0,
            paddingBottom: insets.bottom ? insets.bottom : 20,
          }}>
          <View
            style={[
              styles.topBottomActionButtonsContainer,
              {justifyContent: isVideoRecording ? 'center' : 'space-between'},
            ]}>
            {!isVideoRecording && <View style={{height: 45, width: 45}} />}
            <MediaActionButton />
            {!isVideoRecording && (
              <BottomActionButton
                icon="flip_camera"
                onPress={() => {
                  setcameraSetting(preSetting => {
                    let tempCameraType = preSetting.cameraType;
                    if (tempCameraType === 1) {
                      tempCameraType = 2;
                    } else {
                      tempCameraType = 1;
                    }
                    return {...preSetting, cameraType: tempCameraType};
                  });
                }}
              />
            )}
          </View>

          <View
            style={[
              styles.bottomTextContainer,
              {paddingVertical: isVideoRecording ? 15 : 0},
            ]}>
            {!isVideoRecording && (
              <StyledText
                style={{
                  color: COLORS.white,
                  fontFamily: FONTS.DMSans.medium,
                  fontSize: 16,
                  paddingVertical: 5,
                }}>
                Long press for video, tap for photo
              </StyledText>
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={isOpenPreview}
        transparent
        statusBarTranslucent
        onRequestClose={() => {
          setisOpenPreview(false);
        }}>
        <MediaPreview
          setModal={setisOpenPreview}
          data={mediaData}
          onSendMedia={item => {
            setModal(false);
            onSendMedia(item);
          }}
        />
      </Modal>
    </View>
  ) : (
    <Loader bgColor={COLORS.transparentDimColor} />
  );
};

export default CustomCameraView;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBottomActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
  },

  topActionButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  bottomActionButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    height: 45,
    width: 45,
    borderRadius: 30,
    backgroundColor: COLORS.transparentDimColor,
  },
  mediaActionButton: {
    height: 70,
    width: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    overflow: 'hidden',
    padding: 5,
  },
  innerMediaActionButtonContainer: {
    height: '100%',
    width: '100%',
    borderRadius: 35,
    backgroundColor: COLORS.white,
  },
  bottomTextContainer: {
    alignItems: 'center',
  },
});
