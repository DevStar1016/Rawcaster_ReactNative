import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Video, {OnLoadData, OnProgressData} from 'react-native-video';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import {FONTS} from '../Utilities/Fonts';
import {COLORS} from '../Utilities/Colors';
import SubmitButton from '../Components/SubmitButton';
import AudioPlayingGif from '../Assets/Gif/audio_playing.gif';
import LoaderGif from '../Assets/Gif/loader.gif';
import AudioStopedImage from '../Assets/Jpeg/audio_stoped.jpeg';
import {Slider} from '@miblanchard/react-native-slider';
import {useProfile} from '../Utilities/StoreData';
import {
  JoinRequestStatusCodes,
  UserDataProp,
} from '../Services/ChimeSocket/ChimeSocketPropTypes';
import {JOIN_REQUEST_STATUS_CODE} from '../Services/ChimeSocket/ChimeSocketEvents';
import {MeetingSettingProp} from '../Components/Meeting/MeetingUI';

export type JoiningStatusProp = {
  text?: string;
  statusCode?: number | JoinRequestStatusCodes;
};

type MeetingDetailsProp = {
  Attendee: any;
  meeting: any;
};

type JoinInfoProp = {
  result?: MeetingDetailsProp;
  message: string;
};

export type MeetingJoinedDataProp = {
  joinInfo: JoinInfoProp;
  meetingSetting: MeetingSettingProp;
  joinRequests: any[];
  AttendeeList: UserDataProp[];
  message?: string; // if meeting join error - message
  statusCode?: number | JoinRequestStatusCodes;
};

type Props = {
  onClose: () => void;
  eventItem: any;
  isRequestingMeeting: boolean;
  meetingJoiningStatus: JoiningStatusProp;
  onStartHosting: (eventItem: any) => void;
};

