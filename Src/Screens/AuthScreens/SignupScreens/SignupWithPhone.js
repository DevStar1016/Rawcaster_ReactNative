import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import {useNavigation} from '@react-navigation/native';
import TextBox from '../../../Components/TextBox';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import DOBPicker from '../../../Components/CustomDateMonthYearPicker';

const SignupWithPhone = () => {
  const navigation = useNavigation();
  const [isEnablePhoneNumber, setisEnablePhoneNumber] = useState(true);
  return (
    <AuthScreenHOC
      title="Join Rawcaster Family"
      subTitle="Join now to access the latest insights, experience for your social media performance."
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      submitButtonText="Join Rawcaster Family"
      onPressSubmitButton={() => {
        navigation.navigate('OTPVerification');
      }}
      onPressButtonBottomText={() => {
        navigation.reset({
          routes: [{name: 'Login'}],
        });
      }}>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your name"
        title="Name"
      />
      {isEnablePhoneNumber ? (
        <TextBox
          iconColor={COLORS.placeHolderColor}
          placeHolder="Enter your phone number"
          title="Phone Number"
          keyboardType="number-pad"
        />
      ) : (
        <TextBox
          iconColor={COLORS.placeHolderColor}
          placeHolder="Enter your email address"
          title="Email Address"
          keyboardType="email-address"
        />
      )}

      <View style={{alignItems: 'flex-end'}}>
        <StyledText
          isButton
          paddingVertical={0}
          style={styles.emailFieldToggleButtonText}
          onPress={() => {
            setisEnablePhoneNumber(pre => !pre);
          }}>
          {`Use ${isEnablePhoneNumber ? 'Email' : 'Phone Number'} instead`}
        </StyledText>
      </View>
      <TextBox
        iconColor={COLORS.placeHolderColor}
        placeHolder="Enter your password"
        title="Password"
        isSecure
        isEnablePasswordConditionText
      />
      <DOBPicker />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 15}}>
        <StyledText style={{fontSize: 17}} paddingVertical={0}>
          {"By Signing up you agree with Rawcaster's "}
        </StyledText>
        <StyledText
          style={{color: COLORS.secondary, fontSize: 17}}
          isButton
          paddingVertical={0}
          onPress={() => {}}>
          terms and conditions
        </StyledText>
      </View>
    </AuthScreenHOC>
  );
};

export default SignupWithPhone;

const styles = StyleSheet.create({
  emailFieldToggleButtonText: {
    color: COLORS.secondary,
    fontWeight: '500',
  },
});
