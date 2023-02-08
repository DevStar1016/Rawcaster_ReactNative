import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {SOCIAL_SIGN_IN_LIST} from '../../../Utilities/Constants';

const Signup = () => {
  const navigation = useNavigation();

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  const SignupTypeButton = ({buttonText = '', icon, onPress}) => {
    return (
      <SubmitButton
        buttonText={buttonText}
        bgColor={COLORS.white}
        onPress={onPress}
        buttonTextStyle={{fontWeight: '400', fontSize: 18}}
        textColor={COLORS.black}
        icon={icon}
        borderColor={COLORS.borderColor}
      />
    );
  };

  return (
    <AuthScreenHOC
      title="Join Rawcaster Family"
      subTitle="Join now to access the latest insights, experience for your social media performance."
      isEnableSubmitButton={false}
      buttonBottomLeftText="Already Registered? "
      buttonBottomRightText="Login"
      onPressButtonBottomText={() => {
        navigation.goBack();
      }}>
      <SubmitButton
        buttonText="Signup with phone number or email"
        buttonTextStyle={{fontSize: 18}}
        onPress={() => {
          navigation.navigate('SignupWithPhone');
        }}
      />
      <View style={styles.dividerContainer}>
        <Divider />
        <View style={styles.orTextContainer}>
          <StyledText style={{fontSize: 17}}>OR</StyledText>
        </View>
        <Divider />
      </View>
      {SOCIAL_SIGN_IN_LIST.map(item => {
        return (
          <SignupTypeButton
            key={item.id.toString()}
            buttonText={`Signup with ${item.platformName}`}
            icon={item.iconName}
            onPress={() => {}}
          />
        );
      })}
    </AuthScreenHOC>
  );
};

export default Signup;

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  divider: {
    height: 1.5,
    backgroundColor: COLORS.borderColor,
    width: '43%',
  },
  orTextContainer: {
    width: '10%',
    alignItems: 'center',
  },
});
