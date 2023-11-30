import {Modal, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import NotificationsTopTabNavigation from '../../../Navigation/TopTabNavigation/Notifications/NotificationsTopTabNavigation';
import {
  useToken,
  useUnreadNotificationCount,
} from '../../../Utilities/StoreData';
import {readNotificationService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setUnreadNotificationCount} from '../../../Store/Slices/HomeSlice';
import {NoticationsContext} from '../../../Utilities/Contexts';
import Loader from '../../../Components/Loader';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import DefaultBackground from '../../../Components/DefaultBackground';

const NotificationsHome = () => {
  const dispatch = useDispatch();
  const token = useToken();
  const unreadNotificationCount = useUnreadNotificationCount();
  const [isActionLoading, setisActionLoading] = useState(false);

  const noticationContextValue = {
    setisActionLoading: setisActionLoading,
  };

  /**
   * Handles the action of marking all notifications as read.
   * Sets the isActionLoading state to true.
   * Creates a new FormData object and appends the token and mark_all_as_read parameters.
   * Calls the readNotificationService function with the formData.
   * If the response status is 1, dispatches the setUnreadNotificationCount action with null as the parameter
   * and displays a success toast message.
   * If the response status is not 1, displays a failure toast message.
   * If an error occurs during the API call, displays a failure toast message with the error message.
   * Finally, sets the isActionLoading state to false.
   * @returns None
   */
  const handleMarkAllRead = () => {
    setisActionLoading(true);
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
      })
      .finally(() => {
        setisActionLoading(false);
      });
  };

  function Divider() {
    return <View style={styles.divider} />;
  }

  return (
    <NoticationsContext.Provider value={noticationContextValue}>
      <View style={{flex: 1}}>
        <CustomHomeHeader
          bgColor={COLORS.transparent}
          isEnableSafeArea
          isEnableSearch={true}
          isEnableLive={false}
        />
        <DefaultBackground isEnableRLogo={false} bgColor={COLORS.primaryDark} />
        <View style={styles.contentContainer}>
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
          <Modal
            onRequestClose={() => {}}
            transparent
            visible={isActionLoading}>
            <Loader bgColor={COLORS.transparentDimColor} />
          </Modal>
        </View>
      </View>
    </NoticationsContext.Provider>
  );
};

export default NotificationsHome;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingBottom: 50,
    paddingHorizontal: 15,
  },
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
