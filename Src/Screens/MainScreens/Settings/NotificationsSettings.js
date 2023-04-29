import {Modal, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {COLORS} from '../../../Utilities/Colors';
import {useProfile, useSettings, useToken} from '../../../Utilities/StoreData';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';
import {setSettings} from '../../../Store/Slices/AuthSlice';
import {useDispatch} from 'react-redux';
import {updateUserSettingsService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import Toast from '../../../Components/Toast';
import {useNavigation} from '@react-navigation/native';
import InputPopup from '../../../Modals/InputPopup';

const SWITCHES_LIST = [
  {
    id: 1,
    name: 'Email',
  },
  {
    id: 2,
    name: 'SMS',
  },
  {
    id: 3,
    name: 'Push',
  },
];
var isMount = true;
const NotificationsSettings = () => {
  const navigation = useNavigation();
  const token = useToken();
  const dispatch = useDispatch();
  const settings = useSettings();
  const profile = useProfile();
  const [isLoading, setisLoading] = useState(false);
  const [switchStatus, setswitchStatus] = useState({
    friend_request: settings.friend_request,
    nuggets: settings.nuggets,
    events: settings.events,
  });
  const [connectionRequestSwitchStatus, setconnectionRequestSwitchStatus] =
    useState(settings.friend_request);
  const [nuggetsSwitchStatus, setnuggetsSwitchStatus] = useState(
    settings.nuggets,
  );
  const [eventsSwitchStatus, seteventsSwitchStatus] = useState(settings.events);
  const [confirmationBoxData, setconfirmationBoxData] = useState({
    isOpen: false,
    verificationField: '',
  });
  const [verificationInputModalData, setverificationInputModalData] = useState({
    isOpen: false,
    verificationField: '',
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function updateUsersSettingsAPICall(keyText, changedValue, oldValue) {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append(keyText, changedValue);
    updateUserSettingsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setSettings({...settings, [keyText]: changedValue}));

          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          setswitchStatus(preData => {
            return {
              ...preData,
              [keyText]: oldValue,
            };
          });

          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        setswitchStatus(preData => {
          return {
            ...preData,
            [keyText]: oldValue,
          };
        });
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function getOnStatusIdsList(dataText) {
    let data = dataText
      .split('')
      .map((status, index) =>
        parseInt(status) === 1 ? SWITCHES_LIST[index].id : undefined,
      );
    return data.filter(item => item !== undefined);
  }

  function getChangedStatus(statusText, id) {
    let dataList = statusText.split('').map(status => parseInt(status));
    dataList[parseInt(id) - 1] = dataList[parseInt(id) - 1] === 1 ? 0 : 1;

    return dataList.join('');
  }

  function isEmailVerified() {
    console.log(profile, 'PROFILE');
    if (parseInt(profile.is_email_id_verified) === 1) {
      return true;
    }
    if (profile.email_id) {
      setconfirmationBoxData({isOpen: true, verificationField: 'email'});
    } else {
    }
    return false;
  }

  function isMobileVerified() {
    if (parseInt(profile.is_mobile_no_verified) === 1) {
      return true;
    }
    if (profile.mobile) {
      setconfirmationBoxData({isOpen: true, verificationField: 'sms'});
    } else {
      setverificationInputModalData({
        isOpen: true,
        verificationField: 'sms',
      });
    }
    return false;
  }

  function closeConfirmationBox() {
    setconfirmationBoxData({isOpen: false, verificationField: ''});
  }

  function closeVerificationInputModal() {
    setverificationInputModalData({
      isOpen: false,
      verificationField: '',
    });
  }

  function updateSwitchStatus(id, fieldName) {
    setswitchStatus(preData => {
      const changedStatus = getChangedStatus(preData[fieldName], id);
      updateUsersSettingsAPICall(fieldName, changedStatus, preData[fieldName]);
      return {
        ...preData,
        [fieldName]: changedStatus,
      };
    });
  }

  function changeSwitchStatus(id, fieldName) {
    switch (id) {
      case 1:
        isEmailVerified() && updateSwitchStatus(id, fieldName);
        return;
      case 2:
        isMobileVerified() && updateSwitchStatus(id, fieldName);
        return;
      case 3:
        updateSwitchStatus(id, fieldName);
        return;
    }
  }

  function getConfirmationBoxFieldText() {
    if (confirmationBoxData.verificationField === 'sms') {
      return 'phone number';
    }
    return confirmationBoxData.verificationField;
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="Notification Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          bounces={false}>
          <SwtchesContainer
            title="Connection Requests"
            description="These are notifications for when someone sends you a connection
          request, or when a request you’ve sent is accepted."
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(
              switchStatus.friend_request,
            )}
            onChangeButtonStatus={id => {
              changeSwitchStatus(id, 'friend_request');
            }}
          />
          <SwtchesContainer
            title="Nuggets"
            description="Choose how you want to be notified when you receive a new nugget"
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(switchStatus.nuggets)}
            onChangeButtonStatus={id => {
              changeSwitchStatus(id, 'nuggets');
            }}
          />
          <SwtchesContainer
            title="Events"
            description="Choose how you want to be notified when you receive a new event"
            switchesList={[...SWITCHES_LIST]}
            onStatusSwitchesIdsList={getOnStatusIdsList(switchStatus.events)}
            onChangeButtonStatus={id => {
              changeSwitchStatus(id, 'events');
            }}
          />
        </ScrollView>
      </View>
      <Modal visible={confirmationBoxData.isOpen} transparent>
        <ConfirmationPopup
          onClose={() => {
            closeConfirmationBox();
          }}
          onPressPositiveButton={() => {
            const otpType = confirmationBoxData.verificationField;
            closeConfirmationBox();
            navigation.navigate('EmailPhoneVerification', {
              otpType: otpType,
              isGoBack: true,
            });
          }}
          onPressNegativeButton={() => {
            closeConfirmationBox();
          }}
          positiveButtonText="Yes"
          negativeButtonText="No"
          content={`You need to complete your ${getConfirmationBoxFieldText()} verification before you can do this. Do you want to verify your ${getConfirmationBoxFieldText()} now?`}
        />
      </Modal>

      <Modal
        visible={verificationInputModalData.isOpen}
        transparent
        onRequestClose={() => {
          closeVerificationInputModal();
        }}>
        <InputPopup
          closePopup={() => {
            closeVerificationInputModal();
          }}
          title={'Mobile Number'}
        />
      </Modal>
      <Modal visible={isLoading} transparent>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Settings Updating'}
        />
      </Modal>
    </View>
  );
};

export default NotificationsSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  settingItemContainer: {
    paddingVertical: 10,
  },
  switchesContainer: {
    flexDirection: 'row',
    marginTop: 13,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
  },
});
