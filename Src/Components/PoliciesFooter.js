import {Modal, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {FONTS} from '../Utilities/Fonts';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import AppLogo from '../Assets/Svg/app_logo.svg';
import WebUrlLoaderModal from '../Modals/WebUrlLoaderModal';
import {TERMS_CONDTION_URL} from '../Services/ServiceConstants';

const PoliciesFooter = () => {
  const [isOpenTermsAndConditionsModal, setisOpenTermsAndConditionsModal] =
    useState(false);

  return (
    <View style={styles.mainContainer}>
      <AppLogo />
      <StyledText style={[styles.footerText, {paddingVertical: 5}]}>
        © Copyright Rawcaster 2021
      </StyledText>
      <StyledText
        style={styles.footerText}
        onPress={() => {
          setisOpenTermsAndConditionsModal(true);
        }}>
        Terms and Conditions | Privacy Policy
      </StyledText>
      <StyledText style={styles.footerText}>Cookies Policy</StyledText>
      <Modal
        visible={isOpenTermsAndConditionsModal}
        transparent
        // statusBarTranslucent
        onRequestClose={() => {
          setisOpenTermsAndConditionsModal(false);
        }}>
        <SafeAreaView style={{flex: 1}}>
          <WebUrlLoaderModal
            url={TERMS_CONDTION_URL}
            setModal={setisOpenTermsAndConditionsModal}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default PoliciesFooter;

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingBottom: 25,
    paddingTop: 35,
  },
  footerText: {
    fontFamily: FONTS.Roboto.regular,
    color: COLORS.dimColor,
  },
});
