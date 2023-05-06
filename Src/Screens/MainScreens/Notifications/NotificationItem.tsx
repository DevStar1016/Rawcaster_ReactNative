import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import {
  dateToShortDate,
  getNotificationMessage,
  getSlicedText,
  utcToUserTimezone,
  utctoUserTimezonewithAbbr,
} from '../../../Utilities/Methods';
import PollDataDisplay from '../../../Components/PollDataDisplay';
import SVGIcon from '../../../Components/SVGIcon';
import {useSettings} from '../../../Utilities/StoreData';
import RoundedIconButton from '../../../Components/RoundedIconButton';

type Props = {
  item: any;
};

const NotificationItem = ({item}: Props) => {
  const settings = useSettings();
  return (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <ProfileWithBadge
        profileImage={item.userImage}
        profileSize={40}
        padding={0}
        extraMargin={0}
      />
      <View style={styles.itemRightContainer}>
        <View style={styles.titleShortTimeContainer}>
          <View style={{flex: 1, paddingRight: 5}}>
            <StyledText style={styles.nameText}>
              {getSlicedText(item.userName, 25)}
            </StyledText>
          </View>

          <StyledText style={[styles.subText, {paddingTop: 0}]}>
            {dateToShortDate(item.created_datetime)}
          </StyledText>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.messageActionButtonsContainer}>
            <View style={{flex: 1}}>
              <StyledText style={styles.subText}>
                {getNotificationMessage(item.type)}
              </StyledText>
            </View>
            {item.type &&
              parseInt(item.type) === 11 &&
              parseInt(item.friend_request_status) === 0 && (
                <View style={styles.buttonsContainer}>
                  <RoundedIconButton
                    buttonSize={23}
                    bgColor={COLORS.green}
                    icon="tick"
                    iconSize={16}
                  />
                  <RoundedIconButton
                    buttonSize={23}
                    bgColor={COLORS.white}
                    icon="close_black"
                    iconSize={18}
                    buttonStyle={{marginLeft: 10}}
                  />
                </View>
              )}
          </View>
          {item.content ? (
            <StyledText
              style={[styles.subText, {opacity: 1}]}
              normalTextModeTextProps={{numberOfLines: 2}}>
              {item.content}
            </StyledText>
          ) : (
            false
          )}
          {item.event_start_time ? (
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTime}>
                <SVGIcon
                  icon={'calendar_white'}
                  marginRight={5}
                  height={20}
                  width={20}
                />
                <StyledText style={styles.subText}>
                  {utcToUserTimezone(
                    item.event_start_time,
                    settings?.time_zone,
                  ).format('DD MMM YYYY')}
                </StyledText>
              </View>
              <View style={styles.dateTime}>
                <SVGIcon
                  icon={'clock_white'}
                  marginRight={5}
                  height={20}
                  width={20}
                />
                <StyledText style={styles.subText}>
                  {`${utcToUserTimezone(
                    item.event_start_time,
                    settings?.time_zone,
                  ).format('hh:mm A')} ${utctoUserTimezonewithAbbr(
                    item.event_start_time,
                    settings?.time_zone,
                  )}`}
                </StyledText>
              </View>
            </View>
          ) : (
            false
          )}

          {item.poll_option && item.poll_option.length > 0 ? (
            <PollDataDisplay
              createdDate={item.created_datetime}
              isVoted={true}
              pollDuration={'0:0:0'}
              nameMaxCharactersCount={13}
              pollOptions={item.poll_option}
              totalVotes={parseInt(item.total_vote)}
            />
          ) : (
            false
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  itemRightContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  titleShortTimeContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
  },

  messageActionButtonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    alignItems: 'flex-start',
  },

  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  subText: {
    color: COLORS.white,
    paddingTop: 5,
    opacity: 0.7,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    paddingTop: 10,
  },
  dateTime: {
    flexDirection: 'row',
    paddingRight: 15,
    alignItems: 'center',
  },
});
