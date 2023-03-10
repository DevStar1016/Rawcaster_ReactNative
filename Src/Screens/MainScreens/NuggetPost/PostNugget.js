import {
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Video from 'react-native-video';

import HOCView from '../../../Components/HOCView';
import {useInsets, useMyProfile, useToken} from '../../../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {COLORS} from '../../../Utilities/Colors';
import Badges from '../../../Utilities/Badges';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import SubmitButton from '../../../Components/SubmitButton';
import SVGIcon from '../../../Components/SVGIcon';
import {
  DIMENSIONS,
  IS_IOS,
  NUGGET_SHARE_TYPE,
} from '../../../Utilities/Constants';
import {FlatList} from 'react-native-gesture-handler';
import ItemSelectionMiniList from '../../../Components/ItemSelectionMiniList';
import {addNuggetsService} from '../../../Services/ApiService';
import {
  compressMedia,
  getFileName,
  getSlicedText,
  getUrlWithFilePrefix,
} from '../../../Utilities/Methods';
import EmojiPicker, {EmojiKeyboard} from 'rn-emoji-keyboard';
import ImageCropPicker from 'react-native-image-crop-picker';
import Toast from '../../../Components/Toast';

import {Camera} from 'react-native-vision-camera';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import AudioRecorder from '../../../Modals/AudioRecorder';
import PollContainer from './PollContainer';

if (!IS_IOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

var isMount = true;

const PostNugget = () => {
  const navigation = useNavigation();
  const myProfile = useMyProfile();
  const token = useToken();
  const [isOpenSharTypeList, setisOpenSharTypeList] = useState(false);
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [isOpenEmojiContainer, setisOpenEmojiContainer] = useState(false);
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [selectedShareType, setselectedShareType] = useState(
    NUGGET_SHARE_TYPE.find(item => item.id === 1),
  );
  const [isPollClicked, setisPollClicked] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [typedText, settypedText] = useState('');

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const handlePostNuggets = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    if (typedText.trim()) {
      formData.append('content', typedText.trim());
    }
    formData.append('share_type', selectedShareType.id);
    if (selectedMediaList.length > 0) {
      selectedMediaList.map(item => {
        formData.append('nuggets_media[]', item);
      });
    }
    addNuggetsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'BottomTabNavigationAfterLogin'}],
          });
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const openCloseEmojiPicker = status => {
    // const CustomLayoutAnimation = {
    //   duration: 100,
    //   delete: {
    //     type: LayoutAnimation.Types.easeInEaseOut,
    //     property: LayoutAnimation.Properties.scaleXY,
    //   },
    //   create: {
    //     type: LayoutAnimation.Types.easeInEaseOut,
    //     property: LayoutAnimation.Properties.scaleXY,
    //   },
    //   update: {
    //     type: LayoutAnimation.Types.easeInEaseOut,
    //     property: LayoutAnimation.Properties.scaleXY,
    //   },
    // };
    // LayoutAnimation.configureNext(CustomLayoutAnimation);
    if (isMount) {
      setisOpenEmojiContainer(status);
    }
  };

  const pickMedia = type => {
    openCloseEmojiPicker(false);
    ImageCropPicker.openPicker({
      multiple: true,
      mediaType: type,
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
      .then(async mediaList => {
        if (isMount) {
          setisLoading(true);
        }
        let mediaType = type === 'photo' ? 1 : 2;
        Promise.all(
          mediaList.map(async item => {
            let mediaPath = await compressMedia(mediaType, item.path);
            return {
              uri: getUrlWithFilePrefix(mediaPath),
              name: getFileName(mediaPath),
              type: item.mime,
            };
          }),
        )
          .then(resMediaList => {
            if (isMount) {
              setselectedMediaList(pre => [...pre, ...resMediaList]);
            }
          })
          .catch(e => {
            Toast.fail(e.message);
          })
          .finally(() => {
            if (isMount) {
              setisLoading(false);
            }
          });
      })
      .catch(e => {
        console.log(e, 'ERRORRR');
      });
  };

  const handleRemoveSelectedMediaItem = selectedIndex => {
    const filteredSelectedMediaList = [...selectedMediaList].filter(
      (_, index) => index !== selectedIndex,
    );
    if (isMount) {
      setselectedMediaList(filteredSelectedMediaList);
    }
  };

  const handleOpenCamera = async () => {
    try {
      // const cameraPermission = await Camera.getCameraPermissionStatus();
      // const microphonePermission = await Camera.getMicrophonePermissionStatus();

      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      if (
        newCameraPermission === 'authorized' &&
        newMicrophonePermission === 'authorized'
      ) {
        if (isMount) {
          setisOpenCamera(true);
        }
      }
    } catch (e) {
      Toast.fail(e.message);
    }
  };

  const handleOpenAudioRecorder = async () => {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'authorized') {
      if (isMount) {
        setisOpenAudioRecorder(true);
      }
    } else {
      Toast.fail('Microphone Permission Denied');
    }
  };

  const onSelectMediaFromCamera = async mediaItem => {
    let mediaType = mediaItem.type.includes('image') ? 1 : 2;
    let mediaPath = await compressMedia(mediaType, mediaItem.uri);
    setselectedMediaList(pre => [
      ...pre,
      {
        name: getFileName(mediaPath),
        type: mediaItem.type,
        uri: mediaPath,
      },
    ]);
  };

  const handleSubmitAudio = audioFile => {
    setselectedMediaList(pre => [
      ...pre,
      {
        ...audioFile,
      },
    ]);
  };

  const getMediaItem = item => {
    if (IS_IOS && item.type.includes('video')) {
      return (
        <Video
          resizeMode="cover"
          posterResizeMode="cover"
          paused={true}
          source={{uri: item.uri}}
          style={{height: '100%', width: '100%', borderRadius: 10}}
        />
      );
    } else if (item.type.includes('audio')) {
      return (
        <View
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: COLORS.primary,
            alignItems: 'center',
            borderColor: COLORS.secondary,
            justifyContent: 'center',
            borderWidth: 2,
            borderRadius: 10,
          }}>
          <SVGIcon icon="logo_R" width={'80%'} height={'80%'} />
          {/* <Image
            style={{height: '100%', width: '100%'}}
            source={{uri: item.uri}}
            borderRadius={10}
            resizeMode="cover"
          /> */}
        </View>
      );
    }

    return (
      <Image
        style={{height: '100%', width: '100%'}}
        source={{uri: item.uri}}
        borderRadius={10}
        resizeMode="cover"
      />
    );
  };

  const renderSelectedNuggetItem = ({item, index}) => {
    return (
      <View
        style={{
          width: (DIMENSIONS.screen.width - 42) / 3,
          height: (DIMENSIONS.screen.width - 42) / 3,
          borderRadius: 5,
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {getMediaItem(item)}

        <TouchableOpacity
          style={styles.itemActionButtonsContainer}
          activeOpacity={1}>
          {item.type.includes('video') ||
            (item.type.includes('audio') && (
              <View style={styles.playIconContainer}>
                <SVGIcon
                  icon="play_white"
                  height={10}
                  width={10}
                  marginLeft={3}
                />
              </View>
            ))}
          <TouchableOpacity
            style={styles.itemRemoveIconContainer}
            activeOpacity={0.7}
            onPress={() => {
              handleRemoveSelectedMediaItem(index);
            }}>
            <SVGIcon icon="close_white" height={10} width={10} marginLeft={0} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <HOCView
      isLoading={isLoading}
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      isEnableKeyboardAware={isPollClicked ? true : false}
      paddingHorizontal={5}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: 'Post Nugget',
        isEnableBackButton: false,
        isTitleCenter: true,
        isEnableRightIcon: true,
        rightIcon: 'close_white',
        onPressRightIcon: () => {
          navigation.goBack();
        },
      }}
      isEnableDefaultBackground>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.mainContainer}
        onPress={() => {
          openCloseEmojiPicker(false);
          Keyboard.dismiss();
        }}>
        <View>
          <View style={styles.topContainer}>
            <View style={styles.subContainer}>
              <ProfileWithBadge
                badge={Badges(myProfile.user_status_id)}
                isEnableGradient={false}
                profileImage={myProfile.profile_image}
                padding={0}
                profileSize={38}
                badgeSize={16}
              />
              <View style={styles.nameContainer}>
                <StyledText style={styles.nameText}>
                  {getSlicedText(myProfile.name, 10)}
                </StyledText>
                <SubmitButton
                  buttonText={getSlicedText(selectedShareType.name, 10)}
                  marginTop={2}
                  iconSize={9}
                  textMarginLeftWhenIcon={2}
                  textMarginRightWhenIcon={2}
                  buttonTextStyle={{fontSize: 10}}
                  paddingHorizontal={3}
                  paddingVertical={0}
                  marginBottom={0}
                  rightIcon={'down_fill_white'}
                  rightIconSize={7}
                  icon="lock_fill_white"
                  marginHorizontal={0}
                  padding={0}
                  bgColor={COLORS.orange}
                  borderColor={COLORS.orange}
                  onPress={() => {
                    if (isMount) {
                      setisOpenSharTypeList(true);
                    }
                  }}
                />
              </View>
            </View>
            <View
              style={[
                styles.subContainer,
                {justifyContent: 'flex-end', paddingLeft: 15},
              ]}>
              {!isPollClicked && (
                <SVGIcon
                  icon="poll_fill_white"
                  height={19}
                  width={19}
                  isButton
                  onPress={() => {
                    // if (isMount) {
                    //   setisPollClicked(true);
                    // }
                  }}
                />
              )}
              <SVGIcon
                icon="mic_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                onPress={() => {
                  if (isMount) {
                    setisPollClicked(false);
                  }
                  handleOpenAudioRecorder();
                }}
              />
              <SVGIcon
                icon="camera_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                onPress={() => {
                  if (isMount) {
                    setisPollClicked(false);
                  }
                  handleOpenCamera();
                }}
              />
              <SVGIcon
                icon="photo_fill_white"
                height={21}
                width={21}
                marginLeft={8}
                isButton
                onPress={() => {
                  if (isMount) {
                    setisPollClicked(false);
                  }
                  pickMedia('photo');
                }}
              />
              <SVGIcon
                icon="video_fill_white"
                height={22}
                width={22}
                marginLeft={8}
                isButton
                onPress={() => {
                  if (isMount) {
                    setisPollClicked(false);
                  }
                  pickMedia('video');
                }}
              />
            </View>
          </View>
          {isPollClicked ? (
            <PollContainer
              onPressRemovePoll={() => {
                if (isMount) {
                  setisPollClicked(false);
                }
              }}
            />
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={`What’s on your mind, ${myProfile.name}!`}
                style={styles.textInput}
                multiline
                maxLength={500}
                onFocus={() => {
                  openCloseEmojiPicker(false);
                }}
                value={typedText}
                onChangeText={settypedText}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholderTextColor={COLORS.white}
              />
              <View style={styles.emojiIconContainer}>
                <SVGIcon
                  icon={'emojee'}
                  // height={30}
                  // width={30}
                  isButton
                  onPress={() => {
                    Keyboard.dismiss();
                    openCloseEmojiPicker(true);
                  }}
                />
              </View>
            </View>
          )}
        </View>
        <View>
          {!isPollClicked && selectedMediaList.length > 0 && (
            <View style={styles.selectedNuggetsContainer}>
              <FlatList
                data={selectedMediaList}
                renderItem={renderSelectedNuggetItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
              />
            </View>
          )}
          <View>
            <SubmitButton
              buttonText={isPollClicked ? 'Post Poll' : 'Post Nugget'}
              isDisabled={!typedText.trim() && selectedMediaList.length <= 0}
              disabledColor={COLORS.dimColor}
              onPress={() => {
                if (typedText.trim() || selectedMediaList.length > 0) {
                  handlePostNuggets();
                }
              }}
            />
          </View>
        </View>
        <EmojiPicker
          onEmojiSelected={res => {
            if (isMount) {
              settypedText(pre => {
                if (pre.length < 500) {
                  return pre + res.emoji;
                }
                return pre;
              });
            }
          }}
          enableRecentlyUsed
          categoryPosition="bottom"
          defaultHeight={DIMENSIONS.window.height / 2 + 10}
          theme={{backdrop: COLORS.transparent}}
          allowMultipleSelections
          expandable={false}
          open={isOpenEmojiContainer}
          styles={{
            header: {fontFamily: FONTS.DMSans.medium},
          }}
          onClose={() => setisOpenEmojiContainer(false)}
        />
        {/* {!isPollClicked && isOpenEmojiContainer && (
          <View style={styles.emojiContainer}>
            <EmojiKeyboard
              onEmojiSelected={res => {
                if (isMount) {
                  settypedText(pre => pre + res.emoji);
                }
              }}
              categoryPosition="bottom"
              enableCategoryChangeGesture={false}
              defaultHeight={DIMENSIONS.window.height / 2 + 10}
              styles={{
                header: {fontFamily: FONTS.DMSans.medium},
                // container
                // container: {width: },
              }}
            />
          </View>
        )} */}
      </TouchableOpacity>

      <Modal
        visible={isOpenSharTypeList}
        onRequestClose={() => {
          if (isMount) {
            setisOpenSharTypeList(false);
          }
        }}
        transparent
        style={{backgroundColor: COLORS.transparentDimColor}}>
        <SafeAreaView
          style={{flex: 1, backgroundColor: COLORS.transparentDimColor}}>
          <ItemSelectionMiniList
            maxHeight={DIMENSIONS.screen.height / 2 - 100}
            onClose={() => {
              if (isMount) {
                setisOpenSharTypeList(false);
              }
            }}
            fieldName={'name'}
            listData={NUGGET_SHARE_TYPE}
            onSelectItem={item => {
              if (isMount) {
                setisOpenSharTypeList(false);
                setselectedShareType(item);
              }
            }}
          />
        </SafeAreaView>
      </Modal>
      <Modal
        visible={isOpenCamera}
        statusBarTranslucent
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (isMount) {
            setisOpenCamera(false);
          }
        }}>
        <CustomCameraView
          setModal={setisOpenCamera}
          onSendMedia={onSelectMediaFromCamera}
        />
      </Modal>

      <Modal
        visible={isOpenAudioRecorder}
        statusBarTranslucent
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (isMount) {
            setisOpenAudioRecorder(false);
          }
        }}>
        <AudioRecorder
          setModal={setisOpenAudioRecorder}
          onSubmitAudio={handleSubmitAudio}
        />
      </Modal>
    </HOCView>
  );
};

export default PostNugget;

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  nameContainer: {
    paddingLeft: 5,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  nameText: {
    fontSize: 15,
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    maxHeight: 200,
    minHeight: 70,
    alignItems: 'flex-start',
  },
  textInput: {
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.white,
    fontSize: 17,
    width: '88%',
    height: '100%',
  },
  emojiIconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 5,
    height: 35,
    width: 35,
    // paddingTop: 5,
  },
  emojiContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: DIMENSIONS.window.height / 2 + 10,
  },
  selectedNuggetsContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    padding: 5,
    // height: 130,
  },

  backgroundVideo: {
    width: '100%',
    height: '100%',
  },

  removeIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  emojiContaine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    height: DIMENSIONS.screen.height / 2 - 50,
  },
  playIconContainer: {
    height: 25,
    width: 25,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
  itemActionButtonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSelectedItemIconContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 3,
    backgroundColor: COLORS.secondary,
    borderRadius: 20 / 2,
    height: 20,
    width: 20,
  },
  itemRemoveIconContainer: {
    position: 'absolute',
    right: 3,
    top: 3,
    height: 22,
    width: 22,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    borderRadius: 25,
  },
});
