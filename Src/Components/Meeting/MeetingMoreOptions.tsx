import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import SVGIcon from '../SVGIcon';
import StyledText from '../StyledText';
import {FONTS} from '../../Utilities/Fonts';
import {IconType} from '../../Utilities/Icons';

export type MEETING_MENU_IDS = 'in_call_message' | 'exit_meeting';
type OptionsProp = {
  id: MEETING_MENU_IDS;
  buttonText: string;
  icon: IconType;
};

type Props = {
  onPress: (buttonId: MEETING_MENU_IDS) => void;
};

const MENU_OPTIONS: OptionsProp[] = [
  {
    id: 'in_call_message',
    buttonText: 'In-call messages',
    icon: 'chat_white',
  },
  {
    id: 'exit_meeting',
    buttonText: 'Exit Meeting',
    icon: 'exit_white',
  },
];

const MeetingMoreOptions = ({onPress}: Props) => {
  return (
    <View style={styles.mainContainer}>
      {MENU_OPTIONS.map((item: OptionsProp) => {
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.buttonContainer}
            activeOpacity={0.7}
            onPress={() => {
              onPress(item.id);
            }}>
            <SVGIcon icon={item.icon} marginBottom={5} />
            <StyledText style={styles.buttonText}>{item.buttonText}</StyledText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MeetingMoreOptions;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.transparentDimColor,
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonContainer: {
    width: '28%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONTS.DMSans.medium,
  },
});
