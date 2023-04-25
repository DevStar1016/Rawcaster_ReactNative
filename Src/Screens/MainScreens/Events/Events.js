import {Modal, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import EventTalkshowCommonScreen from '../EventsAndTalkshowsCommon/EventTalkshowCommonList';
import {useNavigation} from '@react-navigation/native';
import StartEventHosting from '../../../Modals/StartEventHosting';
import {COLORS} from '../../../Utilities/Colors';

var isMount = true;
const Events = () => {
  const navigation = useNavigation();
  const [isOpenHostingScreen, setisOpenHostingScreen] = useState(false);
  const [startEventDetails, setstartEventDetails] = useState(null);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  return (
    <>
      <EventTalkshowCommonScreen
        screenType="event_and_live"
        onPressAddButton={() => {
          navigation.navigate('CreateEditEvent');
        }}
        onEditEvent={eventId => {
          navigation.navigate('CreateEditEvent', {
            eventId: eventId,
          });
        }}
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
            onStartHosting={() => {}}
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
