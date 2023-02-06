import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import KeyboardAvoidingHOC from '../../Components/KeyboardAvoidingHOC';
import {COLORS} from '../../Utilities/Colors';
import Logo from '../../Assets/Svg/slogan_logo.svg';
import {FONTS} from '../../Utilities/Fonts';
import StyledText from '../../Components/StyledText';

const Login = () => {
  return (
    <KeyboardAvoidingHOC>
      <View style={styles.headerContainer}>
        <Logo />
      </View>
      <View style={styles.contentContainer}>
        <StyledText style={styles.title}>Welcome to Rawcaster</StyledText>
        <StyledText style={{textAlign: 'center'}}>
          Log in now to access the latest insights, experience for your social
          media performance.
        </StyledText>
      </View>
    </KeyboardAvoidingHOC>
  );
};

export default Login;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
  },
});
