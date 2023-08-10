import {ActivityIndicator, BackHandler, StyleSheet, View} from 'react-native';
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
import {deleteMeeting} from '../../../../Services/ApiService';
import {getChimeTestUserId, getSlicedText} from '../../../../Utilities/Methods';

var isMount = true;
var onMeetingStartSubscription = undefined;
var onMeetingEndSubscription = undefined;
var onErrorSubscription = undefined;

const EventHostScreen = ({route}) => {
  const navigation = useNavigation();
  const profile = useProfile();
  const {meetingData, attendeeData, eventDetails} = route.params ?? {};
  const token = useToken();
  const [loaderData, setloaderData] = useState({
    status: true,
    text: 'Meeting being started',
  });
  const [isInMeeting, setisInMeeting] = useState(false);
  useEffect(() => {
    Meeting.start(meetingData, attendeeData);
    isMount = true;
    return () => {
      Meeting.stop();
      isMount = false;
    };
  }, []);

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

  useEffect(() => {
    onMeetingStartSubscription = MeetingEmitter.addListener(
      MeetingEvent.onStart,
      () => {
        console.log('MEETING START');
        if (isMount) {
          setisInMeeting(true);
          stopLoader();
        }
      },
    );

    onMeetingEndSubscription = MeetingEmitter.addListener(
      MeetingEvent.onEnd,
      () => {
        if (isMount) {
          setisInMeeting(false);
          stopLoader();
        }
        Toast.success('Meeting has been end');
        navigation.goBack();
      },
    );

    onErrorSubscription = MeetingEmitter.addListener(
      MeetingEvent.onError,
      message => {
        if (isMount) {
          setisInMeeting(false);
          stopLoader();
        }
        if (message) {
          Toast.fail(message.toString());
          navigation.goBack();
        }
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
  }, []);

  const stopLoader = () => {
    if (isMount) {
      setloaderData({
        status: false,
        text: '',
      });
    }
  };

  const handleEndMeeting = () => {
    if (isMount) {
      setloaderData({
        status: true,
        text: 'Meeting being ended',
      });
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('meeting_id', meetingData.MeetingId);
    deleteMeeting(formData)
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

  return (
    <HOCView
      backHeaderProps={{
        title: getSlicedText(eventDetails?.event_name, 20),
        bgColor: COLORS.transparent,
        isTitleCenter: true,
        isEnableBackButton: false,
      }}
      isLoading={loaderData.status}
      loaderProps={{
        loaderText: loaderData.text,
      }}
      isEnableRLogo={false}
      isEnableDefaultBackground
      paddingHorizontal={0}>
      {isInMeeting && (
        <MeetingUI
          meetingId={meetingData.MeetingId}
          hostUserId={getChimeTestUserId(
            parseInt(eventDetails.original_user_id),
          )}
          selfUserId={profile.user_id}
          handleEndMeeting={() => {
            if (
              getChimeTestUserId(eventDetails.original_user_id) ===
              profile.user_id
            ) {
              handleEndMeeting();
            } else {
              Meeting.stop();
            }
          }}
          selfAttendeeId={attendeeData.AttendeeId}
        />
      )}
    </HOCView>
  );
};

export default EventHostScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
