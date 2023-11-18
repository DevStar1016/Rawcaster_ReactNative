import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../../Utilities/Colors';
import DefaultBackground from '../../../Components/DefaultBackground';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import Clipboard from '@react-native-community/clipboard';
import {MEETING_URL} from '../../../Services/ServiceConstants';
import {
  dateToShortTextDate,
  eventDisplayDuration,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {useSettings, useToken} from '../../../Utilities/StoreData';
import Toast from '../../../Components/Toast';
import {EventDataProp} from './types';
import SVGIcon from '../../../Components/SVGIcon';
import {viewEventsService} from '../../../Services/ApiService';
import {DIMENSIONS} from '../../../Utilities/Constants';
import BOX_SHADOW from '../../../Utilities/BoxShadow';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';

const EventDetailScreen = ({route}: any) => {
  const {eventId} = route.params;
  const [eventDetail, seteventDetail] = useState<EventDataProp | null>(null);
  const [errormessage, seterrormessage] = useState<string>('');
  const [isLoading, setisLoading] = useState(true);
  const token = useToken();
  const userSettings = useSettings();

  /**
   * Generates the meeting URL based on the event details.
   * @returns {string} The meeting URL.
   */
  const getMeetingUrl = () => {
    return eventDetail
      ? MEETING_URL +
          `${eventDetail.type === 2 ? 'talkshow' : 'event'}/` +
          eventDetail.reference_id
      : '';
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
          seterrormessage(response.data.msg);
        }
      })
      .catch(error => {
        seterrormessage(error.message);
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  useEffect(() => {
    if (token && eventId) {
      getEventDetail();
    }
  }, [token, eventId]);

  return (
    <View style={styles.mainContainer}>
      <DefaultBackground
        isEnableRLogo={false}
        isEnableLoading={isLoading}
        bgColor={COLORS.primaryDark}
        centerText={isLoading ? 'Fetching Details' : errormessage}
      />
      {eventDetail && (
        <>
          <StyledText
            style={[
              styles.textLabel,
              {fontSize: 16, fontFamily: FONTS.DMSans.bold},
            ]}>
            {htmlDecodeText(eventDetail.event_name)}
          </StyledText>

          <StyledText style={styles.textLabel}>
            {dateToShortTextDate(
              //@ts-ignore
              eventDetail.start_date_time,
              //@ts-ignore
              userSettings.time_zone,
              true,
            )}
          </StyledText>

          <View style={styles.bannerImageContainer}>
            <Image
              source={{uri: eventDetail.banner_image}}
              style={styles.bannerImage}
            />
          </View>
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
          <View style={{marginTop: 10}}>
            <StyledText
              style={[
                styles.textLabel,
                {
                  fontSize: 16,
                  fontFamily: FONTS.DMSans.bold,
                  textAlign: 'center',
                },
              ]}>
              {` Maximum Participants : ${eventDetail.no_of_participants.toString()}`}
            </StyledText>
            <StyledText
              style={[
                styles.textLabel,
                {fontSize: 16, fontFamily: FONTS.DMSans.bold},
              ]}>
              {` Total Duration : ${eventDisplayDuration(
                eventDetail.duration,
              )}`}
            </StyledText>
          </View>
          <View style={styles.profileContainer}>
            <ProfileWithBadge
              profileImage={eventDetail.original_user_image}
              profileSize={40}
            />
            <StyledText
              style={[
                styles.textLabel,
                {
                  fontSize: 16,
                  fontFamily: FONTS.DMSans.bold,
                  marginHorizontal: 10,
                },
              ]}>
              {htmlDecodeText(eventDetail.original_user_name)}
            </StyledText>
          </View>
        </>
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
  bannerImageContainer: {
    height: '25%',
    width: DIMENSIONS.window.width - 40,
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: 'hidden',
    ...BOX_SHADOW,
  },
  bannerImage: {
    height: '100%',
    width: '100%',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
  },
  meetingLinkContainer: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    height: 50,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    borderRadius: 10,
  },
});

export default EventDetailScreen;
