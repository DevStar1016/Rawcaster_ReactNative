import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
  getMediaDurationFormat,
  getSlicedText,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import {
  DIMENSIONS,
  NUGGET_ACTIONS,
  NUGGET_SHARE_TYPE,
} from '../../../Utilities/Constants';
import SVGIcon from '../../../Components/SVGIcon';
import {IconType} from '../../../Utilities/Icons';
import {
  useInsets,
  useLikedNuggetsIds,
  useProfile,
  useSavedNuggetsIds,
  useSettings,
  useToken,
  useUserData,
} from '../../../Utilities/StoreData';
import {StackActions, useNavigation} from '@react-navigation/native';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {useDispatch} from 'react-redux';
import {
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
} from '../../../Store/Slices/UtilitySlice';
import {pollVoteService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';
import AnimatedBgFillContainer from '../../../Components/AnimatedBgFillContainer';
import CommentsList from './Comments/CommentsList';
import MenuContainer from '../../../Modals/MenuContainer';
import {
  useNuggetItemActions,
  useNuggetParentActions,
} from '../../../Utilities/Contexts';
import PollDataDisplay from '../../../Components/PollDataDisplay';
import MediaProgressSlider from '../../../Components/MediaProgressSlider';
import AudioWaveFormImage from '../../../Assets/Png/waveform.png';
import AudioWaveFormGif from '../../../Assets/Gif/waveform.gif';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import AIChat from './OpenAI/AIChat';
import LoadingDots from '../../../Components/LoadingDots';
import {nuggetContentAudioService} from '../../../Services/ApiService';

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
};
type ActionContainerProps = {
  icon: IconType;
  isMustLogin?: boolean;
  text?: string;
  isEnableText?: boolean;
  onPress?: () => void;
};

type NuggetDetailsProps = {
  value: any;
  onPress?: () => void;
};