var isMount = true;
const StartJoinEventWaitingRoom = ({
  onClose,
  eventItem,
  onStartHosting,
  meetingJoiningStatus,
  isRequestingMeeting = false,
}: Props) => {
  const profile = useProfile();
  const videoPlayer = useRef<Video>(null);
  const [paused, setpaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setduration] = useState(0);
  const [isLoadingMedia, setisLoadingMedia] = useState(true);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Callback function that is triggered when an error occurs while playing a video.
   * @returns None
   */
  function onVideoError() {}

  /**
   * Converts a duration in milliseconds to a formatted string in the format "mm:ss".
   * @param {number} tempDuration - The duration in milliseconds.
   * @returns {string} - The formatted duration string.
   */
  const getDurationFormat = (tempDuration: number) => {
    let time = tempDuration / 1000;
    let minutes = Math.floor(time / 60);
    let timeForSeconds = time - minutes * 60;
    let seconds = Math.floor(timeForSeconds);
    let secondsReadable = seconds > 9 ? seconds : `0${seconds}`;
    return `${minutes}:${secondsReadable}`;
  };

  /**
   * Updates the playback status based on the provided OnProgressData object.
   * @param {OnProgressData} playbackStatus - The playback status data.
   * @returns None
   */
  const playBackStatusUpdate = (playbackStatus: OnProgressData) => {
    try {
      let currentTime = Math.round(playbackStatus.currentTime);
      let duration = Math.round(playbackStatus.seekableDuration);
      if (currentTime)
        if (duration) setProgress((currentTime / duration) * 100);
    } catch (error) {}
  };

  /**
   * Callback function that is triggered when the loading of data is complete.
   * It sets the duration of the event in milliseconds.
   * @param {OnLoadData} event - The event object containing the loaded data.
   * @returns None
   */
  const onLoadComplete = (event: OnLoadData) => {
    try {
      setduration(event.duration * 1000);
    } catch (error) {}
  };

  /**
   * A callback function that seeks the video player to the specified seek time.
   * @param {number} seekTime - The time to seek to, in milliseconds.
   * @returns None
   */
  const seekUpdate = useCallback(
    async (seekTime: number) => {
      try {
        if (videoPlayer.current)
          videoPlayer.current.seek((seekTime * duration) / 100 / 1000);
      } catch (error) {}
    },
    [duration],
  );

  /**
   * Checks if the current user is the owner of the event item.
   * @returns {boolean} - true if the current user is the owner, false otherwise.
   */
  const getIsOwner = () => {
    return profile?.user_id === eventItem.original_user_id;
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
            onSlidingComplete={data => seekUpdate(data[0])}
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

  function renderMedia() {
    if (eventItem?.melodies?.type === 1) {
      return (
        <Image
          source={{uri: eventItem.melodies.path}}
          resizeMode="cover"
          style={{flex: 1}}
          onLoadEnd={() => {
            if (isMount) {
              setisLoadingMedia(false);
            }
          }}
        />
      );
    } else if (
      eventItem?.melodies?.type === 2 ||
      eventItem?.melodies?.type === 3
    ) {
      return (
        <>
          <Video
            ref={videoPlayer}
            source={{
              uri: eventItem.melodies.path,
            }}
            ignoreSilentSwitch={'ignore'}
            style={{
              display: eventItem?.melodies?.type === 3 ? 'none' : 'flex',
              width: '100%',
              height: '100%',
            }}
            resizeMode="contain"
            onError={onVideoError}
            playInBackground={false}
            playWhenInactive={false}
            progressUpdateInterval={100}
            useTextureView={true}
            paused={paused}
            repeat={false}
            onBuffer={() => {}}
            onLoad={event => {
              if (isMount) {
                if (videoPlayer.current) {
                  videoPlayer.current.seek(0);
                }
                setisLoadingMedia(false);
                onLoadComplete(event);
              }
            }}
            onProgress={playBackStatusUpdate}
            onEnd={() => {
              setProgress(0);
              if (videoPlayer.current) {
                videoPlayer.current.seek(0);
              }
              setpaused(true);
            }}
          />
          {eventItem?.melodies?.type === 3 && (
            <Image
              source={paused ? AudioStopedImage : AudioPlayingGif}
              resizeMode="cover"
              style={{width: '98%'}}
              onLoadEnd={() => {
                if (isMount) {
                  setisLoadingMedia(false);
                }
              }}
            />
          )}
        </>
      );
    }
    return false;
  }

  function renderMediaControllers() {
    return (
      <View style={styles.controllersCotainer}>
        <View style={{height: '20%'}}></View>
        <TouchableOpacity
          style={styles.playPauseButtonContainer}
          activeOpacity={0.8}
          onPress={() => {
            if (isMount) {
              setpaused(pre => !pre);
            }
          }}>
          {paused && (
            <View style={styles.playPauseButton}>
              <SVGIcon
                icon="play_fill_primary"
                height={20}
                width={20}
                marginLeft={5}
              />
            </View>
          )}
        </TouchableOpacity>
        {eventItem?.melodies?.type === 2 && (
          <View style={styles.videoControllerContainer}>{getSlider}</View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
          <SVGIcon icon="close" />
        </TouchableOpacity>
      </View>
      <View style={styles.titleMessageContainer}>
        <StyledText style={styles.titleText}>
          {eventItem?.event_name}
        </StyledText>
        {eventItem?.message ? (
          <StyledText style={styles.messageText}>
            {eventItem?.message}
          </StyledText>
        ) : (
          false
        )}
      </View>
      <View style={styles.mediaContainer}>
        {renderMedia()}
        {isLoadingMedia ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          (eventItem?.melodies?.type === 2 ||
            eventItem?.melodies?.type === 3) &&
          renderMediaControllers()
        )}
      </View>
      {meetingJoiningStatus.text ? (
        <View style={styles.statusTextContainer}>
          <StyledText style={styles.statusText}>
            {meetingJoiningStatus.text}
          </StyledText>
        </View>
      ) : null}
      {isRequestingMeeting ? (
        <Image
          source={LoaderGif}
          resizeMode="contain"
          style={{width: '80%', height: 50, alignSelf: 'center'}}
        />
      ) : meetingJoiningStatus.statusCode ===
        JOIN_REQUEST_STATUS_CODE.host_not_available ? (
        <View style={styles.rowButtonsContainer}>
          <SubmitButton
            buttonText={'Try Again'}
            bgColor={COLORS.white}
            borderColor={COLORS.primary}
            marginHorizontal={10}
            borderWidth={1}
            textColor={COLORS.primary}
            buttonWidth={'30%'}
            padding={5}
            onPress={() => {
              onStartHosting(eventItem);
            }}
          />
          <SubmitButton
            buttonText={'Cancel'}
            bgColor={COLORS.white}
            borderColor={COLORS.primary}
            marginHorizontal={10}
            borderWidth={1}
            textColor={COLORS.primary}
            buttonWidth={'30%'}
            padding={5}
            onPress={onClose}
          />
        </View>
      ) : (
        <SubmitButton
          buttonText={
            meetingJoiningStatus.text
              ? 'CLOSE'
              : getIsOwner()
              ? 'START HOSTING'
              : 'JOIN MEETING'
          }
          bgColor={COLORS.white}
          borderColor={COLORS.primary}
          marginHorizontal={10}
          borderWidth={1}
          textColor={COLORS.primary}
          onPress={() => {
            if (meetingJoiningStatus.text) {
              onClose();
            } else {
              onStartHosting(eventItem);
            }
          }}
        />
      )}
    </View>
  );
};

export default StartJoinEventWaitingRoom;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  titleMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  titleText: {
    fontSize: 18,
    fontFamily: FONTS.DMSans.bold,
    color: COLORS.primary,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.secondary,
    paddingTop: 10,
  },
  mediaContainer: {
    height: 250,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controllersCotainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  playPauseButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.white,
    shadowColor: '#18AEDB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 9,

    elevation: 9,
  },
  videoControllerContainer: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statusText: {
    fontFamily: FONTS.DMSans.bold,
    textAlign: 'center',
    fontSize: 15,
  },
  rowButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
