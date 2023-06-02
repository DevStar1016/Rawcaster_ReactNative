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
import {
  useConnectionsList,
  useGroupsList,
  useNuggetsList,
  useProfile,
  useSavedNuggetsList,
  useSearchedNuggetsList,
  useToken,
} from '../../../Utilities/StoreData';
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
import {
  addNuggetsService,
  editNuggetService,
} from '../../../Services/ApiService';
import {
  compressMedia,
  getFileName,
  getMediaMimeType,
  getNuggetsReduxStoreDataFormate,
  getSlicedText,
  getUrlWithFilePrefix,
} from '../../../Utilities/Methods';
import {EmojiKeyboard} from 'rn-emoji-keyboard';
import ImageCropPicker from 'react-native-image-crop-picker';
import Toast from '../../../Components/Toast';
import EmojiPicker from 'react-native-emoji-picker-staltz';
import {Camera} from 'react-native-vision-camera';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import AudioRecorder from '../../../Modals/AudioRecorder';
import PollContainer from './PollContainer';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {useDispatch} from 'react-redux';
import {
  setSavedNuggetsList,
  setSearchedNuggetsList,
} from '../../../Store/Slices/HomeSlice';
import MultiItemsSelectList from '../../../Modals/MultiItemsSelectList';
import {setNuggetsList} from '../../../Store/Slices/NuggetsListSlice';
import MediaPreview from '../../../Modals/CameraModals/MediaPreview';

