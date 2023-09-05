import {Alert, Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useSettings,
  useToken,
} from '../../../Utilities/StoreData';
import DropDownPicker from '../../../Components/DropDownPicker';
import {
  ACCOUNT_ACTIVE_STATUS_LIST,
  DEFAULT_DATE_FORMAT_LIST,
  DEFAULT_PAGES_LIST,
  DISPLAY_CHOICES_LIST,
  VISIBLE_CHOICES_LIST,
} from '../../../Utilities/Constants';
import {COLORS} from '../../../Utilities/Colors';
import RadioButton from '../../../Components/RadioButton';
import {
  getLanguageListService,
  getTimeZoneService,
  updateUserSettingsService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import MultiItemsSelectList from '../../../Modals/MultiItemsSelectList';
import {setSettings} from '../../../Store/Slices/AuthSlice';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {removeToken} from '../../../Utilities/Methods';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import {setTranslatedNuggets} from '../../../Store/Slices/NuggetActionsSlice';

var isMount = true;
const CHOICE_CONTAINERS_LIST = [
  {
    fieldName: 'phone_display_status',
    listFieldName: 'phone_group_list',
    title: 'Phone',
    listType: 1,
  },
  {
    fieldName: 'location_display_status',
    listFieldName: 'location_group_list',
    title: 'Location',
    listType: 1,
  },
  {
    fieldName: 'dob_display_status',
    listFieldName: 'dob_group_list',
    title: 'DOB',
    listType: 1,
  },
  {
    fieldName: 'bio_display_status',
    listFieldName: 'bio_group_list',
    title: 'Bio Data',
    listType: 1,
  },
  {
    fieldName: 'online_status',
    listFieldName: 'online_group_list',
    title: 'Online Status',
    listType: 1,
  },
  {
    fieldName: 'public_nugget_display',
    listFieldName: 'nugget_display_list',
    title: 'Nugget Display Option',
    listType: 2,
  },
  {
    fieldName: 'public_event_display',
    listFieldName: 'event_display_list',
    title: 'Event Display Option',
    listType: 2,
  },
];

const PRIVACY_SWITCHES_LIST = [
  {
    id: 1,
    name: 'Nugget',
    fieldName: 'lock_nugget',
  },
  {
    id: 2,
    name: 'Fans',
    fieldName: 'lock_fans',
  },
  {
    id: 3,
    name: 'My Connections',
    fieldName: 'lock_my_connection',
  },
  {
    id: 4,
    name: 'My Influencer',
    fieldName: 'lock_my_influencer',
  },
];

const GeneralSettings = () => {
  const dispatch = useDispatch();
  const token = useToken();
  const settings = useSettings();
  const groupsList = useGroupsList();
  const connectionsList = useConnectionsList();
  const profile = useProfile();
  const [specificUsersModalData, setspecificUsersModalData] = useState({
    isOpenModal: false,
    selectedId: null,
    fieldName: '',
    listFieldName: '',
    specificListType: null, // 1 - connections, 2 - group
  });

  const [loaderText, setloaderText] = useState(
    'Fetching Languages and Timezones',
  );
  const [isLoading, setisLoading] = useState(true);
  const [languagesList, setlanguagesList] = useState([]);
  const [readoutLanguagesList, setreadoutLanguagesList] = useState([]);
  const [timeZonesList, settimeZonesList] = useState([]);
  const [settingsData, setsettingsData] = useState({
    phone_display_status: settings?.phone_display_status,
    location_display_status: settings?.location_display_status,
    dob_display_status: settings?.dob_display_status,
    bio_display_status: settings?.bio_display_status,
    online_status: settings?.online_status,
    public_nugget_display: settings?.public_nugget_display,
    public_event_display: settings?.public_event_display,
    account_active_inactive: settings?.account_active_inactive,
    mobile_default_page: settings?.mobile_default_page,
    language_id: settings?.language_id,
    read_out_language_id: settings?.read_out_language_id,
    default_date_format: settings?.default_date_format?.toString().trim(),
    time_zone: settings?.time_zone,
    lock_fans: settings?.lock_fans,
    lock_my_connection: settings?.lock_my_connection,
    lock_my_influencer: settings?.lock_my_influencer,
    lock_nugget: settings?.lock_nugget,
  });

  const [selectedChoiceUserGroupListData, setselectedChoiceUserGroupListData] =
    useState({
      phone_group_list: settings?.phone_group_list ?? [],
      location_group_list: settings?.location_group_list ?? [],
      dob_group_list: settings?.dob_group_list ?? [],
      bio_group_list: settings?.bio_group_list ?? [],
      online_group_list: settings?.online_group_list ?? [],
      nugget_display_list: settings?.nugget_display_list ?? [],
      event_display_list: settings?.event_display_list ?? [],
    });

  useEffect(() => {
    isMount = true;
    initialAPICalls();

    return () => {
      isMount = false;
    };
  }, []);

  function closeSpecificUsersModal() {
    if (isMount) {
      setspecificUsersModalData({
        isOpenModal: false,
        selectedId: null,
        fieldName: '',
        listFieldName: '',
        specificListType: null, // 1 - connections, 2 - group
      });
    }
  }

  function initialAPICalls() {
    const formData = new FormData();
    formData.append('token', token);
    Promise.all([
      getLanguageListService(formData),
      getTimeZoneService(formData),
    ])
      .then(res => {
        if (res[0].data.status === 1) {
          if (isMount) {
            setlanguagesList(res[0].data.language_list);
            setreadoutLanguagesList(res[0].data.read_out_language_list);
          }
        }
        return res;
      })
      .then(res => {
        if (res[1].data.status === 1) {
          if (isMount) {
            settimeZonesList(res[1].data.timezone_list);
          }
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function updateUsersSettingsAPICall(
    keyText,
    valueText,
    reduxData = undefined,
    otherKeyText,
    isLogout = false,
  ) {
    if (isMount) {
      setloaderText('Settings Updating');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append(otherKeyText ?? keyText, valueText);
    updateUserSettingsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(
            setSettings({...settings, [keyText]: reduxData ?? valueText}),
          );
          if (keyText === 'read_out_language_id') {
            dispatch(setTranslatedNuggets([]));
          }
          if (isLogout) {
            removeToken(dispatch);
          }
          Toast.success(res.data.msg);
        } else if (res.data.status === 0) {
          setsettingsData(preData => {
            return {...preData, [keyText]: settings[keyText]};
          });
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        setsettingsData(preData => {
          return {...preData, [keyText]: settings[keyText]};
        });
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  }

  function getDefaultPage() {
    return [...DEFAULT_PAGES_LIST].find(
      item => item.id === settingsData.mobile_default_page,
    );
  }

  function getSelectedLanguage() {
    return [...languagesList].find(
      item => item.id === settingsData.language_id,
    );
  }

  function getSelectedReadOutLanguage() {
    return [...readoutLanguagesList].find(
      item => item.id === settingsData.read_out_language_id,
    );
  }

  function getSelectedTimeZone() {
    return {name: settingsData.time_zone};
  }

  function getDefaultDateFormate() {
    return [...DEFAULT_DATE_FORMAT_LIST].find(
      item => item.type === settingsData.default_date_format,
    );
  }

  function onPressInActiveAccount() {
    Alert.alert(
      'Inactive Account!',
      'Are you sure you want to inactivate your Rawcaster Account?',
      [
        {
          text: 'No',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            if (isMount) {
              handleChangeSettingsData(
                0,
                'account_active_inactive',
                undefined,
                undefined,
                true,
              );
            }
          },
        },
      ],
      {cancelable: false},
    );
  }

  function handleChangeSettingsData(
    valueText,
    keyText,
    reduxData = undefined,
    otherKeyText,
    isLogout = false,
  ) {
    setsettingsData(preData => {
      if (preData[keyText] !== valueText) {
        updateUsersSettingsAPICall(
          keyText,
          valueText,
          reduxData,
          otherKeyText,
          isLogout,
        );
      }
      return {
        ...preData,
        [keyText]: valueText,
      };
    });
  }

  function getEnabledSwitchesIds() {
    return [...PRIVACY_SWITCHES_LIST]
      .filter(item => settingsData[item.fieldName] === 1)
      .map(item => item.id);
  }

  function RowContainer({leftText = '', rightText = ''}) {
    return (
      <View style={styles.rowContainer}>
        <StyledText style={styles.titleText}>{leftText}: </StyledText>
        <StyledText>{rightText}</StyledText>
      </View>
    );
  }
  function ChoiceContainer({
    title = '',
    selectedId,
    choiceList = [...VISIBLE_CHOICES_LIST],
    onSelectRadioOption,
  }) {
    return (
      <View style={styles.choiceContainer}>
        <StyledText style={styles.titleText}>{title}</StyledText>
        <View style={styles.optionsContainer}>
          {choiceList.map(item => {
            return (
              <RadioButton
                key={item.id.toString()}
                isSelected={selectedId === item.id}
                text={item.name}
                onPress={() => {
                  onSelectRadioOption(item.id);
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <HeaderWithBack title="General Settings" isEnableSafeArea />
      <View style={styles.contentContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{flex: 1}}
          bounces={false}>
          <RowContainer
            leftText="User Status"
            rightText={profile?.user_status}
          />
          <RowContainer leftText="User Type" rightText={profile?.user_type} />
          <DropDownPicker
            title="Default Rawcaster page"
            value={getDefaultPage()}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={DEFAULT_PAGES_LIST}
            fieldName="type"
            onSelectItem={selectedItem => {
              handleChangeSettingsData(selectedItem.id, 'mobile_default_page');
            }}
          />
          {CHOICE_CONTAINERS_LIST.map(item => {
            const list =
              item.listType === 2
                ? [...DISPLAY_CHOICES_LIST]
                : [...VISIBLE_CHOICES_LIST];
            return (
              <ChoiceContainer
                key={item.fieldName.toString()}
                title={item.title}
                selectedId={settingsData[item.fieldName]}
                choiceList={list}
                onSelectRadioOption={selectedId => {
                  if (isMount) {
                    if (item.listType === 1 && selectedId === 3) {
                      setspecificUsersModalData({
                        isOpenModal: true,
                        fieldName: item.fieldName,
                        listFieldName: item.listFieldName,
                        selectedId,
                        specificListType: 2,
                      });
                    } else if (
                      item.listType === 2 &&
                      [3, 5].includes(selectedId)
                    ) {
                      setspecificUsersModalData({
                        isOpenModal: true,
                        fieldName: item.fieldName,
                        listFieldName: item.listFieldName,
                        selectedId,
                        specificListType: selectedId === 3 ? 1 : 2,
                      });
                    } else {
                      handleChangeSettingsData(selectedId, item.fieldName);
                    }
                  }
                }}
              />
            );
          })}

          <SwtchesContainer
            title="Profile Privacy"
            description="Choose if you want to lock your Nuggets, Fans, Connections and Influencers list from other users"
            switchItemContainerStyle={{width: '48%', marginBottom: 10}}
            isSwitchesFlexStart={true}
            switchesList={[...PRIVACY_SWITCHES_LIST]}
            onStatusSwitchesIdsList={getEnabledSwitchesIds()}
            onChangeButtonStatus={id => {
              setsettingsData(preData => {
                let tempSettingsData = {...preData};
                let changeSwitchIndex = [...PRIVACY_SWITCHES_LIST].findIndex(
                  item => item.id === id,
                );
                if (changeSwitchIndex !== -1) {
                  const fieldName =
                    PRIVACY_SWITCHES_LIST[changeSwitchIndex].fieldName;
                  const changedStatus = Boolean(tempSettingsData[fieldName])
                    ? 0
                    : 1;
                  tempSettingsData = {
                    ...tempSettingsData,
                    [fieldName]: changedStatus,
                  };
                  updateUsersSettingsAPICall(fieldName, changedStatus);
                }
                return tempSettingsData;
              });
            }}
          />

          {false && (
            <DropDownPicker
              title="Preference Language"
              value={getSelectedLanguage()}
              listTitle=""
              titleStyle={styles.titleText}
              borderColor={COLORS.borderColor}
              dataList={languagesList}
              fieldName="name"
              onSelectItem={selectedItem => {
                handleChangeSettingsData(selectedItem.id, 'language_id');
              }}
            />
          )}
          <DropDownPicker
            title="Readout Language"
            value={getSelectedReadOutLanguage()}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={readoutLanguagesList}
            fieldName="name"
            onSelectItem={selectedItem => {
              handleChangeSettingsData(selectedItem.id, 'read_out_language_id');
            }}
          />
          <DropDownPicker
            title="Timezone"
            value={getSelectedTimeZone()}
            listTitle="Timezone Selection"
            listType="large"
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={timeZonesList}
            fieldName="name"
            onSelectItem={selectedItem => {
              handleChangeSettingsData(selectedItem.name, 'time_zone');
            }}
          />
          <DropDownPicker
            title="Date Format"
            value={getDefaultDateFormate()}
            listTitle=""
            titleStyle={styles.titleText}
            borderColor={COLORS.borderColor}
            dataList={DEFAULT_DATE_FORMAT_LIST}
            fieldName="type"
            onSelectItem={selectedItem => {
              handleChangeSettingsData(
                selectedItem.type,
                'default_date_format',
                undefined,
                'date_format',
              );
            }}
          />

          <ChoiceContainer
            title="Rawcaster Account"
            selectedId={settingsData.account_active_inactive}
            choiceList={[...ACCOUNT_ACTIVE_STATUS_LIST]}
            onSelectRadioOption={selectedId => {
              if (selectedId === 0) {
                onPressInActiveAccount();
              } else {
                handleChangeSettingsData(selectedId, 'account_active_inactive');
              }
            }}
          />
        </ScrollView>
      </View>

      <Modal
        visible={specificUsersModalData.isOpenModal}
        statusBarTranslucent
        onRequestClose={() => {
          closeSpecificUsersModal();
        }}>
        <MultiItemsSelectList
          title={
            specificUsersModalData.specificListType === 2
              ? 'Specific Group'
              : 'Specific Connection'
          }
          preSelectedIds={
            settingsData[specificUsersModalData.fieldName] ===
            specificUsersModalData.selectedId
              ? selectedChoiceUserGroupListData[
                  specificUsersModalData.listFieldName
                ]
              : []
          }
          imageFieldName={
            specificUsersModalData.specificListType === 2
              ? 'group_icon'
              : 'profile_img'
          }
          onCloseModal={() => {
            closeSpecificUsersModal();
          }}
          displayFieldName={
            specificUsersModalData.specificListType === 2
              ? 'group_name'
              : 'display_name'
          }
          idFieldName={
            specificUsersModalData.specificListType === 2
              ? 'group_id'
              : 'user_id'
          }
          list={
            specificUsersModalData.specificListType === 2
              ? groupsList
              : connectionsList
          }
          onSelectItems={list => {
            closeSpecificUsersModal();
            if (isMount) {
              setselectedChoiceUserGroupListData(preData => ({
                ...preData,
                [specificUsersModalData.listFieldName]: [...list],
              }));
              setsettingsData(preData => ({
                ...preData,
                [specificUsersModalData.fieldName]:
                  specificUsersModalData.selectedId,
              }));
              // setshareConnectionsGroupsIdsList(list);
            }
          }}
          noDataText={
            specificUsersModalData.specificListType === 2
              ? 'No Groups Found'
              : 'No Connections Found'
          }
        />
      </Modal>
      <Modal visible={isLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} loaderText={loaderText} />
      </Modal>
    </View>
  );
};

export default GeneralSettings;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  titleText: {
    fontFamily: FONTS.DMSans.bold,
  },
  choiceContainer: {
    paddingVertical: 10,
  },
  optionsContainer: {
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
});
