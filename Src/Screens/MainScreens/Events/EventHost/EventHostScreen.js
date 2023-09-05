import {BackHandler, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../../Components/HOCView';
import {COLORS} from '../../../../Utilities/Colors';
import {
  MeetingEvent,
  Meeting,
  MeetingEmitter,
} from '../../../../Native/Bridges/ChimeMeetingBridge';
import {useNavigation} from '@react-navigation/native';
import {useProfile, useToken} from '../../../../Utilities/StoreData';
import MeetingUI from '../../../../Components/Meeting/MeetingUI';
import Toast from '../../../../Components/Toast';
import {endMeeting} from '../../../../Services/ApiService';
import {getSlicedText} from '../../../../Utilities/Methods';
import {EVENT_TYPE} from '../../../../Utilities/Constants';
import {userLeft} from '../../../../Services/ChimeSocket/ChimeSocketRequests';

var isMount = true;
var onMeetingStartSubscription = undefined;
var onMeetingEndSubscription = undefined;
var onErrorSubscription = undefined;

const EventHostScreen = ({route}) => {
  const navigation = useNavigation();
  const profile = useProfile();

  const {
    meetingData,
    attendeeData,
    eventType,
    meetingSetting,
    requestsList,
    usersList,
  } = route.params ?? {};
  const token = useToken();
  const [loaderData, setloaderData] = useState({
    status: true,
    text: 'Meeting being started',
  });
  const [isInMeeting, setisInMeeting] = useState(false);
  const [isKicked, setisKicked] = useState(false);

  useEffect(() => {
    isMount = true;
    Meeting.start(meetingData, attendeeData);
    return () => {
      isMount = false;
    };
  }, []);

  // User will not be back with physical back actions. So that will restricted with this.
  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  // Chime Meeting SDK - Meeting Start, Stop and Error Listeners
  useEffect(() => {
    /**
     * Subscribe to the "onStart" event of the MeetingEmitter to perform actions when a meeting starts.
     * @param {function} callback - The callback function to be executed when the meeting starts.
     * @returns None
     */
    onMeetingStartSubscription = MeetingEmitter.addListener(
      MeetingEvent.onStart,
      () => {
        if (isMount) {
          setisInMeeting(true);
          stopLoader();
        }
      },
    );

    /**
     * Subscribe to the "onEnd" event emitted by the MeetingEmitter when a meeting ends.
     * Perform necessary actions such as updating the meeting status, stopping the loader,
     * notifying other users, displaying appropriate toast messages, and navigating back.
     * @returns None
     */
    onMeetingEndSubscription = MeetingEmitter.addListener(
      MeetingEvent.onEnd,
      () => {
        if (isMount) {
          setisInMeeting(false);
          stopLoader();
        }
        userLeft({
          user_id: profile.user_id,
          meetingId: meetingData.MeetingId,
          user_name: getSlicedText(profile.name, 18),
        });
        if (isKicked) {
          Toast.fail('You are removed from the meeting by host.');
        } else {
          Toast.success('Meeting has been ended');
        }
        navigation.goBack();
      },
    );

    /**
     * Subscribe to the onError event emitted by the MeetingEmitter.
     * When an error occurs during a meeting, this callback function will be executed.
     * It updates the isInMeeting state to false, stops the loader, displays an error toast message,
     * and navigates back to the previous screen.
     * @param {Function} message - The error message received from the MeetingEmitter.
     * @returns None
     */
    onErrorSubscription = MeetingEmitter.addListener(
      MeetingEvent.onError,
      message => {
        if (isMount) {
          setisInMeeting(false);
          stopLoader();
        }
        if (message) {
          Toast.fail(message.toString());
        }
        navigation.goBack();
      },
    );

    return () => {
      if (onMeetingEndSubscription) {
        onMeetingEndSubscription.remove();
      }
      if (onMeetingStartSubscription) {
        onMeetingStartSubscription.remove();
      }
      if (onErrorSubscription) {
        onErrorSubscription.remove();
      }
    };
  }, [isKicked]);

  const startLoader = (message = '') => {
    if (isMount) {
      setloaderData({
        status: true,
        text: message,
      });
    }
  };

  const stopLoader = () => {
    if (isMount) {
      setloaderData({
        status: false,
        text: '',
      });
    }
  };

  /**
   * Handles the process of ending a meeting.
   * @returns None
   */
  const handleEndMeeting = () => {
    startLoader('Meeting being ended');
    if (isMount) {
      setloaderData({
        status: true,
        text: 'Meeting being ended',
      });
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('meeting_id', meetingData.MeetingId);
    endMeeting(formData)
      .then(res => {
        if (res.data.status === 1) {
          Meeting.stop();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
          stopLoader();
        }
      })
      .catch(e => {
        Toast.fail(e.message);
        stopLoader();
      });
  };

  // If it is Talkshow then the header will be different. So this will return the header props according to the event type
  const talkshowHeaderProps = () => {
    if (eventType === EVENT_TYPE.talkshow) {
      return {
        rightButtonType: 'text',
        rightButtonText: 'Talkshow',
        rightTextButtonLeftIcon: 'record_white',
        isEnableRightIcon: true,
        rightTextButtonStyle: {
          flexDirection: 'row',
          alignItems: 'center',
        },
      };
    }
    return {
      isEnableRightIcon: true,
      rightIconSize: 23,
      rightIcon: 'switch_camera',
      onPressRightIcon: () => {
        Meeting.switchCamera();
      },
    };
  };

  return (
    <HOCView
      backHeaderProps={{
        title: getSlicedText(meetingSetting?.title, 20),
        bgColor: COLORS.transparent,
        isTitleCenter: true,
        isEnableBackButton: eventType === EVENT_TYPE.talkshow,
        backIcon: 'switch_camera',
        backIconSize: 23,
        backIconMarginLeft: 15,
        onPressBack: () => {
          Meeting.switchCamera();
        },
        ...talkshowHeaderProps(),
      }}
      isLoading={loaderData.status}
      loaderProps={{
        loaderText: loaderData.text,
      }}
      isEnableRLogo={false}
      isEnableDefaultBackground
      paddingHorizontal={0}>
      {isInMeeting && (
        // This is the Meeting UI If the Meeting Started then this component will be rendered
        <MeetingUI
          eventType={eventType}
          handleEndMeeting={isHost => {
            if (isHost) {
              handleEndMeeting();
            } else {
              Meeting.stop();
            }
          }}
          handleExitMeeting={isKicked => {
            if (isMount) {
              setisKicked(isKicked);
            }
            Meeting.stop();
          }}
          selfAttendeeId={attendeeData.AttendeeId}
          membersList={usersList}
          eventSettings={meetingSetting}
          requestsList={requestsList}
        />
      )}
    </HOCView>
  );
};

export default EventHostScreen;
