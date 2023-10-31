import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import lodash from 'lodash';
import HOCView from '../../../Components/HOCView';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
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
  getUrlMetaDataService,
} from '../../../Services/ApiService';
import {
  compressMedia,
  getFileName,
  getLinkInfo,
  getMediaMimeType,
  getMillisToMinutesNumber,
  getSlicedText,
  getUrlWithFilePrefix,
} from '../../../Utilities/Methods';
import ImageCropPicker from 'react-native-image-crop-picker';
import Toast from '../../../Components/Toast';
import {Camera} from 'react-native-vision-camera';
import CustomCameraView from '../../../Modals/CameraModals/CustomCameraView';
import AudioRecorder from '../../../Modals/AudioRecorder';
import PollContainer from './PollContainer';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {useDispatch} from 'react-redux';
import MultiItemsSelectList from '../../../Modals/MultiItemsSelectList';
import MediaPreview from '../../../Modals/CameraModals/MediaPreview';
import {addEditedNugget} from '../../../Store/Slices/NuggetActionsSlice';
import {setPremiumAlert} from '../../../Store/Slices/UtilitySlice';
import {addNugget} from '../../../Store/ThunkAPIServices';
import StyledText from '../../../Components/StyledText';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {EmojiKeyboard} from 'rn-emoji-keyboard';