if (!IS_IOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

var isMount = true;
const EMOJI_CONTAINER_HEIGHT = DIMENSIONS.window.height / 2 - 60;
const PostEditNugget = ({route}) => {
  const {nugget, isSearchNugget, categoryName, preContent} = route.params ?? {};
  const searchedNuggetsList = useSearchedNuggetsList();
  const dispatch = useDispatch();
  const nuggetsList = useNuggetsList(categoryName ?? 'forYou');
  const connectionsList = useConnectionsList();
  const groupsList = useGroupsList();
  const navigation = useNavigation();
  const profile = useProfile();
  const token = useToken();
  const [mainContainerHeight, setmainContainerHeight] = useState(0);
  const [topContainerHeight, settopContainerHeight] = useState(0);
  const [mediaListHeight, setmediaListHeight] = useState(0);
  const [buttonHeight, setbuttonHeight] = useState(0);
  const [isFocusedTextInput, setisFocusedTextInput] = useState(false);
  const savedNuggetsList = useSavedNuggetsList();
  const [isOpenSelectionModal, setisOpenSelectionModal] = useState(false);
  const [isOpenSharTypeList, setisOpenSharTypeList] = useState(false);
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [isOpenEmojiContainer, setisOpenEmojiContainer] = useState(false);
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [shareConnectionsGroupsIdsList, setshareConnectionsGroupsIdsList] =
    useState([]);
  const [isOpenPreview, setisOpenPreview] = useState(false);
  const [selectedShareType, setselectedShareType] = useState(
    NUGGET_SHARE_TYPE.find(
      item => item.id === (nugget ? parseInt(nugget.share_type) : 1),
    ),
  );
  const [mediaData, setmediaData] = useState({
    uri: '',
    mediaType: '',
  });
  const [preSelectdeShareTypeAndList, setpreSelectdeShareTypeAndList] =
    useState({
      shareType: {...selectedShareType},
      list: [...shareConnectionsGroupsIdsList],
    });
  const [isPollClicked, setisPollClicked] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [typedText, settypedText] = useState(
    preContent ?? (nugget ? nugget.content ?? '' : ''),
  );

  const [question, setquestion] = useState('');
  const [pollLength, setpollLength] = useState(null);
  const [choiceList, setchoiceList] = useState([
    {
      isOptional: false,
      value: '',
    },
    {
      isOptional: false,
      value: '',
    },
  ]);

  useEffect(() => {
    AvoidSoftInput.setAdjustPan();
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  useEffect(() => {
    if (nugget) {
      if (nugget.media_list && nugget.media_list.length > 0) {
        const tempMediaList = [...nugget.media_list].map(item => {
          return {
            media_id: item.media_id,
            uri: getUrlWithFilePrefix(item.path),
            name: getFileName(item.path),
            type: getMediaMimeType(item.path, item.media_type),
          };
        });

        setselectedMediaList(tempMediaList);
      }
    }
  }, []);

  function handlePostNuggets() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('share_type', selectedShareType.id);

    if (selectedShareType.id === 3 || selectedShareType.id === 4) {
      formData.append(
        'share_with',
        JSON.stringify(
          selectedShareType.id === 3
            ? {groups: shareConnectionsGroupsIdsList}
            : {friends: shareConnectionsGroupsIdsList},
        ),
      );
    }

    if (typedText.trim() || (isPollClicked && question.trim())) {
      formData.append(
        'content',
        isPollClicked ? question.trim() : typedText.trim(),
      );
    }
    if (isPollClicked) {
      formData.append(
        'poll_option',
        JSON.stringify([...choiceList].map(item => item.value.trim())),
      );
      formData.append(
        'poll_duration',
        `${pollLength.days}:${pollLength.hours}:${pollLength.minutes}`,
      );
    } else {
      if (selectedMediaList.length > 0) {
        selectedMediaList.map(item => {
          formData.append('nuggets_media', item);
        });
      }
    }
    addNuggetsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'DashboardProfileTopTabNavigation'}],
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
  }

  function handleEditNugget() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    if (typedText.trim()) {
      formData.append('content', typedText.trim());
    }
    formData.append('share_type', selectedShareType.id);
    if (selectedShareType.id === 3 || selectedShareType.id === 4) {
      formData.append(
        'share_with',
        JSON.stringify(
          selectedShareType.id === 3
            ? {groups: shareConnectionsGroupsIdsList}
            : {friends: shareConnectionsGroupsIdsList},
        ),
      );
    }

    const tempSelectdeMediaList = [...selectedMediaList].filter(
      item => !item.media_id,
    );
    if (tempSelectdeMediaList.length > 0) {
      tempSelectdeMediaList.map(item => {
        formData.append('nuggets_media', item);
      });
    }
    const tempRemovedMediaList = [...nugget.media_list].filter(
      item =>
        !selectedMediaList.find(subItem => subItem.media_id === item.media_id),
    );
    if (tempRemovedMediaList.length > 0) {
      formData.append(
        'delete_media_id',
        JSON.stringify([...tempRemovedMediaList].map(item => item.media_id)),
      );
    }

    editNuggetService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          if (isSearchNugget) {
            let tempSearchedNuggetsList = [...searchedNuggetsList];
            const tempIndex = tempSearchedNuggetsList.findIndex(
              item => item.nugget_id === nugget.nugget_id,
            );
            if (tempIndex !== -1) {
              tempSearchedNuggetsList[tempIndex] = {...res.data.nugget_detail};
            }
            dispatch(setSearchedNuggetsList(tempSearchedNuggetsList));
          }

          let tempNuggetsList = [...nuggetsList];
          const tempIndex = tempNuggetsList.findIndex(
            item => item.nugget_id === nugget.nugget_id,
          );
          if (tempIndex !== -1) {
            tempNuggetsList[tempIndex] = {...res.data.nugget_detail};
          }
          dispatch(
            setNuggetsList(getNuggetsReduxStoreDataFormate(categoryName, [])),
          );
          dispatch(
            setNuggetsList(
              getNuggetsReduxStoreDataFormate(categoryName, tempNuggetsList),
            ),
          );
          let tempSavedList = [...savedNuggetsList];
          let tempSavedIndex = tempSavedList.findIndex(
            ele => ele.nugget_id === nugget.nugget_id,
          );
          if (tempSavedIndex !== -1) {
            tempSavedList[tempSavedIndex] = {...res.data.nugget_detail};
            dispatch(setSavedNuggetsList(tempSavedList));
          }
          navigation.goBack();
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
  }

  function openCloseEmojiPicker(status) {
    if (isMount) {
      setisOpenEmojiContainer(status);
    }
  }

  function pickMedia(type) {
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
            console.log(resMediaList, 'YUIO');
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
  }

  function handleRemoveSelectedMediaItem(selectedIndex) {
    const filteredSelectedMediaList = [...selectedMediaList].filter(
      (_, index) => index !== selectedIndex,
    );
    if (isMount) {
      setselectedMediaList(filteredSelectedMediaList);
    }
  }

  async function handleOpenCamera() {
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
          setisLoading(false);
          setisOpenCamera(true);
        }
      } else {
        if (isMount) {
          setisLoading(false);
        }
        if (newCameraPermission === 'denied') {
          Toast.fail('Camera Permission Denied');
        } else if (newMicrophonePermission === 'denied') {
          Toast.fail('Microphone Permission Denied');
        } else {
          Toast.fail('Permissions Denied');
        }
      }
    } catch (e) {
      if (isMount) {
        setisLoading(false);
      }
      Toast.fail(e.message);
    }
  }

  async function handleOpenAudioRecorder() {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'authorized') {
      if (isMount) {
        setisOpenAudioRecorder(true);
      }
    } else {
      Toast.fail('Microphone Permission Denied');
    }
  }

  async function onSelectMediaFromCamera(mediaItem) {
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
  }

  function handleSubmitAudio(audioFile) {
    setselectedMediaList(pre => [
      ...pre,
      {
        ...audioFile,
      },
    ]);
  }

  function resetSelectedShareType() {
    if (isMount) {
      setselectedShareType(
        preSelectdeShareTypeAndList.shareType
          ? {...preSelectdeShareTypeAndList.shareType}
          : NUGGET_SHARE_TYPE.find(item => item.id === 1),
      );
      setshareConnectionsGroupsIdsList([...preSelectdeShareTypeAndList.list]);
    }
  }

  function isDisabledPostButton() {
    if (
      (selectedShareType.id === 3 || selectedShareType.id === 4) &&
      shareConnectionsGroupsIdsList.length <= 0
    ) {
      return true;
    } else if (isPollClicked) {
      return question &&
        choiceList &&
        pollLength &&
        !(
          pollLength.days === 0 &&
          pollLength.hours === 0 &&
          pollLength.minutes === 0
        ) &&
        choiceList.filter(item => item.value.trim()).length >= 2
        ? false
        : true;
    }
    return !typedText.trim() && selectedMediaList.length <= 0;
  }

  function getMaxHeight() {
    let maxHeight =
      mainContainerHeight - topContainerHeight - buttonHeight - 20;
    if (!isPollClicked && selectedMediaList.length > 0) {
      maxHeight = maxHeight - mediaListHeight;
    }

    if (isOpenEmojiContainer || isFocusedTextInput) {
      maxHeight = maxHeight - EMOJI_CONTAINER_HEIGHT;
      maxHeight = maxHeight + mediaListHeight + buttonHeight;
    }

    return maxHeight;
  }

  function getMediaItem(item) {
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
  }

  function renderSelectedNuggetItem({item, index}) {
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
          activeOpacity={1}
          // onPress={() => {
          //   console.log(item, 'KLKLKLK');
          //   const type = item?.type?.split('/');
          //   if (type) {
          //     setmediaData({uri: item.uri, mediaType: type});
          //     setisOpenPreview(true);
          //   }
          // }}
        >
          {(item.type.includes('video') || item.type.includes('audio')) && (
            <View style={styles.playIconContainer}>
              <SVGIcon
                icon="play_white"
                height={10}
                width={10}
                marginLeft={3}
              />
            </View>
          )}
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
  }

  return (
    <HOCView
      isLoading={isLoading}
      keyboardAwareContentContainerStyle={{flexGrow: 1}}
      isEnableKeyboardAware={isPollClicked ? true : false}
      paddingHorizontal={5}
      backHeaderProps={{
        bgColor: COLORS.transparent,
        title: `${nugget ? 'Edit' : 'Post'} Nugget`,
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
        onLayout={e => {
          setmainContainerHeight(e.nativeEvent.layout.height - 10); // 10 is paddingVertical of 5
        }}
        style={styles.mainContainer}
        onPress={() => {
          Keyboard.dismiss();
          openCloseEmojiPicker(false);
          setisFocusedTextInput(false);
        }}>
        <View>
          <View
            style={styles.topContainer}
            onLayout={e => {
              settopContainerHeight(e.nativeEvent.layout.height);
            }}>
            <View style={[styles.subContainer, {paddingLeft: 15, flex: 1}]}>
              {!isPollClicked && !nugget && (
                <SVGIcon
                  icon="poll_fill_white"
                  height={19}
                  width={19}
                  isButton
                  onPress={() => {
                    if (isMount) {
                      setisPollClicked(true);
                    }
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
                    setisLoading(true);
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
            <View style={styles.subContainer}>
              {/* <ProfileWithBadge
                badge={Badges(profile?.user_status_id)}
                isEnableGradient={false}
                profileImage={profile?.profile_image}
                padding={0}
                profileSize={38}
                badgeSize={16}
              /> */}
              <View style={styles.nameContainer}>
                {/* <StyledText style={styles.nameText}>
                  {getSlicedText(profile?.name, 10)}
                </StyledText> */}
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                  {(selectedShareType.id === 3 ||
                    selectedShareType.id === 4) && (
                    <SVGIcon
                      icon="edit"
                      height={13}
                      width={13}
                      marginLeft={10}
                      isButton
                      onPress={() => {
                        setisOpenSelectionModal(true);
                      }}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
          {isPollClicked ? (
            <PollContainer
              choiceList={choiceList}
              setchoiceList={setchoiceList}
              question={question}
              setquestion={setquestion}
              setpollLength={setpollLength}
              onPressRemovePoll={() => {
                if (isMount) {
                  setisPollClicked(false);
                }
              }}
            />
          ) : (
            <View
              style={[
                styles.inputContainer,
                {
                  maxHeight: getMaxHeight(),
                },
              ]}>
              <TextInput
                placeholder={`What’s on your mind, ${profile?.name}!`}
                style={styles.textInput}
                multiline
                maxLength={500}
                onFocus={() => {
                  setisFocusedTextInput(true);
                  openCloseEmojiPicker(false);
                }}
                value={typedText}
                onChangeText={settypedText}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholderTextColor={COLORS.placeHolderColor}
              />
              <View style={styles.emojiIconContainer}>
                <SVGIcon
                  icon={'emojee'}
                  // height={30}
                  // width={30}
                  isButton
                  onPress={() => {
                    Keyboard.dismiss();
                    setisFocusedTextInput(false);
                    openCloseEmojiPicker(true);
                  }}
                />
              </View>
            </View>
          )}
        </View>
        <View>
          {!isPollClicked && selectedMediaList.length > 0 && (
            <View
              style={styles.selectedNuggetsContainer}
              onLayout={e => {
                setmediaListHeight(e.nativeEvent.layout.height);
              }}>
              <FlatList
                data={selectedMediaList}
                renderItem={renderSelectedNuggetItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
              />
            </View>
          )}

          <SubmitButton
            buttonText={
              isPollClicked ? 'Post Poll' : `${nugget ? 'Edit' : 'Post'} Nugget`
            }
            onLayoutHeight={setbuttonHeight}
            isDisabled={isDisabledPostButton()}
            disabledColor={COLORS.dimColor}
            onPress={() => {
              if (!isDisabledPostButton()) {
                if (
                  (selectedShareType.id === 3 || selectedShareType.id === 4) &&
                  shareConnectionsGroupsIdsList.length <= 0
                ) {
                  Toast.fail(
                    selectedShareType.id === 3
                      ? 'Select groups'
                      : 'Select connections',
                  );
                  setisOpenSelectionModal(true);
                  return;
                }
                if (nugget) {
                  handleEditNugget();
                } else {
                  handlePostNuggets();
                }
              }
            }}
          />
        </View>

        {isOpenEmojiContainer ? (
          <View
            style={{
              height: EMOJI_CONTAINER_HEIGHT,
              backgroundColor: COLORS.white,
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderTopStartRadius: 10,
              borderTopEndRadius: 10,
            }}>
            {/* <EmojiModal
              onEmojiSelected={emoji => {}}
              containerStyle={{width: '100%'}}
              columns={8}

            /> */}
            <EmojiKeyboard
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
              disabledCategories={['people_body', 'flags']}
              categoryPosition="bottom"
              enableCategoryChangeGesture={false}
              defaultHeight={DIMENSIONS.window.height / 2 + 10}
              styles={{
                header: {fontFamily: FONTS.DMSans.medium},
              }}
            />
          </View>
        ) : null}
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
                setselectedShareType(pre => {
                  setpreSelectdeShareTypeAndList({
                    shareType: pre,
                    list: [...shareConnectionsGroupsIdsList],
                  });
                  if (pre) {
                    if (pre.id !== item.id) {
                      setshareConnectionsGroupsIdsList([]);
                    }
                  }
                  return item;
                });
                if (item.id === 3 || item.id === 4) {
                  setisOpenSelectionModal(true);
                }
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
      <Modal
        visible={isOpenSelectionModal}
        statusBarTranslucent
        onRequestClose={() => {
          resetSelectedShareType();
          if (isMount) {
            setisOpenSelectionModal(false);
          }
        }}>
        <MultiItemsSelectList
          title={
            selectedShareType.id === 3
              ? 'Specific Group'
              : 'Specific Connection'
          }
          preSelectedIds={shareConnectionsGroupsIdsList}
          imageFieldName={
            selectedShareType.id === 3 ? 'group_icon' : 'profile_img'
          }
          onCloseModal={() => {
            resetSelectedShareType();
            if (isMount) {
              setisOpenSelectionModal(false);
            }
          }}
          displayFieldName={
            selectedShareType.id === 3 ? 'group_name' : 'display_name'
          }
          idFieldName={selectedShareType.id === 3 ? 'group_id' : 'user_id'}
          list={selectedShareType.id === 3 ? groupsList : connectionsList}
          onSelectItems={list => {
            if (isMount) {
              setisOpenSelectionModal(false);
              setshareConnectionsGroupsIdsList(list);
            }
          }}
          noDataText={
            selectedShareType.id === 3
              ? 'No Groups Found'
              : 'No Connections Found'
          }
        />
      </Modal>

      <Modal
        visible={isOpenPreview}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {
          setisOpenPreview(false);
        }}>
        <MediaPreview
          setModal={setisOpenPreview}
          data={mediaData}
          isEnableDone={false}
          isEnableEdit={false}
        />
      </Modal>
    </HOCView>
  );
};

export default PostEditNugget;

const styles = StyleSheet.create({
  topContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  subContainer: {
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
    // maxHeight: 200,
    // minHeight: 70,
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
