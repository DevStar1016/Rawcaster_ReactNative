import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import RoundedIconButton from '../../../Components/RoundedIconButton';

const ProfileNameBioContainer = () => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.nameRowContainer}>
        <View style={styles.nameAndCategoryContainer}>
          <StyledText style={styles.nameText}>About Danii</StyledText>
          <View style={styles.dot} />
          <StyledText style={styles.nameText}>Entertainer</StyledText>
        </View>
        <RoundedIconButton buttonSize={30} iconSize={16} icon="edit_black" />
      </View>
      <View style={styles.bioContainer}>
        <StyledText>
          The richest man in the world, Elon Musk, has created a chip
          (Neuralink) that will be inserted into the human brain. He said that
          his prime motivation for is Neuralink was the question: 'What do we do
          if there is a super intelligence that is much smarter than human
          beings much smarter
        </StyledText>
      </View>
    </View>
  );
};

export default ProfileNameBioContainer;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
    paddingTop: 12,
  },
  nameRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameAndCategoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  dot: {
    height: 7,
    width: 7,
    backgroundColor: COLORS.black,
    borderRadius: 7 / 2,
    marginHorizontal: 10,
  },
  bioContainer: {
    paddingTop: 5,
  },
});
