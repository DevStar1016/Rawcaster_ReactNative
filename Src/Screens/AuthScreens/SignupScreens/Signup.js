import {StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import SloganLogo from '../../../Assets/Svg/slogan_logo.svg';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import ReplaceStatusBar from '../../../Components/ReplaceStatusBar';
import PoliciesFooter from '../../../Components/PoliciesFooter';
import SocialSignin from '../SocialSignin';

const Signup = ({route}) => {
  const navigation = useNavigation();
  const {pushId, refId} = route.params;

  console.log(route.params, 'PARAMSSS');

  useEffect(() => {
    AvoidSoftInput.setAdjustResize();
  }, []);

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  return (
    <View style={styles.mainContainer}>
      <ReplaceStatusBar />

      <KeyboardAwareScrollView
        extraScrollHeight={10}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <SloganLogo />
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <StyledText style={styles.title}>Join Rawcaster Family</StyledText>
            <StyledText style={{paddingVertical: 5, textAlign: 'center'}}>
              Join now to access the latest insights, experience for your social
              media performance.
            </StyledText>
          </View>

          <SubmitButton
            buttonText="Sign up with phone number or email"
            buttonTextStyle={{fontSize: 17}}
            onPress={() => {
              navigation.navigate('SignupWithPhone', {
                pushId: pushId,
                refId: refId,
              });
            }}
          />
          <View style={styles.dividerContainer}>
            <Divider />
            <View style={styles.orTextContainer}>
              <StyledText style={{fontSize: 17, paddingVertical: 5}}>
                OR
              </StyledText>
            </View>
            <Divider />
          </View>
          <SocialSignin pushId={pushId} refId={refId} />
          <View style={styles.signUpContainer}>
            <StyledText style={styles.signUpText}>
              Already Registered?
            </StyledText>
            <StyledText
              onPress={() => {
                navigation.goBack();
              }}
              style={{...styles.signUpText, color: COLORS.secondary}}>
              Login
            </StyledText>
          </View>
          <PoliciesFooter />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  logoContainer: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingVertical: 15,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  titleContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FONTS.Gilroy.bold,
    paddingVertical: 5,
    textAlign: 'center',
  },
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
  signUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  signUpText: {
    color: COLORS.dimColor,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 17,
    paddingVertical: 5,
  },
});
