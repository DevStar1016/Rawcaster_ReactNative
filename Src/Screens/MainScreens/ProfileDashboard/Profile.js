import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import HOCView from '../../../Components/HOCView';
import ProfileTopSection from './ProfileTopSection';

const Profile = () => {
  return (
    <HOCView headerType="home_header" paddingHorizontal={0}>
      <ProfileTopSection />
    </HOCView>
  );
};

export default Profile;

const styles = StyleSheet.create({});
