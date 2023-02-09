import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';

const CustomHeader = () => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <SVGIcon icon="app_logo_white" height={30} width={30} />
      </View>
      <View style={styles.subContainer}></View>
      <View style={[styles.subContainer, {justifyContent: 'flex-end'}]}>
        <SVGIcon icon="search" color={COLORS.primary} />
        <SVGIcon icon="live" color={COLORS.primary} marginLeft={5} />
        <SVGIcon icon="user_plus" marginLeft={5} />
        <SVGIcon icon="user" marginLeft={5} />
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.primary,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
  },
});