if (!IS_IOS && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const WINDOW_WIDTH = DIMENSIONS.window.width;
const WINDOW_HEIGHT = DIMENSIONS.window.height;

var isMount = true;
var metaDataFetchingTimer = undefined;
const EMOJI_CONTAINER_HEIGHT = DIMENSIONS.window.height / 2;
const PostEditNugget = ({route}) => {
  const [isKeyBoardEnabledStatus, setisKeyBoardEnabledStatus] = useState(false);
  const {nugget, preContent} = route.params ?? {};
  const dispatch = useDispatch();
  const connectionsList = useConnectionsList();
  const groupsList = useGroupsList();
  const navigation = useNavigation();
  const profile = useProfile();
  const token = useToken();
  const videoPlayerRef = useRef(null);
  const controller = useRef(null);
  const [mainContainerHeight, setmainContainerHeight] = useState(0);
  const [topContainerHeight, settopContainerHeight] = useState(0);
  const [mediaListHeight, setmediaListHeight] = useState(0);
  const [buttonHeight, setbuttonHeight] = useState(0);
  const [isFetchingMetaData, setisFetchingMetaData] = useState(false);
  const [metaDataContainerHeight, setmetaDataContainerHeight] = useState(0);
  const [isOpenSelectionModal, setisOpenSelectionModal] = useState(false);
  const [isOpenSharTypeList, setisOpenSharTypeList] = useState(false);
  const [isOpenCamera, setisOpenCamera] = useState(false);
  const [isOpenAudioRecorder, setisOpenAudioRecorder] = useState(false);
  const [isOpenEmojiContainer, setisOpenEmojiContainer] = useState(false);
  const [selectedMediaList, setselectedMediaList] = useState([]);
  const [shareConnectionsGroupsIdsList, setshareConnectionsGroupsIdsList] =
    useState(nugget ? nugget.shared_detail?.map(ele => ele.id) : []);
  const [isOpenPreview, setisOpenPreview] = useState(false);
  const [selectedShareType, setselectedShareType] = useState(
    NUGGET_SHARE_TYPE.find(
      item => item.id === (nugget ? parseInt(nugget.share_type) : 1),
    ),
  );

  const [urlMetaData, seturlMetaData] = useState(
    nugget?.metadata ? getMetaDataArrayJSON() : null,
  );
  const [oldUrl, setoldUrl] = useState(null);

  const [isMediaAbove5Min, setisMediaAbove5Min] = useState(false);
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
  const [loadingData, setloadingData] = useState({
    status: false,
    text: '',
  });
  const [typedText, settypedText] = useState(
    preContent ? preContent : nugget && nugget.content ? nugget.content : '',
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
    const backAction = () => {
      if (isOpenEmojiContainer) {
        if (isMount) {
          setisOpenEmojiContainer(false);
        }
      } else {
        navigation.goBack();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isOpenEmojiContainer]);

  useEffect(() => {
    Keyboard.dismiss();
    AvoidSoftInput.setAdjustPan();
    return () => {
      Keyboard.dismiss();
      if (controller.current) {
        controller.current.abort();
      }
      if (metaDataFetchingTimer) {
        clearTimeout(metaDataFetchingTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (typedText && typedText.trim()) {
      const url = getLinkInfo(typedText);
      if (url) {
        if (oldUrl !== url) {
          if (isMount) {
            setoldUrl(url);
          }
          getUrlMetaDataAPICall(url);
        }
      } else {
        if (isMount) {
          seturlMetaData(null);
        }
      }
    } else {
      if (isMount) {
        seturlMetaData(null);
      }
    }
  }, [typedText]);

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
      if (nugget.shared_detail && nugget.shared_detail.length > 0) {
        setshareConnectionsGroupsIdsList(
          [...nugget.shared_detail].map(item => item.id),
        );
      }
    }
  }, []);

  function getMetaDataArrayJSON() {
    let metaData = JSON.parse(nugget?.metadata);
    const isArrayData = Array.isArray(metaData);
    if (!isArrayData) {
      metaData = [{...metaData}];
    }
    return metaData;
  }

  function handleMetaDataFetchingTimer() {
    if (metaDataFetchingTimer) {
      clearTimeout(metaDataFetchingTimer);
    }
    metaDataFetchingTimer = setTimeout(() => {
      Alert.alert(
        'Fetching URL Details!',
        'This is taking time, do you want to wait?',
        [
          {
            text: 'No',
            onPress: () => {
              if (controller.current) {
                controller.current.abort();
              }
            },
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {},
          },
        ],
        {cancelable: false},
      );
      clearTimeout(metaDataFetchingTimer);
    }, 6000);
  }

  const getUrlMetaDataAPICall = url => {
    if (isMount) {
      setisFetchingMetaData(true);
    }
    handleMetaDataFetchingTimer();
    if (controller.current) {
      controller.current.abort();
    }
    controller.current = new AbortController();
    const formData = new FormData();
    formData.append('token', token);
    formData.append('url', url);
    getUrlMetaDataService(formData, controller.current.signal)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            seturlMetaData(preList => {
              if (preList) {
                return [...preList, {...res.data.data[0]}];
              }
              return [...res.data.data];
            });
          }
        } else if (res.data.status === 0) {
          if (isMount) {
            seturlMetaData(null);
          }
        }
      })
      .catch(e => {
        console.log(e, 'ERROR URL');
      })
      .finally(() => {
        if (isMount) {
          setisFetchingMetaData(false);
        }
        if (metaDataFetchingTimer) {
          clearTimeout(metaDataFetchingTimer);
        }
      });
  };

  /**
   * Stops the loader by setting the loadingData state to false and clearing the text.
   * Only performs the action if the component is mounted.
   * @returns None
   */
  const stopLoader = () => {
    if (isMount) {
      setloadingData({
        status: false,
        text: '',
      });
    }
  };

  /**
   * Handles the submission of a post nugget.
   * Constructs a FormData object and appends necessary data such as token and selectedShareType.
   * If the selectedShareType is 3 or 4, it appends the share_with data based on the selectedShareType.
   * If typedText or question (if isPollClicked) is not empty, it appends the content data.
   * If isPollClicked is true, it appends the poll_option and poll_duration data.
   * If isPollClicked is false and selectedMediaList is not empty, it appends the selectedMediaList data.
   * Dispatches the addNugget action with the constructed formData and navigation.
   * @returns None
   */
  function handlePostNuggets() {
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
        isPollClicked
          ? question.trim()
          : getSlicedText(
              typedText,
              profile?.nugget_content_length,
              false,
            ).trim(),
      );
    }
    if (isPollClicked) {
      formData.append(
        'poll_option',
        JSON.stringify(
          [...choiceList]
            .filter(item => item.value.trim() !== '')
            .map(item => item.value),
        ),
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
      if (urlMetaData) {
        formData.append('metadata', JSON.stringify(urlMetaData));
      }
    }

    dispatch(addNugget({navigation, formData}));
    // stopLoader();
    // addNuggetsService(formData)
    //   .then(res => {
    //     if (res.data.status === 1) {
    //       if (isMediaAbove5Min) {
    //         Toast.success('Media being uploaded...', 6000);
    //       } else {
    //         Toast.success(res.data.msg);
    //       }
    //       navigation.reset({
    //         routes: [{name: 'DashboardProfileTopTabNavigation'}],
    //       });
    //     } else if (res.data.status === 0) {
    //       Toast.fail(res.data.msg);
    //     }
    //   })
    //   .catch(e => {
    //     Toast.fail(e.message);
    //   })
    //   .finally(() => {
    //     if (isMount) {
    //       stopLoader();
    //     }
    //   });
  }

  /**
   * Handles the editing of a nugget.
   * - Sets the loadingData state to indicate that the nugget is being edited.
   * - Creates a FormData object and appends the necessary data (token, nugget_id, content, share_type, share_with, nuggets_media, delete_media_id) to it.
   * - Filters the selectedMediaList to get only the items that do not have a media_id and appends them to the FormData object.
   * - Filters the nugget.media_list to get only the items that are not in the selectedMediaList and appends their media_id values to the FormData object.
   * - Calls the editNuggetService function with the FormData object.
   * - If the response status is 1,
   */
  function handleEditNugget() {
    if (isMount) {
      setloadingData({
        status: true,
        text: 'Nugget being Edited...',
      });
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
    if (urlMetaData) {
      formData.append('metadata', JSON.stringify(urlMetaData));
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
          // if (isMediaAbove5Min) {
          //   Toast.success('Media being uploaded...', 000);
          // } else {
          //   Toast.success(res.data.msg);
          // }
          Toast.success(res.data.msg);
          if (res.data.nugget_detail) {
            dispatch(addEditedNugget(res.data.nugget_detail));
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
          stopLoader();
        }
      });
  }

  /**
   * Opens or closes the emoji picker based on the given status.
   * @param {boolean} status - The status indicating whether to open or close the emoji picker.
   * @returns None
   */
  function openCloseEmojiPicker(status) {
    if (isMount) {
      setisOpenEmojiContainer(status);
    }
  }

  /**
   * Opens the emoji picker and allows the user to select media.
   * @param {string} type - The type of media to pick (photo or video).
   * @returns None
   */
  function pickMedia(type) {
    openCloseEmojiPicker(false);
    ImageCropPicker.openPicker({
      multiple: nugget ? false : true,
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
      .then(async selectedMediaList => {
        const mediaList = nugget
          ? [{...selectedMediaList}]
          : [...selectedMediaList]; // when edit multiple option false. so the mediaList is as an object

        if (isMount) {
          setloadingData({
            status: true,
            text: 'Selected media being compressed',
          });
        }
        let mediaType = type === 'photo' ? 1 : 2;
        Promise.all(
          mediaList.map(async item => {
            let mediaPath = await compressMedia(mediaType, item.path);
            return {
              uri: getUrlWithFilePrefix(mediaPath),
              name: getFileName(mediaPath),
              type: item.mime,
              duration: item.duration,
            };
          }),
        )
          .then(resMediaList => {
            if (isMount) {
              if (nugget) {
                if (
                  resMediaList.find(
                    item => getMillisToMinutesNumber(item.duration) > 5,
                  )
                ) {
                  setisMediaAbove5Min(true);
                } else {
                  setisMediaAbove5Min(false);
                }
                setselectedMediaList([...resMediaList]);
              } else {
                setselectedMediaList(pre => {
                  if (
                    [...pre, ...resMediaList].find(
                      item => getMillisToMinutesNumber(item.duration) > 5,
                    )
                  ) {
                    setisMediaAbove5Min(true);
                  } else {
                    setisMediaAbove5Min(false);
                  }
                  return [...pre, ...resMediaList];
                });
              }
            }
          })
          .catch(e => {
            Toast.fail(e.message);
          })
          .finally(() => {
            if (isMount) {
              stopLoader();
            }
          });
      })
      .catch(e => {
        if (e?.message?.includes('permission')) {
          Toast.fail('Permission denied');
        }
      });
  }

  /**
   * Removes the selected media item from the selectedMediaList array.
   * @param {number} selectedIndex - The index of the selected media item to remove.
   * @returns None
   */
  function handleRemoveSelectedMediaItem(selectedIndex) {
    const filteredSelectedMediaList = [...selectedMediaList].filter(
      (_, index) => index !== selectedIndex,
    );
    if (isMount) {
      setselectedMediaList(filteredSelectedMediaList);
    }
  }

  /**
   * Handles the action of opening the camera.
   * Requests camera and microphone permissions, and handles the different scenarios based on the permission status.
   * @returns None
   */
  async function handleOpenCamera() {
    try {
      // const cameraPermission = await Camera.getCameraPermissionStatus();
      // const microphonePermission = await Camera.getMicrophonePermissionStatus();

      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();

      if (
        newCameraPermission === 'granted' &&
        newMicrophonePermission === 'granted'
      ) {
        if (isMount) {
          stopLoader();
          setisOpenCamera(true);
        }
      } else {
        if (isMount) {
          stopLoader();
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
        stopLoader();
      }
      Toast.fail(e.message);
    }
  }

  /**
   * Handles the action of opening the audio recorder.
   * Requests microphone permission and sets the state to open the audio recorder if permission is granted.
   * Displays a toast message if microphone permission is denied.
   * @returns None
   */
  async function handleOpenAudioRecorder() {
    const newMicrophonePermission = await Camera.requestMicrophonePermission();
    if (newMicrophonePermission === 'granted') {
      if (isMount) {
        setisOpenAudioRecorder(true);
      }
    } else {
      Toast.fail('Microphone Permission Denied');
    }
  }

  /**
   * Handles the selection of media from the camera and adds it to the selected media list.
   * @param {Object} mediaItem - The selected media item.
   * @returns None
   */
  async function onSelectMediaFromCamera(mediaItem) {
    let mediaType = mediaItem.type.includes('image') ? 1 : 2;
    setloadingData({
      status: true,
      text: 'Media being compressed',
    });
    let mediaPath = await compressMedia(mediaType, mediaItem.uri);
    if (nugget) {
      setselectedMediaList([
        {
          name: getFileName(mediaPath),
          type: mediaItem.type,
          uri: mediaPath,
        },
      ]);
    } else {
      setselectedMediaList(pre => [
        ...pre,
        {
          name: getFileName(mediaPath),
          type: mediaItem.type,
          uri: mediaPath,
        },
      ]);
    }
    setloadingData({
      status: false,
      text: '',
    });
  }

  /**
   * Handles the submission of an audio file.
   * If `nugget` is truthy, sets the `selectedMediaList` to an array containing the `audioFile`.
   * If `nugget` is falsy, appends the `audioFile` to the existing `selectedMediaList`.
   * @param {Object} audioFile - The audio file to be submitted.
   * @returns None
   */
  function handleSubmitAudio(audioFile) {
    if (nugget) {
      setselectedMediaList([
        {
          ...audioFile,
        },
      ]);
    } else {
      setselectedMediaList(pre => [
        ...pre,
        {
          ...audioFile,
        },
      ]);
    }
  }

  /**
   * Resets the selected share type based on the pre-selected share type and list.
   * If the component is mounted, it sets the selected share type to the pre-selected
   * share type if it exists, otherwise it sets it to the first share type in the
   * NUGGET_SHARE_TYPE array. It also sets the share connections groups IDs list to
   * the pre-selected list.
   * @returns None
   */
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

  /**
   * Checks if the post button should be disabled based on the current state.
   * @returns {boolean} - true if the post button should be disabled, false otherwise.
   */
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
          pollLength.minutes < 5
        ) &&
        choiceList.filter(item => item.value.trim()).length >= 2
        ? false
        : true;
    }
    return (
      isFetchingMetaData || (!typedText.trim() && selectedMediaList.length <= 0)
    );
  }

  /**
   * Calculates the maximum height for a container based on various conditions.
   * @returns {number} The maximum height for the container.
   */
  function getMaxHeight() {
    let maxHeight =
      mainContainerHeight - topContainerHeight - buttonHeight - 20;
    if (!isPollClicked && selectedMediaList.length > 0) {
      maxHeight = maxHeight - mediaListHeight;
    }

    if (isOpenEmojiContainer) {
      maxHeight = maxHeight - EMOJI_CONTAINER_HEIGHT;
      maxHeight =
        maxHeight + mediaListHeight + buttonHeight + metaDataContainerHeight;
    }
    if (urlMetaData) {
      maxHeight = maxHeight - metaDataContainerHeight;
    }
    if (maxHeight >= 0) {
      return maxHeight;
    }
    return 0;
  }

  /**
   * Returns a media item component based on the type of the item.
   * @param {object} item - The media item object.
   * @returns A React component representing the media item.
   */
  function getMediaItem(item) {
    if (item.type.includes('video')) {
      return (
        <Video
          ref={videoPlayerRef}
          resizeMode="contain"
          paused={true}
          muted={false}
          source={{uri: item.uri}}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: 10,
          }}
          onLoad={() => {
            if (videoPlayerRef.current) {
              videoPlayerRef.current.seek(0);
            }
          }}
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

  const handlePost = () => {
    if (!isDisabledPostButton()) {
      if (
        (selectedShareType.id === 3 || selectedShareType.id === 4) &&
        shareConnectionsGroupsIdsList.length <= 0
      ) {
        Toast.fail(
          selectedShareType.id === 3 ? 'Select groups' : 'Select connections',
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
  };

  const onPost = lodash.debounce(handlePost, 400);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setisKeyBoardEnabledStatus(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setisKeyBoardEnabledStatus(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isKeyBoardEnabledStatus]);

  /**
   * Renders a selected nugget item with the given item and index.
   * @param {Object} item - The selected nugget item to render.
   * @param {number} index - The index of the selected nugget item.
   * @returns {JSX.Element} - The rendered selected nugget item.
   */
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
          activeOpacity={1}>
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
      isLoading={loadingData.status}
      loaderProps={{
        loaderText: loadingData.text,
      }}
      keyboardAwareContentContainerStyle={{
        flexGrow: 1,
        height: WINDOW_HEIGHT / 2,
      }}
      isEnableKeyboardAware={false}
      // keyBoardAwareScrollViewProps={{
      //   nestedScrollEnabled: true,
      //   keyboardShouldPersistTaps: 'handled',
      //   keyboardDismissMode: 'on-drag',
      // }}
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
      <Pressable
        onLayout={e => {
          setmainContainerHeight(e.nativeEvent.layout.height - 10); // 10 is paddingVertical of 5
        }}
        style={styles.mainContainer}
        onPress={() => {
          Keyboard.dismiss();
          openCloseEmojiPicker(false);
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
                marginLeft={!isPollClicked && !nugget ? 8 : 0}
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
                    setloadingData({
                      status: true,
                      text: 'Opening Camera',
                    });
                  }
                  try {
                    handleOpenCamera();
                  } catch (error) {
                    console.log(error);
                  }
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
              <View style={styles.nameContainer}>
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
          ) : profile?.nugget_content_length > 0 ? (
            <View
              style={[
                styles.inputContainer,
                {
                  maxHeight: getMaxHeight(),
                },
              ]}>
              <TextInput
                placeholder={`What’s on your mind, ${profile?.name}!`}
                style={[
                  styles.textInput,
                  {
                    height: isKeyBoardEnabledStatus
                      ? WINDOW_HEIGHT / 2.5
                      : 'auto',
                  },
                ]}
                multiline
                maxLength={profile?.nugget_content_length}
                onFocus={() => {
                  openCloseEmojiPicker(false);
                }}
                value={getSlicedText(
                  typedText,
                  profile?.nugget_content_length,
                  false,
                )}
                onChangeText={text => {
                  if (
                    text.length > profile?.nugget_content_length &&
                    profile?.user_status_id !== 4
                  ) {
                    Keyboard.dismiss();
                    dispatch(
                      setPremiumAlert({
                        status: true,
                        text: 'You have reached your character limit, to increase the limit upgrade your membership',
                      }),
                    );
                  } else {
                    settypedText(text);
                  }
                }}
                numberOfLines={5}
                textAlignVertical={'top'}
                placeholderTextColor={COLORS.placeHolderColor}
              />

              <View style={styles.emojiIconContainer}>
                <SVGIcon
                  icon={'emojee'}
                  isButton
                  onPress={() => {
                    Keyboard.dismiss();

                    openCloseEmojiPicker(true);
                  }}
                />
              </View>
            </View>
          ) : null}
        </View>
        <View>
          {!isPollClicked &&
            (selectedMediaList.length > 0 ? (
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
            ) : (
              urlMetaData &&
              urlMetaData.length > 0 && (
                <TouchableOpacity
                  activeOpacity={1}
                  onLayout={e => {
                    if (isMount) {
                      setmetaDataContainerHeight(e.nativeEvent.layout.height);
                    }
                  }}
                  style={styles.metaDataContainer}>
                  <RoundedIconButton
                    onPress={() => {
                      if (isMount) {
                        seturlMetaData(null);
                      }
                    }}
                    buttonStyle={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    buttonSize={25}
                    icon="close"
                  />
                  {urlMetaData[urlMetaData.length - 1].open_graph_image && (
                    <Image
                      source={{
                        uri: urlMetaData[urlMetaData.length - 1]
                          .open_graph_image,
                      }}
                      style={{
                        width: (DIMENSIONS.screen.width - 42) / 5,
                        height: (DIMENSIONS.screen.width - 42) / 5,
                        marginVertical: 10,
                      }}
                    />
                  )}
                  <View style={{flex: 1, paddingLeft: 15}}>
                    {urlMetaData[urlMetaData.length - 1].title && (
                      <StyledText
                        style={{
                          color: COLORS.white,
                          fontFamily: FONTS.DMSans.bold,
                        }}
                        normalTextModeTextProps={{numberOfLines: 1}}>
                        {urlMetaData[urlMetaData.length - 1].title}
                      </StyledText>
                    )}
                    {urlMetaData[urlMetaData.length - 1].description && (
                      <StyledText
                        style={{
                          color: COLORS.white,
                        }}
                        normalTextModeTextProps={{numberOfLines: 2}}>
                        {urlMetaData[urlMetaData.length - 1].description}
                      </StyledText>
                    )}
                  </View>
                </TouchableOpacity>
              )
            ))}

          <SubmitButton
            buttonText={
              isPollClicked
                ? 'Post Poll'
                : isFetchingMetaData
                ? 'Fetching URL Details'
                : `${nugget ? 'Edit' : 'Post'} Nugget`
            }
            onLayoutHeight={setbuttonHeight}
            isDisabled={isDisabledPostButton()}
            disabledColor={COLORS.dimColor}
            onPress={onPost}
            rightIcon={isFetchingMetaData && 'close_rounded_white'}
            rightIconSize={23}
            rightIconProps={{
              isButton: true,
              marginLeft: 5,
              onPress: () => {
                if (controller.current) {
                  controller.current.abort();
                }
              },
            }}
          />
        </View>

        <View
          style={{
            display: isOpenEmojiContainer ? 'flex' : 'none',
            height: EMOJI_CONTAINER_HEIGHT,
            backgroundColor: COLORS.white,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTopStartRadius: 10,
            borderTopEndRadius: 10,
          }}>
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
            // enableSearchBar
            // disabledCategories={['people_body', 'flags']}
            categoryPosition="bottom"
            enableCategoryChangeGesture={false}
            defaultHeight={'100%'}
            emojiSize={25}
            styles={{
              header: {fontFamily: FONTS.DMSans.medium},
              // container
              // container: {width: },
            }}
          />
        </View>
      </Pressable>

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
          list={
            selectedShareType.id === 3
              ? [...groupsList].filter(item => item.my_group === 1)
              : connectionsList
          }
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
    flex: 1,
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
    // flex: 1,
    fontFamily: FONTS.DMSans.regular,
    color: COLORS.white,
    fontSize: 17,
    width: '88%',
    // height: '100%',
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
  metaDataContainer: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
