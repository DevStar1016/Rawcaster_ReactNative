import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
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

const MediaPreview = ({
  setModal,
  data,
  onSendMedia,
  isEnableDone = true,
  isEnableEdit = true,
}) => {
  const insets = useInsets();
  const [mediaData, setmediaData] = useState(data);
  const [isOpenCrop, setisOpenCrop] = useState(false);
  const [pausedVideo, setpausedVideo] = useState(true);

  const openEditer = async () => {
    try {
      const resultUri = await PhotoEditor.open({
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

  const TopActionButton = ({
    onPress,
    icon,
    iconSize = 25,
    marginRight = 10,
  }) => {
    return (
      <TouchableOpacity
        style={[styles.topActionButtonContainer, {marginRight}]}
        activeOpacity={0.7}
        onPress={onPress}>
        <SVGIcon icon={icon} height={iconSize} width={iconSize} />
      </TouchableOpacity>
    );
  };

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
              setModal(false);
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
              <Image
                source={{uri: mediaData.uri}}
                resizeMode="contain"
                style={{height: '100%', width: '100%'}}
              />
            </View>
          ) : (
            <View style={styles.mediaContainer}>
              <Video
                repeat={IS_IOS}
                resizeMode="cover"
                posterResizeMode="cover"
                playInBackground={false}
                paused={pausedVideo}
                source={{uri: mediaData.uri}}
                style={{height: '100%', width: '100%'}}
                onEnd={e => {
                  setpausedVideo(true);
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
              setModal(false);
              onSendMedia({
                name: getFileName(mediaData.uri),
                uri: mediaData.uri,
                type: getMediaMimeType(mediaData.uri, mediaData.mediaType),
              });
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
          onCropImage={cropedUri => {
            setmediaData(pre => ({
              ...pre,
              uri: getUrlWithFilePrefix(cropedUri.uri),
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
    height: '100%',
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
});
