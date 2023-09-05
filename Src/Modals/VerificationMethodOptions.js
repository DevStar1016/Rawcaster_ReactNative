import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useProfile} from '../Utilities/StoreData';
import SVGIcon from '../Components/SVGIcon';
import StyledText from '../Components/StyledText';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';

const VerificationMethodChoose = ({onSubmitOption, onClose}) => {
  const profile = useProfile();

  /**
   * Returns a partially hidden email address by replacing all characters after the third character
   * in the email name with asterisks.
   * @returns {string} - The partially hidden email address.
   */
  const getPartialHiddenEmail = () => {
    let emailSplitedList = profile?.email_id.toString().split('@');
    let emailNameText = '';
    emailSplitedList[0]
      .toString()
      .split('')
      .map((letter, index) => {
        if (index > 2) {
          emailNameText = emailNameText + '*';
        } else {
          emailNameText = emailNameText + letter;
        }
      });

    return emailNameText + '@' + emailSplitedList[1];
  };

  /**
   * Returns a partially hidden mobile number by replacing the middle digits with asterisks.
   * @returns {string} - The partially hidden mobile number.
   */
  const getPartialHiddenMobileNumber = () => {
    let splitedNumbersList = profile?.mobile.toString().split('');
    let phoneNumber = '';
    splitedNumbersList.map((num, index) => {
      if (index < 2 || index > splitedNumbersList.length - 3) {
        phoneNumber = phoneNumber + num;
      } else {
        phoneNumber = phoneNumber + '*';
      }
    });
    return phoneNumber;
  };

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  return (
    <TouchableOpacity style={styles.screen} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity style={styles.subContainer} activeOpacity={1}>
        <SVGIcon icon="app_text_logo_colored" height={40} width={160} />
        <View style={{paddingVertical: 10}}>
          <StyledText style={styles.titleText}>
            Choose the Verification Mode
          </StyledText>
        </View>
        <View>
          {profile?.email_id.toString() ? (
            <>
              <TouchableOpacity
                style={styles.choiceContainer}
                activeOpacity={0.6}
                onPress={() => {
                  onSubmitOption('email');
                }}>
                <SVGIcon icon="email" />
                <View style={{paddingLeft: 10}}>
                  <StyledText style={styles.choiceText}>
                    {`Get a verification code at ${getPartialHiddenEmail()}`}
                  </StyledText>
                </View>
              </TouchableOpacity>
              <Divider />
            </>
          ) : null}
          {profile?.mobile.toString() ? (
            <>
              <TouchableOpacity
                style={styles.choiceContainer}
                activeOpacity={0.6}
                onPress={() => {
                  onSubmitOption('sms');
                }}>
                <SVGIcon icon="phone" />
                <View style={{paddingLeft: 10}}>
                  <StyledText style={styles.choiceText}>
                    {`Get a verification code at ${getPartialHiddenMobileNumber()}`}
                  </StyledText>
                </View>
              </TouchableOpacity>
              <Divider />
            </>
          ) : null}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default VerificationMethodChoose;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  titleText: {
    color: COLORS.black,
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
    paddingVertical: 5,
  },
  choiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  choiceText: {
    color: COLORS.black,
    fontSize: 14,
    paddingVertical: 5,
  },
  divider: {
    borderBottomColor: COLORS.black,
    borderBottomWidth: 0.5,
    opacity: 0.4,
  },
});
