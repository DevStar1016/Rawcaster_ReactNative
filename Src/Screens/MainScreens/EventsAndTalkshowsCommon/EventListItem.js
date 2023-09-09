import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../Utilities/Colors';
import BOX_SHADOW from '../../../Utilities/BoxShadow';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import SVGIcon from '../../../Components/SVGIcon';
import {EVENT_TYPE} from '../../../Utilities/Constants';
import {
  getSlicedText,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import {useProfile, useSettings} from '../../../Utilities/StoreData';
import {useNavigation} from '@react-navigation/native';

const EventListItem = ({
  item,
  isDarkTheme = false,
  onPressEdit,
  isFromGlobalSearch = false,
  onPressDelete,
  isEnableBorder = false,
  onPressStartJoinEvent,
}) => {
  const navigation = useNavigation();
  const profile = useProfile();
  const settings = useSettings();

  /**
   * Returns the background color based on the current theme.
   * @returns {string} The background color.
   */
  const getBgColor = () => {
    if (isDarkTheme) {
      return COLORS.whiteTransparent;
    }
    return COLORS.white;
  };

  /**
   * Returns the appropriate text color based on the current theme.
   * @returns {string} The color value for the text.
   */
  const getTextColor = () => {
    if (isDarkTheme) {
      return COLORS.white;
    }
    return COLORS.black;
  };

  /**
   * Returns the text representation of the event type based on the value of the 'type' property of the 'item' object.
   * @returns {string} The text representation of the event type.
   */
  const getEventTypeText = () => {
    if (item.type === EVENT_TYPE.event) {
      return 'Event';
    } else if (item.type === EVENT_TYPE.talkshow) {
      return 'Talkshow';
    } else if (item.type === EVENT_TYPE.live) {
      return 'Live';
    }
    return '';
  };

  /**
   * Checks if the current user is the owner of the item.
   * @returns {boolean} True if the current user is the owner, false otherwise.
   */
  const isOwner = () => {
    return item?.original_user_id === profile?.user_id;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('EventDetailScreen', {
          eventId: item.event_id,
        });
      }}
      style={[
        styles.mainContainer,
        {backgroundColor: getBgColor()},
        isEnableBorder && {borderWidth: 1, borderColor: COLORS.borderColor},
      ]}>
      <Image
        source={{uri: item.banner_image}}
        resizeMode="cover"
        style={{
          height: 140,
          borderRadius: 10,
        }}
      />
      {item.type === 2 && (
        <View style={styles.eventTypeBadgeContainer}>
          <SVGIcon icon="record_white" height={15} width={15} marginRight={5} />
          <StyledText style={styles.text}>{getEventTypeText()}</StyledText>
        </View>
      )}

      <View style={styles.contentContainer}>
        <View style={styles.titleButtonsContainer}>
          <View style={{flex: 1}}>
            <StyledText style={[styles.titleText, {color: getTextColor()}]}>
              {getSlicedText(htmlDecodeText(item.event_name), 150)}
            </StyledText>
            <StyledText style={{color: getTextColor()}}>
              Hosted by {htmlDecodeText(item.original_user_name)}
            </StyledText>
          </View>
          {isOwner() && !isFromGlobalSearch && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.7}
                onPress={onPressEdit}>
                <SVGIcon icon="edit_black" height={20} width={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.7}
                onPress={onPressDelete}>
                <SVGIcon icon="delete_black" height={22} width={22} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        {item.message ? (
          <StyledText style={{paddingVertical: 5, color: getTextColor()}}>
            {htmlDecodeText(item.message)}
          </StyledText>
        ) : null}
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <SVGIcon
              icon={isDarkTheme ? 'calendar_white' : 'calendar_black'}
              marginRight={5}
              height={20}
              width={20}
            />
            <StyledText style={{paddingVertical: 5, color: getTextColor()}}>
              {utcToUserTimezone(
                item.start_date_time,
                settings?.time_zone,
              ).format('DD-MMM-YYYY')}
              {/* { moment(item.start_date_time).format('DD-MMM-YYYY')} */}
            </StyledText>
          </View>
          <View style={styles.dateTime}>
            <SVGIcon
              icon={isDarkTheme ? 'clock_white' : 'clock_black'}
              marginRight={5}
              height={20}
              width={20}
            />
            <StyledText style={{paddingVertical: 5, color: getTextColor()}}>
              {utcToUserTimezone(
                item.start_date_time,
                settings?.time_zone,
              ).format('hh:mm A')}
              {/* {moment(item.start_date_time).format('hh:mm A')} */}
            </StyledText>
          </View>
        </View>
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.7}
            onPress={onPressStartJoinEvent}>
            <StyledText style={[styles.startText, {color: getTextColor()}]}>
              {`${isOwner() ? 'Start' : 'Join'} ${getEventTypeText()}`}
            </StyledText>
            <SVGIcon
              icon={isDarkTheme ? 'right_arrow_white' : 'right_arrow'}
              height={15}
              width={15}
              marginLeft={5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventListItem;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    // ...BOX_SHADOW,
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  text: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
  },
  titleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
    paddingVertical: 5,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    height: 35,
    width: 35,
    borderRadius: 35 / 2,
    marginLeft: 10,
    backgroundColor: COLORS.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
    ...BOX_SHADOW,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  dateTime: {
    flexDirection: 'row',
    paddingRight: 15,
    alignItems: 'center',
  },
  startButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  startButton: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  startText: {
    fontSize: 16,
    fontFamily: FONTS.DMSans.bold,
  },
  eventTypeBadgeContainer: {
    padding: 5,
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    left: 10,
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
});
