import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';
import {chimeSocketListen} from '../../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../../Services/ChimeSocket/ChimeSocketEvents';
import Toast from '../../../Components/Toast';
import Loader from '../../../Components/Loader';
import {useProfile} from '../../../Utilities/StoreData';
import {
  createMeetingRoom,
  joinMeetingRoom,
  joinRequest,
} from '../../../Services/ChimeSocket/ChimeSocketRequests';
import {COLORS} from '../../../Utilities/Colors';
import {EVENT_TYPE} from '../../../Utilities/Constants';

var isMount = true;
const Talkshow = () => {
  const navigation = useNavigation();
  const profile = useProfile();
  const [eventDetails, seteventDetails] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  // Meeting Room - Host Accept or Reject Join Request Response Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestAnswer,
      joinedData => {
        const meetingJoinedResult = joinedData?.result;
        if (isMount) {
          setisLoading(false);
        }
        if (meetingJoinedResult) {
          navigation.navigate('EventHostScreen', {
            meetingData: meetingJoinedResult.meeting,
            attendeeData: meetingJoinedResult.Attendee,
            eventDetails: eventDetails,
            eventType: EVENT_TYPE.talkshow,
          });
        } else {
          if (joinedData.allow === false) {
            Toast.fail(joinedData.msg);
          }
        }
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestAnswer);
    };
  }, [eventDetails]);

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
      createMeetingRoom({
        meetingId: eventItem.chime_meeting_id,
      });
    } else {
      joinMeetingRoom({
        meetingId: eventItem.chime_meeting_id,
      });
    }
    joinRequest({
      meetingId: eventItem.chime_meeting_id,
      userId: profile.user_id,
      user_img: profile.profile_image,
      user_name: profile.name,
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
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </>
  );
};

export default Talkshow;

const styles = StyleSheet.create({});
