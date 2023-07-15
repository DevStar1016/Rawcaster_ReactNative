import {ActivityIndicator, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../../Components/HOCView';
import {COLORS} from '../../../../Utilities/Colors';
import {
  MobileSDKEvent,
  NativeFunction,
  getSDKEventEmitter,
} from '../../../../Native/Bridges/ChimeMeetingBridge';
import {useNavigation} from '@react-navigation/native';
import {useToken} from '../../../../Utilities/StoreData';
import MeetingUI from '../../../../Components/Meeting/MeetingUI';
import Toast from '../../../../Components/Toast';
import {deleteMeeting} from '../../../../Services/ApiService';

var isMount = true;
var onMeetingStartSubscription = undefined;
var onMeetingEndSubscription = undefined;
var onErrorSubscription = undefined;

const EventHostScreen = ({route}) => {
  const navigation = useNavigation();
  const {meetingData, attendeeData} = route.params ?? {};
  const token = useToken();
  const [attendeesList, setattendeesList] = useState([]);
  const [loaderData, setloaderData] = useState({
    status: true,
    text: 'Meeting being start',
  });
  const [isInMeeting, setisInMeeting] = useState(false);

  useEffect(() => {
    NativeFunction.startMeeting(meetingData, attendeeData);
    isMount = true;
    return () => {
      isMount = false;
    };
  }, []);

  useEffect(() => {
    onMeetingStartSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnMeetingStart,
      () => {
        console.log('MEETING START');
        if (isMount) {
          setisInMeeting(true);
          stopLoader();
        }
      },
    );

    onMeetingEndSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnMeetingEnd,
      () => {
        console.log('MEETING END');
        if (isMount) {
          setisInMeeting(false);
          stopLoader();
        }
        navigation.goBack();
      },
    );

    onErrorSubscription = getSDKEventEmitter().addListener(
      MobileSDKEvent.OnError,
      message => {
        console.log(message, 'MEETING ERROR');
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
        text: 'Meeting being end',
      });
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('meeting_id', meetingData.MeetingId);
    deleteMeeting(formData)
      .then(res => {
        if (res.data.status === 1) {
          NativeFunction.stopMeeting();
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
        title: 'Events',
        bgColor: COLORS.transparent,
        isTitleCenter: true,
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
          handleEndMeeting={handleEndMeeting}
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
