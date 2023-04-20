import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import {useProfile, useSettings} from '../../../Utilities/StoreData';
import {
  calcualteAge,
  getDefaultRawcasterPage,
  getSlicedText,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import moment from 'moment';
import GradientButton from '../../../Components/GradientButton';

const ProfileNameBioContainer = ({
  userId,
  profile,
  paddingHorizontal,
  onLayout,
}) => {
  const settings = useSettings();
  const getBioData = () => {
    if (profile.bio_data && profile.bio_data.trim()) {
      return htmlDecodeText(profile.bio_data.trim());
    }
    let bioDataText = '';
    if (profile.dob) {
      bioDataText +=
        '<first_name> <last_name> is  <age> years old, was born in <dob>. ';
    }
    if (profile.geo_location) {
      bioDataText +=
        '<first_name> <last_name> presently resides in <location>. ';
    }
    bioDataText +=
      '<first_name>’s preferred communication language is <language> . <first_name> has been a Rawcaster <user_status>  since <date_of_join> and prefers to be contacted in Rawcaster through <rawcaster_default_page>.';

    bioDataText = bioDataText.replace(
      /<first_name>/g,
      htmlDecodeText(profile.first_name),
    );
    bioDataText = bioDataText.replace(
      /<last_name>/g,
      htmlDecodeText(profile.last_name),
    );
    bioDataText = bioDataText.replace(
      /<age>/g,
      calcualteAge(moment(profile.dob)),
    );
    bioDataText = bioDataText.replace(
      /<dob>/g,
      moment(profile.dob).format(' MMM YYYY '),
    );
    bioDataText = bioDataText.replace(
      /<location>/g,
      htmlDecodeText(profile.geo_location),
    );
    bioDataText = bioDataText.replace(
      /<language>/g,
      htmlDecodeText(profile.language),
    );
    bioDataText = bioDataText.replace(/<user_status>/g, profile.user_status);

    if (profile.date_of_join) {
      bioDataText = bioDataText.replace(
        /<date_of_join>/g,
        utcToUserTimezone(profile.date_of_join, settings.time_zone).format(
          ' DD MMM YYYY ',
        ),
      );
    }
    bioDataText = bioDataText.replace(
      /<rawcaster_default_page>/g,
      getDefaultRawcasterPage(settings?.mobile_default_page || 1),
    );

    return bioDataText;
  };

  return (
    <View
      onLayout={onLayout}
      style={[styles.mainContainer, {paddingHorizontal}]}>
      <View style={styles.nameRowContainer}>
        <View style={styles.nameAndCategoryContainer}>
          <StyledText style={styles.nameText}>
            {getSlicedText(profile.name, 50)}
          </StyledText>

          {/* <View style={styles.dot} />
          <StyledText style={styles.nameText}>Entertainer</StyledText> */}
        </View>
        {!userId && (
          <View style={{marginLeft: 10}}>
            <RoundedIconButton
              buttonSize={30}
              iconSize={16}
              icon="edit_black"
            />
          </View>
        )}
      </View>
      <View style={styles.bioContainer}>
        <StyledText>{getBioData()}</StyledText>
      </View>
      {userId && !profile.follow && (
        <GradientButton
          buttonText={'Become a Fan'}
          rightIcon="right_arrow_white"
          marginTop={15}
          onPress={() => {}}
        />
      )}
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameAndCategoryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
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
