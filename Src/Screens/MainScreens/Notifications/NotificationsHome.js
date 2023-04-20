import {StyleSheet, View} from 'react-native';
import React from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import NotificationsTopTabNavigation from '../../../Navigation/TopTabNavigation/NotificationsTopTabNavigation';

const NotificationsHome = () => {
  function Divider() {
    return <View style={styles.divider} />;
  }

  return (
    <HOCView
      headerType="home_header"
      isEnableTopSafeAreaHomeHeader
      headerProps={{bgColor: COLORS.transparent, isEnableSearch: false}}
      isEnableDefaultBackground
      isEnableRLogo={false}
      paddingBottom={50}
      backgroundColor={COLORS.primary}>
      <View style={styles.titleHeaderContainer}>
        <View style={styles.titleTextContainer}>
          <StyledText style={styles.titleText}>Notifications</StyledText>
        </View>
        <RoundedIconButton
          icon="search"
          bgColor={COLORS.secondary}
          buttonSize={37}
          iconSize={20}
        />
      </View>
      <Divider />
      <NotificationsTopTabNavigation />
    </HOCView>
  );
};

export default NotificationsHome;

const styles = StyleSheet.create({
  titleHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  titleTextContainer: {
    flexDirection: 'row',
  },
  titleText: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONTS.DMSans.bold,
  },
  divider: {
    borderBottomWidth: 0.2,
    marginTop: 15,
    borderColor: COLORS.borderColor,
    opacity: 0.6,
  },
});
