import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../Utilities/Colors';
import SVGIcon from './SVGIcon';
import LinearGradient from 'react-native-linear-gradient';

const DefaultBackground = () => {
  return (
    <View style={styles.mainContainer}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 170,
        }}>
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', COLORS.transparent]}
          // colors={['red', 'red']}
          start={{x: 1, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.linearGradient}
        />
      </View>
      <SVGIcon icon="logo_R" width={'50%'} height={'50%'} />
    </View>
  );
};

export default DefaultBackground;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  linearGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    // paddingBottom: IS_IOS ? 100 : 100,
  },
});
