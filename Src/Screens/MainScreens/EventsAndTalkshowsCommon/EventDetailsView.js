import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {dateToShortTextDate, htmlDecodeText} from '../../../Utilities/Methods';
import Toast from '../../../Components/Toast';
import {MEETING_URL} from '../../../Services/ServiceConstants';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import {useSettings} from '../../../Utilities/StoreData';
import {FONTS} from '../../../Utilities/Fonts';
import DefaultBackground from '../../../Components/DefaultBackground';

const EventDetailsView = ({route}) => {
  const {eventDetail} = route.params;
  const navigation = useNavigation();
  const userSettings = useSettings();

  /**
   * Generates the meeting URL based on the event details.
   * @returns {string} The meeting URL.
   */
  const getMeetingUrl = () => {
    return (
      MEETING_URL +
      `${eventDetail.type === 2 ? 'talkshow' : 'event'}/` +
      eventDetail.reference_id
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

  return (
    <View style={styles.mainContainer}>
      <DefaultBackground isEnableRLogo={false} bgColor={COLORS.primaryDark} />
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <StyledText
          style={[
            styles.textLabel,
            {fontSize: 18, fontFamily: FONTS.DMSans.bold},
          ]}>
          Your event has been scheduled!
        </StyledText>

        <StyledText
          style={[
            styles.textLabel,
            {fontSize: 16, fontFamily: FONTS.DMSans.bold},
          ]}>
          {htmlDecodeText(eventDetail.event_name)}
        </StyledText>

        <StyledText style={styles.textLabel}>
          {dateToShortTextDate(
            eventDetail.start_date_time,
            userSettings?.time_zone,
            true,
          )}
        </StyledText>
        <View style={styles.meetingLinkContainer}>
          <View style={{flex: 1}}>
            <StyledText style={[styles.textLabel, {color: COLORS.primaryDark}]}>
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

        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backToHome}>
          <StyledText
            style={[
              styles.textLabel,
              {fontFamily: FONTS.DMSans.bold, color: COLORS.primaryDark},
            ]}>
            Back to home
          </StyledText>
        </TouchableOpacity>
      </View>
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

export default EventDetailsView;
