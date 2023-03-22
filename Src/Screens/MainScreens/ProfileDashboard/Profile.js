import {StyleSheet, View} from 'react-native';
import React from 'react';
import HOCView from '../../../Components/HOCView';
import ProfileTopSection from './ProfileTopSection';
import ProfileNameBioContainer from './ProfileNameBioContainer';
import ProfileIntroContainer from './ProfileIntroContainer';
import {COLORS} from '../../../Utilities/Colors';

const Profile = () => {
  const Divider = () => {
    return <View style={styles.divider} />;
  };

  return (
    <HOCView headerType="home_header" paddingHorizontal={0} isEnableScroll>
      <ProfileTopSection />
      <ProfileNameBioContainer />
      <Divider />
      <ProfileIntroContainer />
      <Divider />
    </HOCView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginVertical: 12,
  },
});
