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
} from '../../../Utilities/Methods';
import PollDataDisplay from '../../../Components/PollDataDisplay';

type Props = {
  item: any;
};

const NotificationItem = ({item}: Props) => {
  return (
    <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
      <View style={styles.itemLeftContainer}>
        <ProfileWithBadge
          profileImage={item.userImage}
          profileSize={40}
          padding={0}
          extraMargin={0}
        />
        <View style={styles.titleContentContainer}>
          <StyledText style={styles.nameText}>
            {getSlicedText(item.userName, 25)}
          </StyledText>
          <StyledText style={styles.subText}>
            {getNotificationMessage(item.type)}
          </StyledText>
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
      <View
        style={{
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
        <StyledText style={styles.subText}>
          {dateToShortDate(item.created_datetime)}
        </StyledText>
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
  itemLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  titleContentContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
  },
  subText: {
    color: COLORS.placeHolderColor,
  },
});
