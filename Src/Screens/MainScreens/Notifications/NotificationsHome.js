import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import RoundedIconButton from '../../../Components/RoundedIconButton';
import NotificationsTopTabNavigation from '../../../Navigation/TopTabNavigation/NotificationsTopTabNavigation';
import {
  useToken,
  useUnreadNotificationCount,
} from '../../../Utilities/StoreData';
import {readNotificationService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setUnreadNotificationCount} from '../../../Store/Slices/HomeSlice';
import {NoticationsContext} from '../../../Utilities/Contexts';

const NotificationsHome = () => {
  const dispatch = useDispatch();
  const token = useToken();
  const unreadNotificationCount = useUnreadNotificationCount();
  const [focusedTab, setfocusedTab] = useState(5);

  const noticationContextValue = {
    setFocusedTab: setfocusedTab,
  };

  const handleMarkAllRead = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('mark_all_as_read', 1);
    readNotificationService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setUnreadNotificationCount(null));
          Toast.success(res.data.msg);
        } else {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      });
  };

  function Divider() {
    return <View style={styles.divider} />;
  }

  return (
    <NoticationsContext.Provider value={noticationContextValue}>
      <HOCView
        headerType="home_header"
        isEnableTopSafeAreaHomeHeader
        headerProps={{
          bgColor: COLORS.transparent,
          isEnableSearch: false,
          isEnableLive: false,
        }}
        isEnableDefaultBackground
        isEnableRLogo={false}
        paddingBottom={50}
        backgroundColor={COLORS.primary}>
        <View style={styles.titleHeaderContainer}>
          <View style={styles.titleTextContainer}>
            <StyledText style={styles.titleText}>Notifications</StyledText>
            {unreadNotificationCount ? (
              <View style={styles.countContainer}>
                <StyledText style={styles.countText}>
                  {unreadNotificationCount > 99
                    ? '99+'
                    : unreadNotificationCount}
                </StyledText>
              </View>
            ) : null}
          </View>
          {/* <RoundedIconButton
          icon="search"
          bgColor={COLORS.secondary}
          buttonSize={37}
          iconSize={20}
        /> */}
          {unreadNotificationCount ? (
            <TouchableOpacity
              onPress={() => handleMarkAllRead()}
              activeOpacity={0.8}>
              <StyledText style={styles.readText}>Mark all Read</StyledText>
            </TouchableOpacity>
          ) : null}
        </View>
        <Divider />
        <NotificationsTopTabNavigation />
      </HOCView>
    </NoticationsContext.Provider>
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
    alignItems: 'center',
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
  readText: {
    color: COLORS.white,
  },
  countContainer: {
    marginLeft: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 35,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  countText: {
    color: COLORS.white,
  },
});
