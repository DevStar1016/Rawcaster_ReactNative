import {Modal, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import StartEventHosting from '../../../Modals/StartJoinEventWaitingRoom';
import {COLORS} from '../../../Utilities/Colors';

var isMount = true;
const Events = () => {
  const [isOpenHostingScreen, setisOpenHostingScreen] = useState(false);
  const [startEventDetails, setstartEventDetails] = useState(null);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const handleJoinMeeting = () => {};

  return (
    <>
      <EventTalkshowCommonScreen
        screenType="event_and_live"
        onPressStartJoinEvent={eventDetails => {
          if (isMount) {
            setstartEventDetails(eventDetails);
            setisOpenHostingScreen(true);
          }
        }}
      />
      <Modal
        visible={isOpenHostingScreen}
        onRequestClose={() => {
          if (isMount) {
            setisOpenHostingScreen(false);
          }
        }}
        style={{backgroundColor: COLORS.white}}>
        <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
          <StartEventHosting
            eventItem={startEventDetails}
            onStartHosting={() => {
              if (isMount) {
                setisOpenHostingScreen(false);
              }
            }}
            onClose={() => {
              if (isMount) {
                setisOpenHostingScreen(false);
              }
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default Events;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
