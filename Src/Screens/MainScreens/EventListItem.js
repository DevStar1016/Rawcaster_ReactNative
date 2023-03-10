import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import BOX_SHADOW from '../../Utilities/BoxShadow';
import EventImage from '../../Assets/Png/test_event.png';
import StyledText from '../../Components/StyledText';
import {FONTS} from '../../Utilities/Fonts';
import SVGIcon from '../../Components/SVGIcon';

const EventListItem = ({item}) => {
  return (
    <View style={styles.mainContainer}>
      <Image source={EventImage} resizeMode="cover" style={{height: 140}} />
      <View style={styles.contentContainer}>
        <View style={styles.titleButtonsContainer}>
          <View>
            <StyledText style={styles.titleText}>{item.event_name}</StyledText>
            <StyledText>Hosted by {item.original_user_name}</StyledText>
          </View>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.button} activeOpacity={0.7}>
              <SVGIcon icon="edit_black" height={20} width={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} activeOpacity={0.7}>
              <SVGIcon icon="delete_black" height={22} width={22} />
            </TouchableOpacity>
          </View>
        </View>
        <StyledText style={{paddingVertical: 5}}>{item.message}</StyledText>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <SVGIcon
              icon="calendar_black"
              marginRight={5}
              height={20}
              width={20}
            />
            <StyledText style={{paddingVertical: 5}}>20 Dec 2022</StyledText>
          </View>
          <View style={styles.dateTime}>
            <SVGIcon
              icon="clock_black"
              marginRight={5}
              height={20}
              width={20}
            />
            <StyledText style={{paddingVertical: 5}}>
              10:00 PM - (EST)
            </StyledText>
          </View>
        </View>
        <View style={styles.startButtonContainer}>
          <TouchableOpacity style={styles.startButton} activeOpacity={0.7}>
            <StyledText style={styles.startText}>Start Event</StyledText>
            <SVGIcon icon="right_arrow" height={15} width={15} marginLeft={5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default EventListItem;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: 'hidden',
    ...BOX_SHADOW,
  },
  contentContainer: {
    paddingHorizontal: 10,
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
});