type PollOptionsItemProp = {
  option_id: number;
  option_name: string;
  option_percentage: string;
};
type PollVotedDataProp = {
  isVoted: boolean;
  votedOptionID: any;
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
}: Props) {
  const {
    headerContainerHeight,
    isMuted,
    setisMuted,
    isEnableADDButton,
    isFromGlobalSearch,
    isEnableHeaderContainerHeightforTopButtons,
    isEnableTopInsetsPadding,
    textNuggetNumberOfLines,
  } = useNuggetParentActions();

  const {
    totalViews,
    totalComments,
    setTotalComments,
    nugget,
    updateLike,
    updateSave,
    updateIsFan,
    handlePlayAudio,
    handleStopAudio,
    isReadMuted,
  } = useNuggetItemActions();

  const navigation = useNavigation();
  const token = useToken();
  const user = useUserData();
  const profile = useProfile();
  const dispatch = useDispatch();
  const insets = useInsets();
  const [isEnableContentPanningGesture, setisEnableContentPanningGesture] =
    useState(true);
  const [profileDataContainerHeight, setprofileDataContainerHeight] =
    useState(0);
  const [openUrlConfirmation, setopenUrlConfirmation] = useState(false);
  const [url, seturl] = useState('');
  const [pollVotedData, setpollVotedData] = useState<PollVotedDataProp>({
    isVoted: nugget.voted ? parseInt(nugget.voted) === 1 : false,
    votedOptionID: null,
  });
  const [actionButtonsContainerWidth, setactionButtonsContainerWidth] =
    useState(0);
  const [nuggetDataBottomContainerHeight, setnuggetDataBottomContainerHeight] =
    useState(0);
  const [mainContentContainerHeight, setmainContentContainerHeight] =
    useState(0);
  const [mediaSliderHeight, setmediaSliderHeight] = useState(0);
  const [openMenuOptions, setopenMenuOptions] = useState(false);
  const [isReadLoading, setisReadLoading] = useState(false);
  const [ReadNuggetUrl, setReadNuggetUrl] = useState(null);
  const commentsBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const aiChatBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  const handlePresentCommentsModal = useCallback(() => {
    if (setpaused) {
      setpaused(true);
    }
    commentsBottomSheetModalRef.current?.present();
  }, []);
  const handleCloseCommentsModal = useCallback(() => {
    if (setpaused) {
      setpaused(false);
    }
    commentsBottomSheetModalRef.current?.close();
  }, []);

  const handlePresentAIChatModal = useCallback(() => {
    if (setpaused) {
      setpaused(true);
    }
    aiChatBottomSheetModalRef.current?.present();
  }, []);
  const handleCloseAIChatModal = useCallback(() => {
    aiChatBottomSheetModalRef.current?.close();
    if (setpaused) {
      setpaused(false);
    }
  }, []);

  const handleSheetChanges = useCallback((index: number) => {}, []);

  const getNuggetType = () => {
    const nuggetType = NUGGET_SHARE_TYPE.find(
      item => item.id === nugget.share_type,
    );
    if (nuggetType) {
      return nuggetType.name;
    }
    return '';
  };
  //  function handleExternalLink(url, event = false) {
  //     if (url !== null) {
  //       URL = url;
  //       if (url.includes("rawcaster")) {
  //         Linking.openURL(URL);
  //         return;
  //       }
  //     }
  //     if (event) {
  //       Linking.openURL(URL);
  //     }
  //     setexternalLinkWarning((prev) => !prev);
  //   }

  const pollVotingAPICall = (optionId: number) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('poll_option_id', optionId);
    pollVoteService(formData)
      .then(res => {
        if (res.data.status === 1) {
        } else if (res.data.status === 0) {
          // setpollVotedData({isVoted: false, votedOptionID: null});
          // Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        setpollVotedData({isVoted: false, votedOptionID: null});
        Toast.fail(e.message);
      });
  };

  const nuggetContentAudioAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    nuggetContentAudioService(formData)
      .then(res => {
        console.log(res.data, 'API');

        if (res.data.status === 1) {
          setReadNuggetUrl(res.data.file_path);
          if (handlePlayAudio) {
            handlePlayAudio(res.data.file_path);
          }
        } else if (res.data.status === 0) {
          setReadNuggetUrl(null);
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        setReadNuggetUrl(null);
        Toast.fail(e.message);
      })
      .finally(() => {
        setisReadLoading(false);
      });
  };

  const getTotalVotes = () => {
    return pollVotedData.votedOptionID
      ? parseInt(nugget.total_vote) + 1
      : nugget.total_vote;
  };

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

  const onPressUrl = (value: any) => {
    if (value) {
      if (value.includes('rawcaster')) {
        Linking.openURL(value)
          .then(res => {})
          .catch(e => {});
      } else {
        setopenUrlConfirmation(true);
        seturl(value);
      }
    }
  };

  const getMenuOptions = () => {
    if (nugget.is_nugget_owner === 1) {
      if (
        (nugget.poll_option && nugget.poll_option.length > 0) ||
        nugget.type === 2
      ) {
        return [...NUGGET_ACTIONS].filter(item => item.id === 2);
      }
      return [...NUGGET_ACTIONS].filter(item => item.id < 3);
    } else {
      if (nugget.type === 2) {
        return [...NUGGET_ACTIONS].filter(item => item.id > 2 && item.id < 5);
      }
      return [...NUGGET_ACTIONS].filter(item => item.id > 2);
    }
  };

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
    }
  };

  const isVerified = () => {
    if (user && user.acc_verify_status === 1) {
      return true;
    }
    dispatch(setIsOpenVerifyPopup(true));
    return false;
  };

  const isLogin = () => {
    if (token) {
      return true;
    }
    dispatch(setIsOpenLoginAlert(true));
    return false;
  };

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

  const ActionIconContainer = ({
    icon,
    text = '',
    onPress = () => {},
    isEnableText = true,
    isMustLogin = true,
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
          <StyledText style={styles.actionButtonText}>
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
          createdDate={nugget.created_date}
          isVoted={nugget.voted ? parseInt(nugget.voted) === 1 : false}
          onVotePoll={pollVotingAPICall}
          pollDuration={nugget.poll_duration}
          pollOptions={nugget.poll_option}
          totalVotes={parseInt(nugget.total_vote)}
        />
        {/* <View style={{paddingRight: 20}}>
        {getPollOptions().map((item: PollOptionsItemProp) => {
          return pollVotedData.isVoted ||
            getRemainingTimeOfPoll(nugget.poll_duration) === '' ? (
            // ||!getRemainingTimeOfPoll(nugget.poll_duration)
            <AnimatedBgFillContainer
              key={item.option_id.toString()}
              percentage={item.option_percentage}
              name={item.option_name}
              mainContainerStyle={{marginTop: 10}}
            />
          ) : (
            <SubmitButton
              key={item.option_id.toString()}
              paddingVertical={5}
              buttonText={item.option_name}
              marginTop={10}
              isDisabled={pollVotedData.isVoted}
              onPress={() => {
                if (isLogin() && isVerified()) {
                  setpollVotedData({
                    isVoted: true,
                    votedOptionID: item.option_id,
                  });
                  pollVotingAPICall(item.option_id);
                }
              }}
            />
          );
        })}

        <StyledText style={{color: COLORS.white, paddingTop: 10}}>
          {`${getTotalVotes()} votes . ${getRemainingTimeOfPoll(
            nugget.poll_duration,
          )}`}
        </StyledText>
      </View> */}
      </>
    );
  }, [pollVotedData, getPollOptions(), nugget]);

  return (
    <TouchableOpacity
      activeOpacity={1}
      // disabled={isLoadingVideo}
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
        }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 10,
            marginRight: actionButtonsContainerWidth + 10,
            maxHeight:
              mainContentContainerHeight -
              (nuggetDataBottomContainerHeight + 10),
            // maxHeight:
            // nugget.media_list.length > 0
            //   ? 200
            //   : nugget.poll_option && nugget.poll_option.length > 0
            //   ? isEnableHeaderContainerHeightforTopButtons
            //     ? 150
            //     : nugget.poll_option.length > 2
            //     ? 60
            //     : 150
            //   : DIMENSIONS.window.height -
            //     (headerContainerHeight +
            //       (isFromGlobalSearch
            //         ? insets.bottom
            //           ? insets.bottom
            //           : 30
            //         : 85) /*85 is Bottom Tab Bar Height*/ +
            //       profileDataContainerHeight +
            //       (insets.top ? insets.top : StatusBar.currentHeight)),
          }}>
          {nugget.content ? (
            <TouchableOpacity activeOpacity={1}>
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}>
                  {isReadLoading ? (
                    <View style={{height: 20, alignItems: 'center'}}>
                      <LoadingDots
                        size={6}
                        bounceHeight={5}
                        dots={3}
                        borderRadius={3}
                      />
                    </View>
                  ) : (
                    false
                  )}
                  <StyledText
                    textMode="read_more_hyper_link_icon"
                    numberOfLines={
                      3
                      // nugget.media_list.length > 0 ||
                      // (nugget.poll_option && nugget.poll_option.length > 0)
                      //   ? isEnableHeaderContainerHeightforTopButtons
                      //     ? 5
                      //     : nugget.poll_option.length > 2
                      //     ? 2
                      //     : 5
                      //   : textNuggetNumberOfLines ?? 15
                    }
                    onPressUrl={onPressUrl}
                    iconProps={{
                      icon: !isReadLoading
                        ? !isReadMuted
                          ? 'mic_fill_white'
                          : 'mic_off_fill_white'
                        : undefined,
                      height: 20,
                      isButton: true,
                      onPress: () => {
                        if (!isReadMuted) {
                          console.log('JJJJ');
                          if (setpaused) {
                            setpaused(true);
                          }
                          if (setisMuted) {
                            setisMuted(true);
                          }
                          setisReadLoading(true);
                          nuggetContentAudioAPICall();
                        } else {
                          if (handleStopAudio) {
                            handleStopAudio();
                          }
                        }
                      },
                    }}
                    style={{
                      color: COLORS.white,
                      fontSize: 15.5,
                      opacity: 0.8,
                      flex: 1,
                    }}>
                    {htmlDecodeText(nugget.content.trim())}
                  </StyledText>
                </View>
              </ScrollView>
            </TouchableOpacity>
          ) : null}
          {nugget.poll_option && nugget.poll_option.length > 0 && PollData()}
        </View>
        <View
          style={[
            styles.topRightButtonsContainer,
            // {
            //   top:
            //     (isEnableHeaderContainerHeightforTopButtons
            //       ? headerContainerHeight
            //       : 0) +
            //     10 +
            //     (isEnableTopInsetsPadding
            //       ? insets.top
            //         ? insets.top
            //         : StatusBar.currentHeight
            //       : 0),
            // },
          ]}>
          <TouchableOpacity
            style={styles.moreIconButton}
            activeOpacity={0.7}
            onPress={() => {
              if (isLogin() && isVerified()) {
                setopenMenuOptions(true);
                if (setpaused) {
                  setpaused(true);
                }
              }
            }}>
            <SVGIcon icon="menu_horizontal_white" height={23} width={23} />
          </TouchableOpacity>

          {(nuggetType === 'video' || nuggetType === 'audio') && (
            <RoundedIconButton
              icon={isMuted ? 'mute_white' : 'speaker_white'}
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

          {token && isEnableADDButton && (
            <RoundedIconButton
              icon="open_ai_white"
              bgColor={COLORS.transparentDimColor}
              iconSize={25}
              buttonSize={40}
              buttonStyle={{marginVertical: 5}}
              onPress={() => {
                handlePresentAIChatModal();
              }}
            />
          )}
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
          <View
            onLayout={e => {
              if (e.nativeEvent.layout.height) {
                setprofileDataContainerHeight(e.nativeEvent.layout.height);
              }
            }}>
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
            <View style={styles.userDetailsContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
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
                <StyledText style={styles.nameText}>
                  {getSlicedText(
                    htmlDecodeText(nugget.user_name),
                    token ? 15 : 30,
                  )}
                </StyledText>
              </TouchableOpacity>
              {nugget.type === 2 && (
                <>
                  <StyledText style={{color: COLORS.white}}>
                    {' ' + 'shared' + ' '}
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
              {token && !nugget.following ? (
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
              ) : null}
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
              <UserNuggetDetail value={`${nugget.follow_count} Fans`} />
            </View>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
            position: 'absolute',
            right: 10,
            bottom: 0,
          }}
          onLayout={e => {
            if (e.nativeEvent.layout.width) {
              setactionButtonsContainerWidth(e.nativeEvent.layout.width);
            }
          }}>
          {token && isEnableADDButton ? (
            <RoundedPlusButton
              onPress={() => {
                if (token && user && user?.acc_verify_status === 0) {
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
            icon={nugget.liked ? 'heart_pink' : 'heart_white'}
            text={bigNumberFormater(nugget.total_likes)}
            onPress={updateLike}
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
            icon={nugget.saved ? 'save_pink' : 'save_white'}
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
              isPaused ||
              isLoadingVideo ||
              getMediaDurationFormat(
                Math.floor((progress * duration) / 100),
              ) === getMediaDurationFormat(duration)
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
          onClose={() => {
            setopenUrlConfirmation(false);
            seturl('');
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
          if (setpaused) {
            setpaused(false);
          }
        }}>
        <MenuContainer
          setModal={status => {
            setopenMenuOptions(status);
            if (setpaused) {
              setpaused(status);
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
          if (setpaused) {
            setpaused(false);
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
        enablePanDownToClose={false}
        onDismiss={() => {
          if (setpaused) {
            setpaused(false);
          }
        }}
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
          handleShareContent={(content: string) => {
            handleCloseAIChatModal();
            /* @ts-ignore */
            navigation.navigate('PostEditNugget', {
              preContent: content,
            });
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
    fontSize: 16,
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
});
