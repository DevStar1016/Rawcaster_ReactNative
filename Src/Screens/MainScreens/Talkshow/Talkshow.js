import { Modal, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import { useNavigation } from '@react-navigation/native';
import { chimeSocketListen } from '../../../Services/ChimeSocket/ChimeSocket';
import { ChimeSocketEvents } from '../../../Services/ChimeSocket/ChimeSocketEvents';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import { useProfile } from '../../../Utilities/StoreData';
import {
  createMeetingRoom,
  joinMeetingRoom,
  joinRequest,
} from '../../../Services/ChimeSocket/ChimeSocketRequests';
import { COLORS } from '../../../Utilities/Colors';
import { EVENT_TYPE } from '../../../Utilities/Constants';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setTalkShowInviteRefId } from '../../../Store/Slices/MeetInviteRefIdSlice';

var isMount = true;
const Talkshow = ({ route }) => {
  const navigation = useNavigation();
  const profile = useProfile();
  const dispatch = useDispatch();
  const meet_invite_ref_id = useSelector((state) => state.meeting_invite_refId.talkshow_ref_id);

  const [eventDetails, seteventDetails] = useState(null);
  const [isLoading, setisLoading] = useState(false);


  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);


  ///////////// Referece ids of events from shared url handle here
  /////////////////////////////

  useEffect(() => {
    //const unsubscribe = navigation.addListener('focus', () => {
    console.log('refffff', meet_invite_ref_id);
    if (meet_invite_ref_id) {
      console.log('ref_id_received_in_talkshow', meet_invite_ref_id);
      postData(meet_invite_ref_id);
    }
    // });

    // return unsubscribe;

  }, [navigation, meet_invite_ref_id]);

  const postData = async (ref_id) => {
    try {
      const apiUrl = 'https://devapi.rawcaster.com/rawcaster/externaluserjoin';
      const dataToSend = {
        reference_id: ref_id,
        email_id: profile?.email_id,
        name: profile?.name
      };
      const response = await axios.post(apiUrl, dataToSend);
      console.log('response:', response.data);
      dispatch(setTalkShowInviteRefId(null));
      if (response.data.status === 1) {
        if (isMount) {
          seteventDetails(response.data.event);
          setisLoading(true);
        }
        onStartHosting(response.data.event);

      }
    } catch (error) {
      // Handle any errors
      console.error('share url join Error:', error);
    }
  };


  /////////////////////////////
  ////////////////////////////////

  // Meeting Room - Host Accept or Reject Join Request Response Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestAnswer,
      joinedData => {
        const meetingJoinedResult = joinedData?.joinInfo?.result;
        //const meetingJoinedResult = joinedData;

        console.log('join_answer side= ' + profile.user_id, joinedData);
        if (isMount) {
          setisLoading(false);
        }
        if (meetingJoinedResult) {
          navigation.navigate('TalkShowHostScreen', {
            meetingData: meetingJoinedResult.meeting,
            attendeeData: meetingJoinedResult.Attendee,
            usersList: joinedData.AttendeeList,
            // attendeeData: joinedData.AttendeeList,
            meetingSetting: joinedData.meetingSetting,
            eventDetails: eventDetails,
            eventType: EVENT_TYPE.talkshow,
          });
        } else {
          if (joinedData.allow === false || joinedData.statusCode === 'host_not_available') {
            Toast.fail(joinedData.msg ? joinedData.msg : joinedData.message);
          } else {
            Toast.fail(joinedData.msg ? joinedData.msg : joinedData.message);
          }
        }
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestAnswer);
    };
  }, [eventDetails, isMount]);

  /**
   * Checks if the current user is the owner of the event.
   * @param {Object} [eventItem=eventDetails] - The event item to check against.
   * @returns {boolean} - True if the current user is the owner of the event, false otherwise.
   */
  const getIsOwner = (eventItem = eventDetails) => {
    return profile?.user_id === eventItem?.original_user_id;
  };

  /**
   * Handles the logic for starting a hosting session for an event.
   * If the user is the owner of the event, it creates a meeting room with the given meeting ID.
   * If the user is not the owner, it joins the meeting room with the given meeting ID.
   * It also sends a join request to the meeting room with the user's information.
   * @param {eventItem} eventItem - The event item object.
   * @returns None
   */
  const onStartHosting = eventItem => {
    if (getIsOwner(eventItem)) {
      //  console.log('talkshow_started', eventItem);
      // createMeetingRoom({
      //   // meetingId: eventItem.chime_meeting_id,
      //   refId: eventItem.reference_id,
      // });
      joinMeetingRoom({
        refId: eventItem.reference_id,
      });

    } else {
      joinMeetingRoom({
        refId: eventItem.reference_id,
      });
    }
    //  console.log('profileee', profile);
    joinRequest({
      // meetingId: eventItem.chime_meeting_id,
      refId: eventItem.reference_id,
      userId: profile?.user_id,
      image: profile?.profile_image,
      name: profile?.name,
      userRefId: profile?.user_ref_id
    });
  };

  return (
    <>
      <EventTalkshowCommonScreen
        screenType="talkshow"
        onPressStartJoinEvent={eventItem => {
          if (isMount) {
            seteventDetails(eventItem);
            setisLoading(true);
          }
          onStartHosting(eventItem);
        }}
      />
      <Modal onRequestClose={() => { }} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </>
  );
};

export default Talkshow;

const styles = StyleSheet.create({});
