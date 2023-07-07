import {StyleSheet, View} from 'react-native';
import React from 'react';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import LinearGradient from 'react-native-linear-gradient';
import SVGIcon from '../../../Components/SVGIcon';

const EncryptedMessageContainer = () => {
  return (
    <LinearGradient
      colors={['#F3738B', '#F99F46']}
      start={{x: 0, y: 1}}
      end={{x: 1, y: 1}}
      style={styles.mainContainer}>
      <View style={styles.iconContainer}>
        <SVGIcon icon="app_logo_white" />
      </View>
      <View style={styles.textContainer}>
        <StyledText style={styles.text}>
          Messages and calls are end-to-end encrypted. No one outside of this
          chat, not even Rawcaster, can read or listen to them.
        </StyledText>
      </View>
    </LinearGradient>
  );
};

export default EncryptedMessageContainer;

const styles = StyleSheet.create({
  mainContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    paddingRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 5,
  },
  text: {
    color: COLORS.white,
  },
});
