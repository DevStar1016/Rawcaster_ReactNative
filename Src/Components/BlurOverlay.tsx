import {ImageStyle, StyleSheet, View} from 'react-native';
import React from 'react';
import {BlurView} from '@react-native-community/blur';
import SVGIcon from './SVGIcon';
import {COLORS} from '../Utilities/Colors';

type Props = {
  containerStyle?: ImageStyle;
  hideLock?: boolean;
};

const BlurOverlay = ({containerStyle, hideLock = false}: Props) => {
  return (
    <>
      <BlurView
        style={[styles.container, containerStyle]}
        blurType="light"
        blurAmount={10}
        overlayColor={COLORS.transparent}
        reducedTransparencyFallbackColor="white"
      />

      {!hideLock && (
        <View style={styles.container}>
          <View style={styles.lockIconContainer}>
            <SVGIcon icon="lock_with_dot_white" height={30} width={30} />
          </View>
        </View>
      )}
    </>
  );
};

export default BlurOverlay;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconContainer: {
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
});
