import {StyleSheet, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../Utilities/Colors';
import StyledText from '../../Components/StyledText';
import TextBox from '../../Components/TextBox';
import AuthScreenHOC from '../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();
  return (
    <AuthScreenHOC
      title="Welcome to Rawcaster"
      subTitle="Log in now to access the latest insights, experience for your social
    media performance."
      submitButtonText="Login"
      buttonBottomLeftText="Don’t have an account?  "
      buttonBottomRightText="Sign up">
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Phone number or Email address"
        title="Login ID"
      />
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isSecure
      />
      <View style={styles.forgotPasswordContainer}>
        <StyledText
          isButton={true}
          paddingVertical={0}
          onPress={() => {
            navigation.navigate('ForgotPassword');
          }}
          style={styles.forgotPasswordText}>
          Forgot Password?
        </StyledText>
      </View>
    </AuthScreenHOC>
  );
};

export default Login;

const styles = StyleSheet.create({
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    color: COLORS.secondary,
    fontWeight: 500,
  },
});
