import {Modal, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {FONTS} from '../Utilities/Fonts';
import {COLORS} from '../Utilities/Colors';
import StyledText from './StyledText';
import AppLogo from '../Assets/Svg/app_logo.svg';
import WebUrlLoaderModal from '../Modals/WebUrlLoaderModal';
import {
  COOKIES_POLICY,
  PRIVACY_POLICY_URL,
  TERMS_CONDTION_URL,
} from '../Services/ServiceConstants';

const PoliciesFooter = () => {
  const [policiesData, setpoliciesData] = useState({
    status: false,
    url: '',
    title: '',
  });

  return (
    <View style={styles.mainContainer}>
      <AppLogo />
      <StyledText style={[styles.footerText, {paddingVertical: 5}]}>
        © Copyright Rawcaster 2021
      </StyledText>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <StyledText
          style={styles.footerText}
          onPress={() => {
            setpoliciesData({
              status: true,
              url: TERMS_CONDTION_URL,
              title: 'Terms and Conditions',
            });
          }}>
          Terms and Conditions
        </StyledText>
        <StyledText style={styles.footerText}> | </StyledText>
        <StyledText
          onPress={() => {
            setpoliciesData({
              status: true,
              url: PRIVACY_POLICY_URL,
              title: 'Privacy Policy',
            });
          }}
          style={styles.footerText}>
          Privacy Policy
        </StyledText>
      </View>

      <StyledText
        onPress={() => {
          setpoliciesData({
            status: true,
            url: COOKIES_POLICY,
            title: 'Cookies Policy',
          });
        }}
        style={styles.footerText}>
        Cookies Policy
      </StyledText>
      <Modal
        visible={policiesData.status}
        transparent
        onRequestClose={() => {
          setpoliciesData({
            status: false,
            url: '',
            title: '',
          });
        }}>
        <SafeAreaView style={{flex: 1}}>
          <WebUrlLoaderModal
            title={policiesData.title}
            url={policiesData.url}
            setModal={() => {
              setpoliciesData({
                status: false,
                url: '',
              });
            }}
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
