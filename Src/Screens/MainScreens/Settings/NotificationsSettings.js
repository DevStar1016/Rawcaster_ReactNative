import {Modal, ScrollView, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {COLORS} from '../../../Utilities/Colors';
import {useProfile, useSettings, useToken} from '../../../Utilities/StoreData';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import ConfirmationPopup from '../../../Modals/ConfirmationPopup';
import {setMyProfile, setSettings} from '../../../Store/Slices/AuthSlice';
import {useDispatch} from 'react-redux';
import {
  updateMyProfileService,
  updateUserSettingsService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import Toast from '../../../Components/Toast';
import {useNavigation} from '@react-navigation/native';
import InputPopup from '../../../Modals/InputPopup';
import {getAuthCode, htmlDecodeText} from '../../../Utilities/Methods';

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
    friend_request: settings?.friend_request,
    nuggets: settings?.nuggets,
    events: settings?.events,
  });
  const [connectionRequestSwitchStatus, setconnectionRequestSwitchStatus] =
    useState(settings?.friend_request);
  const [nuggetsSwitchStatus, setnuggetsSwitchStatus] = useState(
    settings?.nuggets,
  );
  const [eventsSwitchStatus, seteventsSwitchStatus] = useState(
    settings?.events,
  );
  const [confirmationBoxData, setconfirmationBoxData] = useState({
    isOpen: false,
    verificationField: '',
  });
  const [verificationInputModalData, setverificationInputModalData] = useState({
    isOpen: false,
    verificationField: '',
  });

  const [optinConfirmationData, setoptinConfirmationData] = useState({
    status: false,
    text: '',
    updatedOptinValue: settings?.opt_in,
    id: null,
    fieldName: '',
  });

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function updateUsersSettingsAPICall(
    keyText,
    changedValue,
    oldValue,
    extraFieldName,
    extraValue,
  ) {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append(keyText, changedValue);
    if (extraFieldName) {
      formData.append(extraFieldName, extraValue);
    }
    updateUserSettingsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let updatedSettings = {...settings, [keyText]: changedValue};
          if (extraFieldName) {
            updatedSettings = {
              ...updatedSettings,
              [extraFieldName]: extraValue,
            };
          }
          dispatch(
            setSettings({
              ...updatedSettings,
            }),
          );

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

  const handleUpdateProfile = (value = '', fieldType = '') => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token + profile?.name.trim()));
    formData.append('name', profile?.name.trim());
    formData.append('first_name', profile?.first_name.trim());
    if (fieldType.includes('sms')) {
      formData.append('mobile_no', value.trim());
    } else if (fieldType.includes('email')) {
      formData.append('email_id', value.trim());
    }

    updateMyProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempProfile = {...res.data.profile};
          tempProfile = {
            ...tempProfile,
            name: htmlDecodeText(tempProfile.name),
            first_name: htmlDecodeText(tempProfile.first_name),
            last_name: htmlDecodeText(tempProfile.last_name),
            bio_data: htmlDecodeText(tempProfile.bio_data),
          };
          dispatch(setMyProfile(tempProfile));
          navigation.navigate('EmailPhoneVerification', {
            otpType: fieldType,
            isGoBack: true,
          });
          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

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
    if (parseInt(profile?.is_email_id_verified) === 1) {
      return true;
    }
    setconfirmationBoxData({isOpen: true, verificationField: 'email'});

    return false;
  }

  function isMobileVerified() {
    if (parseInt(profile?.is_mobile_no_verified) === 1) {
      return true;
    }
    setconfirmationBoxData({isOpen: true, verificationField: 'sms'});

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

  function updateSwitchStatus(id, fieldName, extraFieldName, extraValue) {
    setswitchStatus(preData => {
      const changedStatus = getChangedStatus(preData[fieldName], id);
      let tempPreData = {...preData, [fieldName]: changedStatus};
      if (extraFieldName) {
        tempPreData = {...tempPreData, [extraFieldName]: extraValue};
      }
      updateUsersSettingsAPICall(
        fieldName,
        changedStatus,
        preData[fieldName],
        extraFieldName,
        extraValue,
      );
      return {...tempPreData};
    });
  }

  function changeSwitchStatus(id, fieldName) {
    switch (id) {
      case 1:
        isEmailVerified() && updateSwitchStatus(id, fieldName);
        return;
      case 2:
        if (isMobileVerified()) {
          const changedStatus = getChangedStatus(switchStatus[fieldName], id);
          if (
            changedStatus?.split('')[1] &&
            parseInt(changedStatus?.split('')[1]) === 1
          ) {
            if (settings.opt_in === 0) {
              setoptinConfirmationData({
                status: true,
                text: 'By enabling SMS, you agree to receive text messages from Rawcaster.com. Message and data rates may apply. If you wish to STOP receiving SMS messages from Rawcaster.com, please disable this option.',
                updatedOptinValue: 1,
                id,
                fieldName,
              });
            } else {
              updateSwitchStatus(id, fieldName);
            }
          } else {
            updateSwitchStatus(id, fieldName);
          }
        }
        // isMobileVerified() && updateSwitchStatus(id, fieldName);
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
            if (
              (otpType === 'email' && profile?.email_id) ||
              (otpType === 'sms' && profile?.mobile)
            ) {
              navigation.navigate('EmailPhoneVerification', {
                otpType: otpType,
                isGoBack: true,
              });
            } else {
              setverificationInputModalData({
                isOpen: true,
                verificationField: otpType,
              });
            }
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
          title={`Enter your ${
            verificationInputModalData.verificationField === 'sms'
              ? 'Phone Number'
              : 'Email'
          } to verify`}
          submitButtonProps={{
            buttonText: 'Update and Verify',
          }}
          textInputProps={{
            placeHolder:
              verificationInputModalData.verificationField === 'sms'
                ? 'Phone Number'
                : 'Email',
            keyboardType:
              verificationInputModalData.verificationField === 'sms'
                ? 'number-pad'
                : 'email-address',
          }}
          onSubmit={value => {
            const otpType = verificationInputModalData.verificationField;
            closeVerificationInputModal();

            handleUpdateProfile(value, otpType);
          }}
        />
      </Modal>

      <Modal
        onRequestClose={() => {}}
        transparent
        visible={optinConfirmationData.status}>
        <ConfirmationPopup
          isEnableClose={false}
          positiveButtonText={'Confirm'}
          onPressPositiveButton={() => {
            updateSwitchStatus(
              optinConfirmationData.id,
              optinConfirmationData.fieldName,
              'opt_in',
              optinConfirmationData.updatedOptinValue,
            );
            if (isMount) {
              setoptinConfirmationData({
                status: false,
                text: '',
                updatedOptinValue: null,
                fieldName: '',
                id: null,
              });
            }
          }}
          negativeButtonText={'Cancel'}
          onPressNegativeButton={() => {
            if (isMount) {
              setoptinConfirmationData({
                status: false,
                text: '',
                updatedOptinValue: null,
                fieldName: '',
                id: null,
              });
            }
          }}
          content={optinConfirmationData.text}
        />
      </Modal>

      <Modal visible={isLoading} transparent>
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Profile Updating'}
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
