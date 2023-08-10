import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';
import {chimeSocketListen} from '../../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../../Services/ChimeSocket/ChimeSocketEvents';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import {useProfile} from '../../../Utilities/StoreData';
import {getChimeTestUserId} from '../../../Utilities/Methods';

var isMount = true;
const Talkshow = () => {
  // const navigation = useNavigation()
  // const profile = useProfile()
  // const [eventDetails, seteventDetails] = useState(null)
  // const [isLoading, setisLoading] = useState(false)

  // useEffect(() => {
  //   isMount = true

  //   return () => {
  //     isMount = false
  //   }
  // }, [])

  //  // Meeting Room - Host Accept or Reject Join Request Response Received here - Socket
  //  useEffect(() => {
  //   chimeSocketListen.on(
  //     ChimeSocketEvents.joinRequestAnswer,
  //     joinedData => {
  //       console.log(joinedData, 'Meeting JOINED DATATTATAA joinRequestAnswer');
  //       const meetingJoinedResult = joinedData?.result;
  //       if (isMount) {
  //         setisLoading(false);
  //       }
  //       if (meetingJoinedResult) {

  //         navigation.navigate('EventHostScreen', {
  //           meetingData: meetingJoinedResult.meeting,
  //           attendeeData: meetingJoinedResult.Attendee,
  //           eventDetails: eventDetails,
  //         });

  //       } else {
  //         if (joinedData.allow === false) {
  //           Toast.fail(joinedData.msg);
  //         }

  //       }
  //     },
  //     [],
  //   );
  //   return () => {
  //     chimeSocketListen.off(ChimeSocketEvents.joinRequestAnswer);
  //   };
  // }, []);

  // const getIsOwner = () => {
  //   return profile?.user_id === getChimeTestUserId(eventDetails?.original_user_id);
  // };

  // const onStartHosting = (eventData) => {
  //   if (isMount) {
  //     setisLoading(true);
  //   }
  //   if (eventData) {
  //     console.log(eventItem.chime_meeting_id, 'OWNERRRR');
  //     createMeetingRoom({
  //       meetingId: eventItem.chime_meeting_id,
  //     });
  //   } else {
  //     console.log(eventItem.chime_meeting_id, 'ATTENDEEEEE');
  //     joinMeetingRoom({
  //       meetingId: eventItem.chime_meeting_id,
  //     });
  //   }
  //   console.log(eventItem.chime_meeting_id, 'REQUESTTTTT');
  //   joinRequest({
  //     meetingId: eventItem.chime_meeting_id,
  //     userId: profile.user_id,
  //     user_img: profile.profile_image,
  //     user_name: profile.name,
  //   });
  // };

  return (
    <EventTalkshowCommonScreen
      screenType="talkshow"
      onPressStartJoinEvent={eventItem => {
        // seteventDetails(eventItem)
        // onStartHosting(eventItem)
      }}
    />
  );
};

export default Talkshow;

const styles = StyleSheet.create({});
