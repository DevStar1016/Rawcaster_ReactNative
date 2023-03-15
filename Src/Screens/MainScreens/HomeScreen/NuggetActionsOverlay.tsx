import {
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import Badges from '../../../Utilities/Badges';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import SubmitButton from '../../../Components/SubmitButton';

import {
  bigNumberFormater,
  dateToShortDate,
  getDoubleDigit,
  getSlicedText,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import {
  DIMENSIONS,
  IS_IOS,
  NUGGET_SHARE_TYPE,
} from '../../../Utilities/Constants';
import SVGIcon from '../../../Components/SVGIcon';
import {IconType} from '../../../Utilities/Icons';
import {
  useInsets,
  useSettings,
  useToken,
  useUserData,
} from '../../../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {useDispatch} from 'react-redux';
import {
  setIsOpenLoginAlert,
  setIsOpenVerifyPopup,
} from '../../../Store/Slices/UtilitySlice';
import Hyperlink from 'react-native-hyperlink';
import {
  likeAndUnlikeNuggetService,
  saveAndUnsaveNuggetService,
  pollVoteService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import lodash from 'lodash';
import AnimatedBgFillContainer from '../../../Components/AnimatedBgFillContainer';
import moment from 'moment';

type Props = {
  nuggetType: 'video' | 'image' | 'audio' | 'other';
  nugget: any;
  isLiked: boolean;
  onPressLike?: () => void;
  isSaved: boolean;
  isPaused: boolean;
  isEnableADDButton?: boolean;
  isMuted: boolean;
  isEnableTopInsetsPadding?: boolean;
  textNuggetNumberOfLines?: number;
  headerContainerHeight: number;
  onPressSave?: () => void;
  setisMuted?: (value: boolean) => void;
  onPressMuteUnmute?: () => void;
  onPlayPauseVideo?: () => void;
};
type ActionContainerProps = {
  icon: IconType;
  isMustLogin?: boolean;
  text?: string;
  onPress?: () => void;
};

type NuggetDetailsProps = {
  value: any;
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

const NuggetActionsOverlay = ({
  nugget,
  nuggetType,
  isLiked,
  onPressLike,
  isSaved,
  onPressSave,
  isPaused,
  isEnableTopInsetsPadding,
  isMuted,
  setisMuted,
  textNuggetNumberOfLines,
  headerContainerHeight,
  isEnableADDButton = true,
  onPressMuteUnmute,
  onPlayPauseVideo,
}: Props) => {
  const navigation = useNavigation();
  const token = useToken();
  const user = useUserData();
  const settings = useSettings();
  const dispatch = useDispatch();
  const insets = useInsets();
  const [profileDataContainerHeight, setprofileDataContainerHeight] =
    useState(0);

  const [pollVotedData, setpollVotedData] = useState<PollVotedDataProp>({
    isVoted: nugget.voted ? parseInt(nugget.voted) === 1 : false,
    votedOptionID: null,
  });

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
          setpollVotedData({isVoted: false, votedOptionID: null});

          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        setpollVotedData({isVoted: false, votedOptionID: null});
        Toast.fail(e.message);
      });
  };

  const likeAndUnlikeNuggetApiCall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('like', isLiked ? 2 : 1);
    likeAndUnlikeNuggetService(formData)
      .then(res => {
        if (res.data.status === 1 && onPressLike) {
          onPressLike();
        }
        // else if (res.data.status === 0) {
        //   Toast.fail(res.data.msg);
        // }
      })
      .catch(e => {
        console.log(e, 'ERROR LIKE AND UNLIKE NUGGET API');
      });
  };

  const saveAndUnsaveNuggetApiCall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('nugget_id', nugget.nugget_id);
    formData.append('save', isSaved ? 2 : 1);
    saveAndUnsaveNuggetService(formData)
      .then(res => {
        if (res.data.status === 1 && onPressSave) {
          onPressSave();
        }
        // else if (res.data.status === 0) {
        //   Toast.fail(res.data.msg);
        // }
      })
      .catch(e => {
        console.log(e, 'ERROR SAVE AND UNSAVE NUGGET API');
      });
  };

  const debounceOnLike = useCallback(
    lodash.debounce(likeAndUnlikeNuggetApiCall, 300),
    [isLiked],
  );

  const debounceOnSave = useCallback(
    lodash.debounce(saveAndUnsaveNuggetApiCall, 300),
    [isSaved],
  );

  const getRemainingTimeOfPoll = (duration: string) => {
    const [days, hours, minutes] = duration.split(':').map(Number);
    const createdAt = new Date(nugget.created_date);
    const now: any = new Date();
    const endDate: any = new Date(
      createdAt.getTime() +
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000,
    );
    const remaining = endDate - now;
    let remainingDays: any = Math.floor(remaining / (24 * 60 * 60 * 1000));
    let remainingHours: any = Math.floor(
      (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
    );
    let remainingMinutes: any = Math.floor(
      (remaining % (60 * 60 * 1000)) / (60 * 1000),
    );

    if (remainingDays <= 0) {
      remainingDays = null;
    }
    if (remainingHours <= 0) {
      remainingHours = null;
    }
    if (remainingMinutes <= 0) {
      remainingMinutes = null;
    }

    let result = '';
    if (remainingDays !== null) {
      result += `${remainingDays} days`;
    }
    if (remainingHours !== null) {
      result += ` ${remainingHours.toString()} hours`;
    }
    if (remainingMinutes !== null) {
      result += ` ${remainingMinutes.toString()} min`;
    }
    if (result) {
      result += ' left';
    }
    return result;
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

  const ActionIconContainer = ({
    icon,
    text = '',
    onPress = () => {},
    isMustLogin = true,
  }: ActionContainerProps) => {
    return (
      <View style={{alignItems: 'center', paddingTop: 5}}>
        <SVGIcon
          icon={icon}
          isButton
          onPress={() => {
            if (isMustLogin) {
              if (!token) {
                dispatch(setIsOpenLoginAlert(true));
                return;
              } else if (token && user && user?.acc_verify_status === 0) {
                dispatch(setIsOpenVerifyPopup(true));
                return;
              }
            }
            onPress();
          }}
        />

        <StyledText style={styles.actionButtonText}>
          {text ? text : ''}
        </StyledText>
      </View>
    );
  };

  const Dot = () => {
    return <View style={styles.dotContainer} />;
  };

  const MediaControllers = () => {
    return isPaused ? (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPlayPauseVideo}
        style={styles.playPauseButton}>
        <SVGIcon icon="play_white" height={20} width={20} marginLeft={5} />
      </TouchableOpacity>
    ) : null;
  };

  const UserNuggetDetail = ({value}: NuggetDetailsProps) => {
    return <StyledText style={styles.userDetailsText}>{value}</StyledText>;
  };

  const PollData = () => {
    return (
      <View style={{paddingRight: 20}}>
        {getPollOptions().map((item: PollOptionsItemProp) => {
          return pollVotedData.isVoted ? (
            <AnimatedBgFillContainer
              key={item.option_id.toString()}
              percentage={item.option_percentage}
              name={item.option_name}
              mainContainerStyle={{marginTop: 10}}
            />
          ) : (
            <SubmitButton
              key={item.option_id.toString()}
              buttonText={item.option_name}
              marginTop={10}
              isDisabled={pollVotedData.isVoted}
              onPress={() => {
                setpollVotedData({
                  isVoted: true,
                  votedOptionID: item.option_id,
                });
                pollVotingAPICall(item.option_id);
              }}
            />
          );
        })}

        <StyledText style={{color: COLORS.white, paddingTop: 10}}>
          {`${getTotalVotes()} votes . ${getRemainingTimeOfPoll(
            nugget.poll_duration,
          )}`}
        </StyledText>
      </View>
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
          // colors={['red', 'red']}
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
          // colors={['red', 'blue']}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}
          style={[styles.linearGradient, {paddingBottom: 80}]}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 85,
          left: 0,
          right: 0,
          paddingHorizontal: 10,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <View
            onLayout={e => {
              setprofileDataContainerHeight(e.nativeEvent.layout.height);
            }}>
            <ProfileWithBadge
              badge={Badges(nugget.user_status_id)}
              profileImage={nugget.user_image}
              isEnableGradient={false}
              profileSize={45}
              badgeSize={18}
              badgeContainerStyle={{right: 7}}
              containerStyle={{alignItems: 'flex-start'}}
            />
            <View style={styles.userDetailsContainer}>
              <StyledText style={styles.nameText}>
                {getSlicedText(
                  htmlDecodeText(nugget.user_name),
                  token ? 15 : 30,
                )}
              </StyledText>
              {token ? (
                <SubmitButton
                  buttonText="Become a Fan"
                  marginTop={0}
                  paddingVertical={0}
                  padding={0}
                  marginHorizontal={10}
                  paddingHorizontal={2}
                  buttonTextStyle={{fontSize: 10}}
                />
              ) : null}
            </View>
            <View style={[styles.userDetailsContainer, {paddingVertical: 5}]}>
              <UserNuggetDetail value={dateToShortDate(nugget.created_date)} />
              <Dot />
              <UserNuggetDetail value={`${nugget.total_views} Views`} />
              <Dot />
              <UserNuggetDetail value={getNuggetType()} />
              <Dot />
              <UserNuggetDetail value={`${nugget.follow_count} Fans`} />
            </View>
          </View>
          {nugget.content ? (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                paddingRight: 15,
                maxHeight:
                  nugget.media_list.length > 0
                    ? 200
                    : DIMENSIONS.window.height -
                      (headerContainerHeight +
                        85 /*85 is Bottom Tab Bar Height*/ +
                        profileDataContainerHeight +
                        (insets.top ? insets.top : StatusBar.currentHeight)),
              }}>
              <ScrollView
                contentContainerStyle={{flexGrow: 1}}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
                bounces={false}>
                <StyledText
                  textMode="read_more_hyper_link"
                  numberOfLines={
                    nugget.media_list.length > 0
                      ? 5
                      : textNuggetNumberOfLines ?? 15
                  }
                  style={{
                    color: COLORS.white,
                    fontSize: 15.5,
                    opacity: 0.8,
                  }}>
                  {htmlDecodeText(nugget.content)}
                </StyledText>
              </ScrollView>
            </TouchableOpacity>
          ) : null}
          {nugget.poll_option && nugget.poll_option.length > 0 && <PollData />}
        </View>
        <View style={{alignItems: 'center'}}>
          {token && isEnableADDButton ? (
            <RoundedPlusButton
              onPress={() => {
                if (token && user && user?.acc_verify_status === 0) {
                  dispatch(setIsOpenVerifyPopup(true));
                } else {
                  navigation.navigate('PostNugget');
                }
              }}
              style={{marginBottom: 20}}
            />
          ) : null}
          <ActionIconContainer
            icon={isLiked ? 'heart_pink' : 'heart_white'}
            text={bigNumberFormater(nugget.total_likes)}
            onPress={debounceOnLike}
          />
          <ActionIconContainer
            icon="comment"
            text={bigNumberFormater(nugget.total_comments)}
          />
          <ActionIconContainer icon="share" text="726" isMustLogin={false} />
          <ActionIconContainer
            icon={isSaved ? 'save_pink' : 'save_white'}
            onPress={debounceOnSave}
          />
        </View>
      </View>

      {(nuggetType === 'video' || nuggetType === 'audio') && (
        <MediaControllers />
      )}
      {(nuggetType === 'video' || nuggetType === 'audio') && (
        <TouchableOpacity
          style={[
            styles.muteButton,
            {
              top:
                headerContainerHeight +
                10 +
                (isEnableTopInsetsPadding
                  ? insets.top
                    ? insets.top
                    : StatusBar.currentHeight
                  : 0),
            },
          ]}
          activeOpacity={0.7}
          onPress={() => {
            if (setisMuted) {
              setisMuted(!isMuted);
            }
          }}>
          <SVGIcon
            icon={isMuted ? 'mute_white' : 'speaker_white'}
            height={20}
            width={20}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

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
    backgroundColor: 'red',
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
  muteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.transparentDimColor,
    height: 40,
    width: 40,
    borderRadius: 40 / 2,
    position: 'absolute',
    right: 10,
  },
});
