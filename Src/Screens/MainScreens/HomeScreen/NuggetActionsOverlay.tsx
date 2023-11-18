import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {encode} from 'base-64';
import LinearGradient from 'react-native-linear-gradient';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import Badges from '../../../Utilities/Badges';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import SubmitButton from '../../../Components/SubmitButton';

import {
  bigNumberFormater,
  dateToShortDate,
  getFileName,
  getLinkInfo,
  getSlicedText,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  DIMENSIONS,
  IS_IOS,
  NUGGET_ACTIONS,
  NUGGET_SHARE_TYPE,
  RAWCASTER_DEFAULT_MESSAGE,
} from '../../../Utilities/Constants';
import SVGIcon from '../../../Components/SVGIcon';
import {IconType} from '../../../Utilities/Icons';
import {
  useFollowingUsersList,
  useInsets,
  useLikedNuggets,
  useProfile,
  useSavedNuggetsIds,
  useToken,
  useUnLikedNuggetsFromLikedNuggets,
} from '../../../Utilities/StoreData';
import {StackActions, useNavigation} from '@react-navigation/native';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {useDispatch} from 'react-redux';
import {
  setIsOpenLoginAlert,
  setPremiumAlert,
  setIsOpenVerifyPopup,
} from '../../../Store/Slices/UtilitySlice';
import {pollVoteService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';
import CommentsList from './Comments/CommentsList';
import MenuContainer from '../../../Modals/MenuContainer';
import {
  useNuggetItemActions,
  useNuggetParentActions,
  useReadMoreTextNuggetContext,
} from '../../../Utilities/Contexts';
import PollDataDisplay from '../../../Components/PollDataDisplay';
import MediaProgressSlider from '../../../Components/MediaProgressSlider';
import AudioWaveFormImage from '../../../Assets/Png/waveform.png';
import AudioWaveFormGif from '../../../Assets/Gif/waveform.gif';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import AIChat from './OpenAI/AIChat';
import LoadingDots from '../../../Components/LoadingDots';
import {nuggetContentAudioService} from '../../../Services/ApiService';
import {SOCIAL_SHARE_LINK} from '../../../Services/ServiceConstants';
import RNFetchBlob, {RNFetchBlobConfig} from 'rn-fetch-blob';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

type Props = {
  nuggetType: 'video' | 'image' | 'audio' | 'other';
  isPaused: boolean;
  isLoadingVideo?: boolean;
  setpaused?: (valu: boolean) => void;
  mediaSeekUpdate?: (valu: any) => void;
  onPressShare?: () => void;
  onEditNugget: () => void;
  onPressShareType: () => void;
  onDeleteNugget: () => void;
  onPlayPauseVideo?: () => void;
  onBlockUser: () => void;
  onReportAbouseNugget: () => void;
  duration?: number;
  progress?: number;
  nuggetContentController?: any;
  numberOfLines?: number;
  onReadMore?: (val: any) => void;
};
type ActionContainerProps = {
  icon: IconType;
  isMustLogin?: boolean;
  text?: string;
  isEnableText?: boolean;
  onPress?: () => void;
  isEnableTextButton?: boolean;
  onPressText?: () => void;
};

type NuggetDetailsProps = {
  value: any;
  onPress?: () => void;
};

type PollVotedDataProp = {
  isVoted: boolean;
  votedOptionID: any;
};

type DownloadFileProp = {
  path: string;
  fileName: string;
};

function NuggetActionsOverlay({
  nuggetType,
  isPaused,
  onPressShare,
  onEditNugget,
  setpaused,
  mediaSeekUpdate,
  isLoadingVideo,
  onDeleteNugget,
  onPressShareType,
  onPlayPauseVideo,
  onBlockUser,
  onReportAbouseNugget,
  duration = 0,
  progress = 0,
  nuggetContentController,
  numberOfLines = 3,
  onReadMore,
}: Props) {
  const {
    headerContainerHeight,
    isMuted,
    setisMuted,
    isEnableADDButton,
    isFromGlobalSearch,
    isEnableHeaderContainerHeightforTopButtons,
    isEnableTopInsetsPadding,

    handleStopAudio,
    isReadMuted,
    isReadMore,
  } = useNuggetParentActions();

  const {
    totalViews,
    totalComments,
    setTotalComments,
    nugget,
    updateLike,
    updateSave,
    updateIsFan,
    setisRepeatVideo,
    handleNuggetContentTranslate,
    setisVideoBackground,
  } = useNuggetItemActions();
  const {
    isTranslated,
    setisTranslated,
    url,
    seturl,
    onPressUrl,
    isTranslateLoading,
    nuggetContentAudioAPICall,
    getTranslatedContent,
    isReadLoading,
    setisReadLoading,
  } = useReadMoreTextNuggetContext();

  const navigation = useNavigation();
  const token = useToken();
  const profile = useProfile();
  const dispatch = useDispatch();
  const insets = useInsets();
  const likedNuggets = useLikedNuggets();
  const followingUsersList = useFollowingUsersList();
  const unLikedNuggetsFromLikedNuggets = useUnLikedNuggetsFromLikedNuggets();
  const savedNuggetsIds = useSavedNuggetsIds();
  const shareLinkTimer = useRef<any>(undefined);
  const [isEnableContentPanningGesture, setisEnableContentPanningGesture] =
    useState(true);
  const [openUrlConfirmation, setopenUrlConfirmation] = useState(false);

  const [urlConfirmationMetaData, seturlConfirmationMetaData] = useState(null);
  const [pollVotedData, setpollVotedData] = useState<PollVotedDataProp>({
    isVoted: nugget.voted ? parseInt(nugget.voted) === 1 : false,
    votedOptionID: null,
  });
  const [actionButtonsContainerWidth, setactionButtonsContainerWidth] =
    useState(0);
  const [nuggetDataBottomContainerHeight, setnuggetDataBottomContainerHeight] =
    useState(0);
  const [pollDataHeight, setpollDataHeight] = useState(0);
  const [metaDataHeight, setmetaDataHeight] = useState(0);
  const [mainContentContainerHeight, setmainContentContainerHeight] =
    useState(0);
  const [mainContentContainerWidth, setmainContentContainerWidth] = useState(0);
  const [mediaSliderHeight, setmediaSliderHeight] = useState(0);
  const [openMenuOptions, setopenMenuOptions] = useState(false);

  const commentsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const aiChatBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    return () => {
      if (shareLinkTimer.current) {
        clearTimeout(shareLinkTimer.current);
      }
    };
  }, []);

  const handlePresentCommentsModal = useCallback(() => {
    if (setisVideoBackground) {
      setisVideoBackground(true);
    }
    commentsBottomSheetModalRef.current?.present();
  }, []);
  const handleCloseCommentsModal = useCallback(() => {
    if (setisVideoBackground) {
      setisVideoBackground(false);
    }
    commentsBottomSheetModalRef.current?.close();
  }, []);

  const handlePresentAIChatModal = useCallback(() => {
    if (setisVideoBackground) {
      setisVideoBackground(true);
    }
    aiChatBottomSheetModalRef.current?.present();
  }, []);
  const handleCloseAIChatModal = useCallback((val = false) => {
    if (setisVideoBackground) {
      setisVideoBackground(false);
    }
    aiChatBottomSheetModalRef.current?.close();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {}, []);

  /**
   * Retrieves the name of the nugget share type based on the nugget's share_type ID.
   * @returns {string} The name of the nugget share type, or an empty string if not found.
   */
  const getNuggetType = () => {
    const nuggetType = NUGGET_SHARE_TYPE.find(
      item => item.id === nugget.share_type,
    );
    if (nuggetType) {
      return nuggetType.name;
    }
    return '';
  };

  /**
   * Makes an API call to vote on a poll option.
   * @param {number} optionId - The ID of the poll option to vote for.
   * @returns None
   */
  const pollVotingAPICall = (optionId: number) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('poll_option_id', optionId);
    pollVoteService(formData)
      .then(res => {
        if (res.data.status === 1) {
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {
        setpollVotedData({isVoted: false, votedOptionID: null});
        Toast.fail(e.message);
      });
  };

  /**
   * Calculates the total number of votes for a poll.
   * @returns {number} The total number of votes.
   */
  const getTotalVotes = () => {
    return pollVotedData.votedOptionID
      ? parseInt(nugget.total_vote) + 1
      : nugget.total_vote;
  };

  /**
   * Retrieves the poll options and calculates the vote count and percentage for each option.
   * @returns An array of poll options with updated vote count and percentage.
   */
  const getPollOptions = () => {
    let tempPollOptions = [...nugget.poll_option].map(item => {
      let votes = item.votes;
      if (pollVotedData.votedOptionID === item.option_id) {
        votes = parseInt(item.votes) + 1;
      }
      return {
        ...item,
        votes,
        option_percentage: parseFloat(
          ((parseInt(votes) / parseInt(getTotalVotes())) * 100).toString(),
        ).toFixed(2),
      };
    });
    return [...tempPollOptions];
  };

  /**
   * Handles the onPress event for a URL value.
   * If the value includes 'rawcaster', it opens the URL using the Linking API.
   * Otherwise, it sets the openUrlConfirmation state to true and sets the url state to the given value.
   * @param {any} value - The URL value to handle onPress event for.
   * @returns None
   */

  /**
   * Retrieves the menu options based on the current state of the nugget.
   * @returns {Array} An array of menu options.
   */
  const getMenuOptions = () => {
    let result = [];
    if (nugget.is_nugget_owner === 1) {
      if (
        (nugget.poll_option && nugget.poll_option.length > 0) ||
        nugget.type === 2
      ) {
        result = [...NUGGET_ACTIONS].filter(item => item.id === 2);
      } else {
        result = [...NUGGET_ACTIONS].filter(
          item => item.id < 3 || item.id === 5,
        );
      }
    } else {
      if (nugget.type === 2) {
        result = [...NUGGET_ACTIONS].filter(item => item.id > 2 && item.id < 5);
      } else {
        result = [...NUGGET_ACTIONS].filter(item => item.id > 2 && item.id < 6);
      }
    }

    if (
      nugget.media_list &&
      nugget.media_list[0] &&
      nugget.share_type === 1 &&
      //@ts-ignore
      profile?.user_status_id >= 4
    ) {
      const downloadOption = [...NUGGET_ACTIONS].find(item => item.id === 6);
      if (downloadOption) {
        result.push({...downloadOption});
      }
    }
    return result;
  };

  /**
   * Handles the sharing of a link using the Share API.
   * @returns None
   */
  const onShareLink = async () => {
    const shareMessage =
      `${SOCIAL_SHARE_LINK}` + `${encode(nugget.share_link)}`;
    try {
      const result = await Share.share({
        message: shareMessage,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      if (setisVideoBackground) {
        setisVideoBackground(false);
      }
    }
  };

  const downloadMedia = async (
    url: string,
    fileName: string,
    type: 'image' | 'video' | 'audio',
  ) => {
    Toast.success('Downloading Media');
    console.log(type);

    if (IS_IOS) {
      if (type === 'image') {
        CameraRoll.save(url, {
          album: 'Rawcaster',
          type: 'photo',
        })
          .then(res => {
            Toast.success('Media Downloaded');
          })
          .catch(e => {
            Toast.fail(e.message);
          });
      } else {
        const getFileExtention = (fileUrl: string) => {
          // To get the file extension
          return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
        };
        let date = new Date();
        // File URL which we want to download
        let FILE_URL = url;
        // Function to get extention of the file url
        //@ts-ignore
        let file_ext: string = getFileExtention(FILE_URL);

        file_ext = '.' + file_ext[0];
        const {config, fs} = RNFetchBlob;
        let RootDir = fs.dirs.DocumentDir;
        let options: RNFetchBlobConfig = {
          fileCache: true,
          path:
            RootDir +
            '/file_' +
            Math.floor(date.getTime() + date.getSeconds() / 2) +
            file_ext,
          //@ts-ignore
          notification: true,
          title: fileName,
          IOSBackgroundTask: true,
          addAndroidDownloads: {
            //Related to the Android only
            useDownloadManager: true,
            notification: true,
            path:
              RootDir +
              '/file_' +
              Math.floor(date.getTime() + date.getSeconds() / 2) +
              file_ext,
            description: 'Nugget Download',
          },
        };
        console.log(options);
        config(options)
          .fetch('GET', url)
          .then(res => {
            if (IS_IOS) {
              RNFetchBlob.ios.openDocument(
                RootDir +
                  '/file_' +
                  Math.floor(date.getTime() + date.getSeconds() / 2) +
                  file_ext,
              );
            }

            Toast.success('Media Downloaded');
          })
          .catch(e => {
            console.log(e.message);

            // Toast.success(e.message);
          });
      }
    } else {
      const {config, fs} = RNFetchBlob;
      let downloadDir = fs.dirs.PictureDir;
      let options = {
        fileCache: true,
        path: downloadDir + '/Rawcaster/' + fileName,
        notification: true,
        title: fileName,
        addAndroidDownloads: {
          //Related to the Android only
          useDownloadManager: true,
          notification: true,
          path: downloadDir + '/Rawcaster/' + fileName,
          description: 'Nugget Download',
        },
      };
      console.log(options);

      config(options)
        .fetch('GET', url)
        .then(res => {
          Toast.success('Media Downloaded');
        })
        .catch(e => {
          // Toast.success(e.message);
        });
    }
  };

  // const handleDownloadMedia = async (item: DownloadFileProp) => {
  //   console.log(item, 'ITEM DOWNLOAD');

  //   if (IS_IOS) {
  //     downloadMedia(item.path, item.fileName);
  //   } else {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //         {
  //           title: 'Storage Permission Required',
  //           message:
  //             'Rawcaster needs access to your storage to download Photos',
  //           buttonPositive: 'OK',
  //         },
  //       );
  //       console.log(granted, 'GRANTED');

  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {

  //       } else {
  //         Toast.fail('Storage Permission Not Granted');
  //       }
  //     } catch (err: any) {
  //       if (err?.message) {
  //         Toast.fail(err.message);
  //       }
  //     }

  //     // try {
  //     //   PermissionsAndroid.request(
  //     //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  //     //     {
  //     //       title: 'Rawcaster Storage Permission',
  //     //       message:
  //     //         'Rawcaster needs access to your storage ' +
  //     //         'so you can download files.',
  //     //       buttonNeutral: 'Ask Me Later',
  //     //       buttonNegative: 'Cancel',
  //     //       buttonPositive: 'OK',
  //     //     },
  //     //   ).then(granted => {
  //     //     downloadMedia(item.path, item.fileName);
  //     //     // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //     //     //   downloadMedia(item.path, item.fileName);
  //     //     // } else {
  //     //     //   Toast.fail('Storage Permission Denied');
  //     //     // }
  //     //   });
  //     // } catch (err: any) {
  //     //   if (err?.message) {
  //     //     Toast.fail(err.message);
  //     //   }
  //     // }
  //   }
  // };

  /**
   * Handles the action to be performed when a nugget is pressed.
   * @param {number} id - The ID of the pressed nugget.
   * @returns None
   */
  const onPressNuggetAction = (id: number) => {
    setopenMenuOptions(false);
    switch (id) {
      case 1:
        onEditNugget();
        break;
      case 2:
        onDeleteNugget();
        break;
      case 3:
        onBlockUser();
        break;
      case 4:
        onReportAbouseNugget();
        break;
      case 5:
        if (setisVideoBackground) {
          setisVideoBackground(true);
        }
        shareLinkTimer.current = setTimeout(() => {
          onShareLink();
          clearTimeout(shareLinkTimer.current);
        }, 200);
        break;
      case 6:
        if (nugget?.media_list && nugget?.media_list[0]) {
          const mediaFile = nugget?.media_list[0];

          downloadMedia(
            mediaFile.path,
            getFileName(mediaFile.path),
            mediaFile.media_type,
          );
          // handleDownloadMedia({
          //   fileName: getFileName(mediaFile.path),
          //   path: mediaFile.path,
          // });
        }
        break;
    }
  };

  /**
   * Checks if the translated content exists in the nugget object. If it does, it sets the
   * isTranslated state to true. If it doesn't, it sets the isTranslateLoading state to true
   * and makes an API call to retrieve the translated content.
   * @returns None
   */

  /**
   * Checks if the user is verified.
   * @returns {boolean} - Returns true if the user is verified, false otherwise.
   */
  const isVerified = () => {
    if (profile && profile.acc_verify_status === 1) {
      return true;
    }
    if (setisVideoBackground) {
      setisVideoBackground(true);
    }
    dispatch(setIsOpenVerifyPopup(true));
    return false;
  };

  /**
   * Checks if the user is logged in.
   * @returns {boolean} - true if the user is logged in, false otherwise.
   */
  const isLogin = () => {
    if (token) {
      return true;
    }
    if (setisVideoBackground) {
      setisVideoBackground(true);
    }
    dispatch(setIsOpenLoginAlert(true));
    return false;
  };

  /**
   * Calculates the bottom value of the content container based on various conditions.
   * @returns {number} - The calculated bottom value.
   */
  const getBottomValueOfContentContainer = () => {
    if (isFromGlobalSearch) {
      let bottomValue = 0;
      if (insets.bottom) {
        bottomValue = bottomValue + insets.bottom;
      }
      if ((nuggetType === 'video' || nuggetType === 'audio') && duration > 0) {
        bottomValue = bottomValue + mediaSliderHeight + 10;
      }
      return bottomValue ? bottomValue : 20;
    }
    if ((nuggetType === 'video' || nuggetType === 'audio') && duration > 0) {
      return mediaSliderHeight + 60;
    }
    return 85;
  };

  /**
   * Retrieves the total number of likes for a nugget.
   * @returns {number} The total number of likes for the nugget.
   */
  const getTotalLikes = () => {
    let tempLikesCount = nugget.total_likes;
    if (isNuggetLiked()) {
      const tempLikedNuggets = [...likedNuggets];
      const tempLikedNuggetData = tempLikedNuggets.find(
        item => item.id === nugget.nugget_id,
      );
      tempLikesCount = tempLikedNuggetData?.total_likes;
    } else {
      const tempUnlikedNuggets = [...unLikedNuggetsFromLikedNuggets];
      const tempUnLikedNuggetData = tempUnlikedNuggets.find(
        item => item.id === nugget.nugget_id,
      );
      if (tempUnLikedNuggetData) {
        tempLikesCount = tempUnLikedNuggetData.total_likes;
      }
    }
    if (tempLikesCount <= 0 && isNuggetLiked()) {
      tempLikesCount = 1;
    }
    return tempLikesCount > 0 ? tempLikesCount : 0;
  };

  /**
   * Checks if a nugget is liked by comparing its ID to the IDs of the nuggets in the
   * `likedNuggets` array.
   * @returns {boolean} - `true` if the nugget is liked, `false` otherwise.
   */
  const isNuggetLiked = () => {
    const tempLikedNuggets = [...likedNuggets];
    return tempLikedNuggets.find(item => item.id === nugget.nugget_id)
      ? true
      : false;
  };

  /**
   * Checks if the current user is a fan of the nugget.
   * @returns {boolean} - true if the user is a fan, false otherwise.
   */
  const isFan = () => {
    const tempFollowingUsersList = [...followingUsersList];
    return tempFollowingUsersList.find(item => item.user_id === nugget.user_id)
      ? true
      : false;
  };

  /**
   * Checks if the given nugget is saved.
   * @returns {boolean} - True if the nugget is saved, false otherwise.
   */
  const isNuggetSaved = () => {
    return [...savedNuggetsIds].includes(nugget.nugget_id);
  };

  /**
   * Retrieves the fan count for a user.
   * @returns {number} - The fan count of the user.
   */
  const getFansCount = () => {
    if (isFan()) {
      const tempFollowingUsersList = [...followingUsersList];
      return tempFollowingUsersList.find(
        item => item.user_id === nugget.user_id,
      )?.follow_count;
    }
    return nugget.follow_count;
  };

  const ActionIconContainer = ({
    icon,
    text = '',
    onPress = () => {},
    isEnableText = true,
    isMustLogin = true,
    onPressText = () => {},
    isEnableTextButton = false,
  }: ActionContainerProps) => {
    return (
      <View style={{alignItems: 'center', paddingTop: 5}}>
        <SVGIcon
          icon={icon}
          isButton
          onPress={() => {
            if (isMustLogin) {
              if (isLogin() && isVerified()) {
                onPress();
              }
            } else {
              onPress();
            }
          }}
        />

        {isEnableText && (
          <StyledText
            style={styles.actionButtonText}
            onPress={() => {
              if (isEnableTextButton) {
                onPressText();
              }
            }}>
            {text ? text : ''}
          </StyledText>
        )}
      </View>
    );
  };

  const Dot = () => {
    return <View style={styles.dotContainer} />;
  };
  const MediaControllers = () => {
    return isLoadingVideo ? (
      <View>
        <ActivityIndicator color={COLORS.white} size={'large'} />
        {/* <StyledText style={{color: COLORS.white}}>Media Loading</StyledText> */}
      </View>
    ) : isPaused ? (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPlayPauseVideo}
        style={styles.playPauseButton}>
        <SVGIcon icon="play_white" height={20} width={20} marginLeft={5} />
      </TouchableOpacity>
    ) : null;
  };

  const UserNuggetDetail = ({value, onPress}: NuggetDetailsProps) => {
    return (
      <StyledText style={styles.userDetailsText} onPress={onPress}>
        {value}
      </StyledText>
    );
  };

  const PollData = useCallback(() => {
    return (
      <>
        <PollDataDisplay
          onLayoutHeight={height => {
            setpollDataHeight(height);
          }}
          createdDate={nugget.created_date}
          isVoted={nugget.voted ? parseInt(nugget.voted) === 1 : false}
          onVotePoll={pollVotingAPICall}
          pollDuration={nugget.poll_duration}
          pollOptions={nugget.poll_option}
          totalVotes={parseInt(nugget.total_vote)}
        />
      </>
    );
  }, [pollVotedData, getPollOptions(), nugget]);

  const MetaDataContainer = () => {
    let metaData = JSON.parse(nugget.metadata);
    const isArrayData = Array.isArray(metaData);
    if (!isArrayData) {
      metaData = [{...metaData}];
    }
    const lastIndex = metaData.length - 1;
    if (metaData.length === 0 && !metaData[lastIndex]) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.metaDataContainer}
        activeOpacity={0.7}
        onLayout={e => {
          setmetaDataHeight(e.nativeEvent.layout.height);
        }}
        onPress={() => {
          const url = getLinkInfo(nugget.content);
          onPressUrl(url);
        }}>
        {metaData[lastIndex]?.open_graph_image && (
          <Image
            source={{uri: metaData[lastIndex]?.open_graph_image}}
            style={styles.metaDataImage}
          />
        )}
        <View style={{flex: 1, paddingLeft: 10}}>
          {metaData[lastIndex]?.title && (
            <StyledText
              style={styles.metaDataTitle}
              normalTextModeTextProps={{numberOfLines: 2}}>
              {metaData[lastIndex]?.title}
            </StyledText>
          )}
          {metaData[lastIndex]?.title && (
            <StyledText
              style={styles.metaDataDescription}
              normalTextModeTextProps={{numberOfLines: 2}}>
              {metaData[lastIndex]?.title}
            </StyledText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPlayPauseVideo}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 150,
        }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', COLORS.transparent]}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.linearGradient}
        />
      </View>
      <View
        style={{
          height: DIMENSIONS.window.height * 0.7,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
        <LinearGradient
          colors={[COLORS.transparent, 'rgba(0,0,0,0.7)']}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.linearGradient, {paddingBottom: 80}]}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: getBottomValueOfContentContainer(),
          left: 0,
          right: 0,
          paddingHorizontal: 10,
          top:
            (isEnableHeaderContainerHeightforTopButtons
              ? headerContainerHeight
              : 0) +
            10 +
            (isEnableTopInsetsPadding
              ? insets.top
                ? insets.top
                : StatusBar.currentHeight
              : 0),
        }}
        onLayout={e => {
          if (e.nativeEvent.layout.height) {
            setmainContentContainerHeight(e.nativeEvent.layout.height);
          }
          if (e.nativeEvent.layout.width) {
            setmainContentContainerWidth(e.nativeEvent.layout.width);
          }
        }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 10,
            width:
              mainContentContainerWidth - (actionButtonsContainerWidth + 20),
            maxHeight:
              mainContentContainerHeight -
              (nuggetDataBottomContainerHeight + 10) -
              pollDataHeight,
          }}>
          {nugget.content ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                marginRight: isEnableADDButton ? 0 : 20,
              }}>
              <ScrollView
                contentContainerStyle={{
                  flex: 1,
                  flexGrow: 1,
                  zIndex: 1000,
                }}
                scrollEnabled
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                {/* @ts-ignore */}
                <StyledText
                  textMode="read_more_hyper_link"
                  numberOfLines={numberOfLines}
                  isReadmoreEnable={true}
                  onPressUrl={onPressUrl}
                  onReadMore={val => {
                    if (onReadMore) {
                      onReadMore({
                        status: val,
                        text:
                          isTranslated && nugget.translated_content?.trim()
                            ? nugget.translated_content.trim()
                            : nugget.content.trim(),
                      });
                    }
                  }}
                  style={{
                    color: COLORS.white,
                    // fontSize: 15.5,
                    fontSize: 18,
                    opacity: 0.8,
                    lineHeight: 22,
                    width: '100%',
                  }}>
                  {htmlDecodeText(
                    isTranslated && nugget.translated_content?.trim()
                      ? nugget.translated_content.trim()
                      : nugget.content.trim(),
                  )}
                </StyledText>
                <View
                  style={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    marginVertical: 5,
                  }}>
                  {isReadLoading ? (
                    <LoadingDots
                      size={6}
                      bounceHeight={4}
                      dots={3}
                      borderRadius={3}
                    />
                  ) : (
                    <SVGIcon
                      // height={15.5}
                      // height={17.5}
                      height={20}
                      icon={
                        !isReadLoading
                          ? !isReadMuted
                            ? 'mic_fill_white'
                            : 'mic_off_fill_secondary'
                          : undefined
                      }
                      isButton
                      onPress={() => {
                        if (isLogin()) {
                          if (!isReadMuted) {
                            if (setpaused) {
                              setpaused(true);
                            }
                            if (setisMuted) {
                              setisMuted(true);
                            }

                            if (
                              nuggetContentController &&
                              nuggetContentController.current
                            ) {
                              nuggetContentController.current.abort();
                            }
                            setisReadLoading(true);
                            nuggetContentAudioAPICall();
                          } else {
                            if (handleStopAudio) {
                              handleStopAudio();
                            }
                          }
                        }
                      }}
                    />
                  )}
                  <View
                    style={{
                      width: 2,
                      height: 20,
                      marginHorizontal: 5,
                      backgroundColor: COLORS.white,
                    }}
                  />
                  {isTranslateLoading ? (
                    <LoadingDots
                      size={6}
                      bounceHeight={4}
                      dots={3}
                      borderRadius={3}
                    />
                  ) : (
                    <SVGIcon
                      // height={15.5}
                      // height={17.5}
                      height={20}
                      icon={
                        !isTranslateLoading
                          ? isTranslated
                            ? 'translation_secondary'
                            : 'translation_white'
                          : undefined
                      }
                      isButton
                      onPress={() => {
                        if (isLogin()) {
                          if (isTranslated) {
                            setisTranslated(false);
                          } else {
                            getTranslatedContent();
                          }
                        }
                      }}
                    />
                  )}
                </View>
              </ScrollView>
            </TouchableOpacity>
          ) : null}

          {nugget.poll_option && nugget.poll_option.length > 0 && PollData()}
          {nugget.metadata &&
            nugget.media_list &&
            nugget.media_list.length <= 0 &&
            MetaDataContainer()}
          {/* // : nugget.metadata &&
            //   nugget.media_list &&
            //   nugget.media_list.length <= 0 &&
            //   MetaDataContainer()} */}
        </View>
        <View style={[styles.topRightButtonsContainer]}>
          <TouchableOpacity
            style={styles.moreIconButton}
            activeOpacity={0.7}
            onPress={() => {
              if (isLogin() && isVerified()) {
                setopenMenuOptions(true);
                if (setisVideoBackground) {
                  setisVideoBackground(true);
                }
              }
            }}>
            <SVGIcon icon="menu_horizontal_white" height={23} width={23} />
          </TouchableOpacity>

          {(nuggetType === 'video' || nuggetType === 'audio') && (
            <RoundedIconButton
              icon={isMuted ? 'mute_white' : 'speaker_fill_white'}
              bgColor={COLORS.transparentDimColor}
              iconSize={20}
              buttonSize={40}
              buttonStyle={{marginVertical: 5}}
              onPress={() => {
                if (setisMuted) {
                  setisMuted(!isMuted);
                }
              }}
            />
          )}

          {token && profile && isEnableADDButton ? (
            <RoundedIconButton
              icon="open_ai_white"
              bgColor={COLORS.transparentDimColor}
              iconSize={25}
              buttonSize={40}
              buttonStyle={{marginVertical: 5}}
              onPress={() => {
                if (profile?.user_status_id && profile?.user_status_id > 1) {
                  handlePresentAIChatModal();
                } else {
                  dispatch(
                    setPremiumAlert({
                      status: true,
                      text: RAWCASTER_DEFAULT_MESSAGE.UPGRADE_MESSAGE,
                    }),
                  );
                }
              }}
            />
          ) : null}
        </View>

        <View
          style={{
            flex: 1,
            position: 'absolute',
            left: 10,
            bottom: 0,
            marginRight: actionButtonsContainerWidth,
          }}
          onLayout={e => {
            if (e.nativeEvent.layout.height) {
              setnuggetDataBottomContainerHeight(e.nativeEvent.layout.height);
            }
          }}>
          <View>
            <View style={styles.profileImageContainer}>
              <ProfileWithBadge
                badge={Badges(nugget.user_status_id)}
                profileImage={nugget.user_image}
                isEnableGradient={false}
                profileSize={45}
                isButton
                onPressProfile={() => {
                  if (isLogin()) {
                    const pushAction = StackActions.push('ProfileStack', {
                      userId:
                        nugget.user_id === profile?.user_id
                          ? null
                          : nugget.user_id,
                    });
                    navigation.dispatch(pushAction);
                  }
                }}
                badgeSize={18}
                badgeContainerStyle={{right: 7}}
                containerStyle={{alignItems: 'flex-start'}}
              />
              {token &&
              !isFan() &&
              profile?.user_id !== nugget?.original_user_id ? (
                <SubmitButton
                  buttonText="Become a Fan"
                  marginTop={0}
                  paddingVertical={0}
                  padding={0}
                  onPress={updateIsFan}
                  marginRight={10}
                  paddingHorizontal={2}
                  buttonTextStyle={{fontSize: 10}}
                />
              ) : null}
            </View>
            <View style={styles.userDetailsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  if (isLogin()) {
                    const pushAction = StackActions.push('ProfileStack', {
                      userId:
                        nugget.user_id === profile?.user_id
                          ? null
                          : nugget.user_id,
                    });
                    navigation.dispatch(pushAction);
                  }
                }}>
                <StyledText
                  style={styles.nameText}
                  normalTextModeTextProps={{numberOfLines: 1}}>
                  {nugget.user_name}{' '}
                  {/* {getSlicedText(
                    htmlDecodeText(nugget.user_name),
                    token ? 15 : 30,
                  )} */}
                </StyledText>
                {nugget.account_verify_type === 1 && (
                  <SVGIcon icon="diamond_verified" height={15} width={15} />
                )}
              </TouchableOpacity>
              {nugget.type === 2 && (
                <>
                  <StyledText style={{color: COLORS.white}}>
                    {'shared' + ' '}
                  </StyledText>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isLogin()) {
                        const pushAction = StackActions.push('ProfileStack', {
                          userId:
                            nugget.original_user_id === profile?.user_id
                              ? null
                              : nugget.original_user_id,
                        });
                        navigation.dispatch(pushAction);
                      }
                    }}>
                    <StyledText style={styles.nameText}>
                      {getSlicedText(
                        htmlDecodeText(nugget.original_user_name),
                        token ? 15 : 30,
                      ) + "'s "}
                    </StyledText>
                  </TouchableOpacity>
                  <StyledText style={{color: COLORS.white}}>Nugget</StyledText>
                </>
              )}
              {/* {token &&
              !isFan() &&
              profile?.user_id !== nugget?.original_user_id ? (
                <SubmitButton
                  buttonText="Become a Fan"
                  marginTop={0}
                  paddingVertical={0}
                  padding={0}
                  onPress={updateIsFan}
                  marginHorizontal={10}
                  paddingHorizontal={2}
                  buttonTextStyle={{fontSize: 10}}
                />
              ) : null} */}
            </View>
            <View style={[styles.userDetailsContainer, {paddingVertical: 5}]}>
              <UserNuggetDetail value={dateToShortDate(nugget.created_date)} />
              <Dot />
              <UserNuggetDetail value={`${totalViews} Views`} />
              <Dot />
              <TouchableOpacity
                disabled={nugget.share_type !== 3 && nugget.share_type !== 4}
                activeOpacity={0.7}
                onPress={onPressShareType}>
                <UserNuggetDetail value={getNuggetType()} />
              </TouchableOpacity>
              <Dot />
              <UserNuggetDetail value={`${getFansCount()} Fans`} />
            </View>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
            position: 'absolute',
            right: 10,
            bottom: 0,
            zIndex: 10,
          }}
          onLayout={e => {
            if (e.nativeEvent.layout.width) {
              setactionButtonsContainerWidth(e.nativeEvent.layout.width);
            }
          }}>
          {token && isEnableADDButton ? (
            <RoundedPlusButton
              onPress={() => {
                if (token && profile && profile?.acc_verify_status === 0) {
                  dispatch(setIsOpenVerifyPopup(true));
                } else {
                  /* @ts-ignore */
                  navigation.navigate('PostEditNugget');
                }
              }}
              style={{marginBottom: 20}}
            />
          ) : null}
          <ActionIconContainer
            icon={isNuggetLiked() ? 'heart_pink' : 'heart_white'}
            text={bigNumberFormater(getTotalLikes())}
            onPress={updateLike}
            isEnableTextButton={
              bigNumberFormater(getTotalLikes()) ? true : false
            }
            onPressText={() => {
              /* @ts-ignore */
              navigation.navigate('ProfileStack', {
                screen: 'ProfileSeeAllUsersList',
                params: {
                  initialList: [],
                  listType: 'nugget_agreed_users',
                  title: 'Agreed Users',
                  nuggetId: nugget.nugget_id,
                },
              });
            }}
          />
          <ActionIconContainer
            icon="comment"
            text={bigNumberFormater(totalComments)}
            onPress={() => {
              handlePresentCommentsModal();
            }}
          />
          {parseInt(nugget.share_type) === 1 &&
            parseInt(nugget.type) === 1 &&
            !(nugget.poll_option && nugget.poll_option.length > 0) && (
              <ActionIconContainer icon="share" onPress={onPressShare} />
            )}
          <ActionIconContainer
            icon={isNuggetSaved() ? 'save_pink' : 'save_white'}
            isEnableText={false}
            onPress={updateSave}
          />
        </View>
      </View>
      {(nuggetType === 'video' || nuggetType === 'audio') && duration > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: isFromGlobalSearch
              ? insets.bottom
                ? insets.bottom
                : 10
              : 55,
            right: 0,
            left: 0,
          }}
          onLayout={e => {
            if (e.nativeEvent.layout.height) {
              setmediaSliderHeight(e.nativeEvent.layout.height);
            }
          }}>
          <MediaProgressSlider
            duration={duration}
            progress={progress}
            seekUpdate={mediaSeekUpdate}
          />
        </View>
      )}
      {(nuggetType === 'video' || nuggetType === 'audio') && (
        <MediaControllers />
      )}

      {nuggetType === 'audio' && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: -1,
          }}>
          <Image
            source={
              isPaused || isLoadingVideo || progress === duration
                ? AudioWaveFormImage
                : AudioWaveFormGif
            }
            resizeMode="contain"
            style={{
              width: '80%',
            }}
          />
        </View>
      )}

      <Modal visible={openUrlConfirmation} transparent>
        <ConfirmationPopup
          metaData={urlConfirmationMetaData}
          onClose={() => {
            setopenUrlConfirmation(false);
            seturl('');
            seturlConfirmationMetaData(null);
          }}
          onPressPositiveButton={() => {
            if (url) {
              setopenUrlConfirmation(false);
              Linking.openURL(url)
                .then(res => {})
                .catch(e => {});
            }
          }}
          onPressNegativeButton={() => {
            setopenUrlConfirmation(false);
            seturlConfirmationMetaData(null);
            seturl('');
          }}
          positiveButtonText="Continue"
          negativeButtonText="Cancel"
          content={
            'The site you have requested is not managed by Rawcaster.com, we cannot vouch for the contents of the site. We recommend, that you excercise precautions before you click unknown sites.'
          }
        />
      </Modal>
      <Modal
        visible={openMenuOptions}
        transparent
        onRequestClose={() => {
          setopenMenuOptions(false);
          if (setisVideoBackground) {
            setisVideoBackground(false);
          }
        }}>
        <MenuContainer
          setModal={status => {
            setopenMenuOptions(status);
            if (setisVideoBackground) {
              setisVideoBackground(status);
            }
          }}
          buttonsOptions={getMenuOptions()}
          onPressOption={onPressNuggetAction}
        />
      </Modal>

      <BottomSheetModal
        ref={commentsBottomSheetModalRef}
        handleStyle={{display: 'none'}}
        onDismiss={() => {
          setisEnableContentPanningGesture(true);
          if (setisVideoBackground) {
            setisVideoBackground(false);
          }
        }}
        topInset={insets.top ? insets.top : StatusBar.currentHeight}
        bottomInset={insets.bottom}
        stackBehavior="push"
        keyboardBlurBehavior={'restore'}
        android_keyboardInputMode="adjustPan"
        backgroundComponent={() => <View />}
        enableContentPanningGesture={isEnableContentPanningGesture}
        backdropComponent={props => {
          return (
            <TouchableOpacity
              style={{
                flex: 1,
                position: 'absolute',
                backgroundColor: COLORS.transparentDimColor,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              activeOpacity={1}
              onPress={() => {
                handleCloseCommentsModal();
              }}
            />
          );
        }}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <CommentsList
          onPressBack={() => {
            handleCloseCommentsModal();
          }}
          setisEnableContentPanningGesture={setisEnableContentPanningGesture}
          id={nugget.nugget_id}
          setTotalComments={setTotalComments}
          totalComments={totalComments}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={aiChatBottomSheetModalRef}
        handleStyle={{display: 'none'}}
        enableOverDrag={false}
        enableContentPanningGesture={false}
        enablePanDownToClose={false}
        topInset={insets.top ? insets.top : StatusBar.currentHeight}
        bottomInset={insets.bottom}
        stackBehavior="push"
        keyboardBlurBehavior={'restore'}
        android_keyboardInputMode="adjustPan"
        backgroundComponent={() => <View />}
        backdropComponent={props => {
          return (
            <TouchableOpacity
              style={{
                flex: 1,
                position: 'absolute',
                backgroundColor: COLORS.transparentDimColor,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
              activeOpacity={1}
              onPress={() => {
                handleCloseAIChatModal();
              }}
            />
          );
        }}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <AIChat
          onPressBack={() => {
            handleCloseAIChatModal();
          }}
          onPermissionResult={() => {
            // if (setpaused) {
            //   setpaused(true);
            //   setisRepeatVideo(true);
            // }
          }}
          handleShareContent={(content: string) => {
            handleCloseAIChatModal(true);
            const timer = setTimeout(() => {
              /* @ts-ignore */
              navigation.navigate('PostEditNugget', {
                preContent: content,
              });
              clearTimeout(timer);
            }, 500);
          }}
        />
      </BottomSheetModal>
    </TouchableOpacity>
  );
}

export default NuggetActionsOverlay;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    // paddingBottom: IS_IOS ? 100 : 100,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 14,
  },
  userDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingRight: 10,
  },
  userDetailsText: {
    fontSize: 11,
    color: '#ffffff',
    opacity: 0.9,
  },
  dotContainer: {
    height: 4,
    width: 4,
    borderRadius: 4 / 2,
    backgroundColor: COLORS.white,
    marginHorizontal: 6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.DMSans.medium,
    paddingVertical: 5,
  },
  mediaControllersContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
  topRightButtonsContainer: {
    position: 'absolute',
    top: 0,
    right: 10,
    alignItems: 'center',
  },
  moreIconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  metaDataContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    marginRight: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  metaDataImage: {
    height: DIMENSIONS.window.width / 5,
    width: DIMENSIONS.window.width / 5,
    borderRadius: 10,
  },
  metaDataTitle: {
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.white,
  },
  metaDataDescription: {
    color: COLORS.white,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
