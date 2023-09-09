import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../../Utilities/Colors';
import DefaultBackground from '../../../Components/DefaultBackground';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import Clipboard from '@react-native-community/clipboard';
import {MEETING_URL} from '../../../Services/ServiceConstants';
import {dateToShortTextDate, htmlDecodeText} from '../../../Utilities/Methods';
import {useSettings, useToken} from '../../../Utilities/StoreData';
import Toast from '../../../Components/Toast';
import {EventDataProp} from './types';
import SVGIcon from '../../../Components/SVGIcon';
import {viewEventsService} from '../../../Services/ApiService';

const EventDetailScreen = ({route}: any) => {
  const {eventId} = route.params;
  const [eventDetail, seteventDetail] = useState<EventDataProp | null>(null);
  const [Errormessage, setErrormessage] = useState<string | null>(null);
  const token = useToken();
  const userSettings = useSettings();

  /**
   * Generates the meeting URL based on the event details.
   * @returns {string} The meeting URL.
   */
  const getMeetingUrl = () => {
    return (
      MEETING_URL +
      `${eventDetail?.type === 2 ? 'talkshow' : 'event'}/` +
      eventDetail?.reference_id
    );
  };

  /**
   * Copies the meeting URL to the clipboard and displays a success toast message.
   * @returns None
   */
  const handleCopyToClipboard = () => {
    Clipboard.setString(getMeetingUrl());
    Toast.success('Copied To Clipboard!');
  };

  const getEventDetail = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_id', eventId);
    viewEventsService(formData)
      .then(response => {
        if (response.data.status === 1) {
          const eventdetails = response.data.event_detail;
          seteventDetail(eventdetails);
        } else {
          setErrormessage(response.data.msg);
        }
      })
      .catch(error => {
        setErrormessage(error.message);
      });
  };

  useEffect(() => {
    if (token && eventId) {
      getEventDetail();
    }
  }, [token, eventId]);

  return (
    <View style={styles.mainContainer}>
      <DefaultBackground isEnableRLogo={false} bgColor={COLORS.primaryDark} />
      {eventDetail ? (
        <>
          <StyledText
            style={[
              styles.textLabel,
              {fontSize: 16, fontFamily: FONTS.DMSans.bold},
            ]}>
            {htmlDecodeText(eventDetail?.event_name)}
          </StyledText>

          <StyledText style={styles.textLabel}>
            {dateToShortTextDate(
              //@ts-ignore
              eventDetail?.start_date_time,
              userSettings?.time_zone,
              true,
            )}
          </StyledText>
          <View style={styles.meetingLinkContainer}>
            <View style={{flex: 1}}>
              <StyledText
                style={[styles.textLabel, {color: COLORS.primaryDark}]}>
                {getMeetingUrl()}
              </StyledText>
            </View>
            <SVGIcon
              icon="clipboard_copy_primary_dark"
              marginLeft={10}
              isButton
              onPress={handleCopyToClipboard}
            />
          </View>
        </>
      ) : (
        <StyledText
          style={[
            styles.textLabel,
            {fontSize: 16, fontFamily: FONTS.DMSans.bold},
          ]}>
          {Errormessage ? Errormessage : 'No Data Found'}
        </StyledText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  textLabel: {
    color: COLORS.white,
    marginVertical: 5,
  },
  backToHome: {
    marginTop: 20,
    height: 40,
    backgroundColor: '#F4C117',
    width: 150,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingLinkContainer: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    height: 50,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    borderRadius: 10,
  },
});

export default EventDetailScreen;
