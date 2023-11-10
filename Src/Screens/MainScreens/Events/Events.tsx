import {Modal, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import StartJoinEventWaitingRoom, {
  JoiningStatusProp,
  MeetingJoinedDataProp,
} from '../../../Modals/StartJoinEventWaitingRoom';
import {COLORS} from '../../../Utilities/Colors';
import {
  joinMeetingRoom,
  joinRequest,
} from '../../../Services/ChimeSocket/ChimeSocketRequests';
import {useProfile} from '../../../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';
import {EVENT_TYPE} from '../../../Utilities/Constants';
import Loader from '../../../Components/Loader';
import {chimeSocketListen} from '../../../Services/ChimeSocket/ChimeSocket';
import {ChimeSocketEvents} from '../../../Services/ChimeSocket/ChimeSocketEvents';
import Toast from '../../../Components/Toast';

var isMount: boolean = true;
var timer: any = undefined;
const Events = () => {
  const navigation = useNavigation();
  const profile: any = useProfile();
  const [isRequestingMeeting, setisRequestingMeeting] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [isOpenHostingScreen, setisOpenHostingScreen] = useState(false);
  const [startEventDetails, setstartEventDetails] = useState<any>(null);
  const [meetingJoiningStatus, setmeetingJoiningStatus] =
    useState<JoiningStatusProp>({
      text: '',
      statusCode: undefined,
    });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Meeting Room - Host Accept or Reject Join Request Response Received here - Socket
  useEffect(() => {
    /**
     * Listens for the join request answer event on the chime socket and handles the response.
     * @param {MeetingJoinedDataProp} joinedData - The data received from the join request answer event.
     * @returns None
     */
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestAnswer,
      (joinedData: MeetingJoinedDataProp) => {
        if (isMount) {
          if (isRequestingMeeting) {
            setisRequestingMeeting(false);
          }
          if (isLoading) {
            setisLoading(false);
          }
        }
        if (joinedData.statusCode === 1) {
          onCloseWaitingRoom();
          if (joinedData?.joinInfo?.result) {
            handleJoinMeeting(joinedData);
          } else {
            Toast.fail(joinedData?.joinInfo?.message ?? 'Something went wrong');
          }
        } else {
          if (isMount) {
            setmeetingJoiningStatus({
              text: joinedData.message,
              statusCode: joinedData.statusCode,
            });
          }
        }
      },
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestAnswer);
    };
  }, [isLoading, isRequestingMeeting]);

  /**
   * Handles the start hosting event for a meeting.
   * @param {any} eventItem - The event item object.
   * @returns None
   */
  const handleStartHosting = (eventItem: any) => {
    if (isMount && eventItem.waiting_room === 1) {
      setmeetingJoiningStatus({
        text: `Please wait for a moment ${
          eventItem.original_user_id !== profile.user_id
            ? 'while host approves your request'
            : ''
        }.`,
      });
      setisRequestingMeeting(true);
      if (eventItem.waiting_room !== 1) {
        handleMeetingRequestingTimeout();
      }
    }
    if (profile?.user_id !== eventItem.original_user_id) {
      joinMeetingRoom({
        refId: eventItem.reference_id,
      });
    }
    joinRequest({
      refId: eventItem.reference_id,
      userId: profile.user_id,
      image: profile.profile_image,
      name: profile.name,
    });
  };

  /**
   * Handles the action of joining a meeting.
   * @param {MeetingJoinedDataProp} meetingData - The data related to the meeting being joined.
   * @returns None
   */
  const handleJoinMeeting = (meetingData: MeetingJoinedDataProp) => {
    // @ts-ignore
    navigation.navigate('EventHostScreen', {
      meetingData: meetingData.joinInfo.result?.meeting,
      attendeeData: meetingData.joinInfo.result?.Attendee,
      eventDetails: startEventDetails,
      eventType: EVENT_TYPE.event,
      meetingSetting: meetingData.meetingSetting,
      requestsList: meetingData.joinRequests,
      usersList: meetingData.AttendeeList,
    });
  };

  /**
   * Handles the action of closing the waiting room.
   * If the component is mounted and the hosting screen is open,
   * it sets the meeting joining status to undefined and empty text,
   * and closes the hosting screen.
   * @returns None
   */
  const onCloseWaitingRoom = () => {
    if (isMount && isOpenHostingScreen) {
      setmeetingJoiningStatus({
        statusCode: undefined,
        text: '',
      });
      setisOpenHostingScreen(false);
    }
  };

  /**
   * Handles the timeout for requesting a meeting.
   * If the timeout is reached and the component is still mounted,
   * it will update the state variables isRequestingMeeting and isLoading to false.
   * @returns None
   */
  const handleMeetingRequestingTimeout = () => {
    timer = setTimeout(() => {
      if (isMount) {
        if (isRequestingMeeting) {
          setisRequestingMeeting(false);
        }
        if (isLoading) {
          setisLoading(false);
        }
        clearTimeout(timer);
      }
    }, 5000);
  };

  return (
    <>
      <EventTalkshowCommonScreen
        screenType="event_and_live"
        onPressStartJoinEvent={eventDetails => {
          if (isMount) {
            setstartEventDetails(eventDetails);
            if (eventDetails.waiting_room === 1) {
              setisOpenHostingScreen(true);
            } else {
              handleStartHosting(eventDetails);
              setisLoading(true);
              handleMeetingRequestingTimeout();
            }
          }
        }}
      />
      <Modal
        visible={isOpenHostingScreen}
        onRequestClose={() => {
          // if (isMount) {
          //   setisOpenHostingScreen(false);
          // }
        }}
        style={{backgroundColor: COLORS.white}}>
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
          <StartJoinEventWaitingRoom
            eventItem={startEventDetails}
            onStartHosting={handleStartHosting}
            onClose={onCloseWaitingRoom}
            meetingJoiningStatus={meetingJoiningStatus}
            isRequestingMeeting={isRequestingMeeting}
          />
        </SafeAreaView>
      </Modal>
      <Modal onRequestClose={() => {}} transparent visible={isLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </>
  );
};

export default Events;
