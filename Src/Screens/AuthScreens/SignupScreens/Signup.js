import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AuthScreenHOC from '../../../Components/AuthScreenComponents.js/AuthScreenHOC';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {SOCIAL_SIGN_IN_LIST} from '../../../Utilities/Constants';

const Signup = () => {
  const navigation = useNavigation();

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      webClientId:
        '749429188201-u1e40oco3dejrfcnr7algubh0k0sf01e.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      androidClientId:
        '165212392194-48bdvglq550ov9suvhfdr7eslubdcdtb.apps.googleusercontent.com',
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // specifies a hosted domain restriction
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      accountName: '', // [Android] specifies an account name on the device that should be used
      iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
      openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
      profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
    });
  }, []);

  const googleSignUp = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo, 'LOGIN');
    } catch (error) {
      const typedError = error;
      console.log(error, 'KLKLKLK');

      switch (typedError.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          // sign in was cancelled
          alert('cancelled');
          break;
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          alert('in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // android only
          alert('play services not available or outdated');
          break;
        default:
          alert('Something went wrong', typedError.toString());
      }
    }
  };

  const facebookSignUp = async () => {};

  const twitterSignUp = async () => {};

  const appleSignUp = async () => {};

  const onPressSocialSignup = id => {
    switch (id) {
      case 1:
        googleSignUp();
        return;
      case 2:
        facebookSignUp();
        return;
      case 3:
        twitterSignUp();
        return;
      case 4:
        appleSignUp();
        return;
    }
  };

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
            onPress={() => {
              onPressSocialSignup(item.id);
            }}
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
