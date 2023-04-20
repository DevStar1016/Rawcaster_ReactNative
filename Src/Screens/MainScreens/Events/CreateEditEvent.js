import {Keyboard, Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {useFormik} from 'formik';
import * as yup from 'yup';
import {useProfile, useSettings, useToken} from '../../../Utilities/StoreData';
import {COLORS} from '../../../Utilities/Colors';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import ReplaceStatusBar from '../../../Components/ReplaceStatusBar';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import TextBox from '../../../Components/TextBox';
import DropDownPicker from '../../../Components/DropDownPicker';
import {
  getDisplayEventDate,
  getDisplayEventTime,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  getEventTypeService,
  viewEventService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import CheckBox from '../../../Components/CheckBox';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import SubmitButton from '../../../Components/SubmitButton';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../../Components/Loader';
import {EVENT_LAYOUT_LIST} from '../../../Utilities/Constants';

var isMount = true;

const validationSchema = yup.object({
  eventTitle: yup
    .string()
    .min(1, 'Invalid Event Title.')
    .max(60, 'Invalid Event Title.')
    .required('Event Title is required.'),
  eventTime: yup.string().required('Select valid Time'),
  maxParticipants: yup.string().required('Enter valid Participants'),
});

const SWITCHES_LIST = [
  {
    id: 1,
    name: 'Host',
    status: true,
  },
  {
    id: 2,
    name: 'Guest',
    status: true,
  },
];

var isMount = true;
const CreateEditEvent = ({route}) => {
  const navigation = useNavigation();
  const token = useToken();
  const profile = useProfile();
  const settings = useSettings();
  const eventId =
    route.params && route.params.eventId ? route.params.eventId : null;
  const [eventDetails, seteventDetails] = useState(null);
  const [eventTypesList, seteventTypesList] = useState([]);
  const [liveEventDate, setliveEventDate] = useState(new Date());
  const [loaderText, setloaderText] = useState('Fetching Event Types');
  const [isLoading, setisLoading] = useState(true);
  const [invitedUsersList, setinvitedUsersList] = useState([]);
  const [selectedConnectionsIdsList, setselectedConnectionsIdsList] = useState(
    [],
  );
  const [selectedGroupsIdsList, setselectedGroupsIdsList] = useState([]);
  const [selectedValues, setselectedValues] = useState({
    eventVisibilityTypeId: settings.event_type,
    event_layout_id: 1,
    melody: null,
    eventDuration: new Date(
      moment(
        '2021-01-05 ' +
          `${settings.max_event_duration <= 9 ? '0' : ''}${parseInt(
            settings.max_event_duration,
          )}:00:00`,
      ),
    ),
    durationError: '',
    waiting_room: parseInt(settings.waiting_room),
    join_before_host: parseInt(settings.join_before_host),
    sound_notify: parseInt(settings.participant_join_sound),
    user_screenshare: parseInt(settings.screen_share_status),
  });

  const {handleSubmit, handleChange, values, errors, setValues, setFieldValue} =
    useFormik({
      initialValues: {
        eventTitle: 'Rawcaster Event',
        eventDate: moment().format('YYYY-MM-DD'),
        eventTime: moment().add(15, 'minute'),
        maxParticipants: '25',
      },
      validationSchema: validationSchema,
      onSubmit: values => {
        // Keyboard.dismiss();
        // if (eventVisibilityTypeError()) {
        //   Toast.fail(
        //     'Event type is Private, you must select the participants.',
        //   );
        // } else {
        //   if (isMount) {
        //     setloaderText(`${eventId ? 'Editing' : 'Creating'} Event...`);
        //     setisLoading(true);
        //   }
        //   if (eventId) {
        //     editTalkshowAPICall();
        //   } else {
        //     createEventAPICall();
        //   }
        // }
      },
    });

  useEffect(() => {
    isMount = true;
    getEventVisibilityTypesAPICall();
    // if (eventId) {
    //   getEventDetailsAPICall();
    // }
    return () => {
      isMount = false;
    };
  }, []);

  function getEventDetailsAPICall() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_id', eventId);
    viewEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          // seteventDetails({
          //   ...res.data.event_detail,
          //   event_name: htmlDecodeText(res.data.event_detail.event_name),
          // });
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
  }

  const eventVisibilityTypeError = () => {
    return (
      selectedValues.eventVisibilityTypeId === 2 &&
      selectedConnectionsIdsList.length <= 0 &&
      selectedGroupsIdsList.length <= 0 &&
      invitedUsersList.length <= 0
    );
  };

  const getEventVisibilityTypesAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    getEventTypeService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data.event_types, 'TPEEE');
          seteventTypesList(res.data.event_types);
          setselectedValues(preData => ({
            ...preData,
            eventVisibilityTypeId:
              settings.event_type ?? res.data.event_types[0].id,
          }));
        }
      })
      .catch(e => {})
      .finally(() => {
        // if (eventId) {
        //   setloaderText('Fetching Event Details');
        //   getEventDetailsAPICall();
        // } else {
        //   if (isMount) {
        //     setisLoading(false);
        //   }
        // }
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const onSelectDuration = date => {
    let actualDurationallowed = settings.max_event_duration;
    let selectedDuration = moment(date).format('HH:mm');
    let durationSelected = selectedDuration.replace(/[':]+/g, '.');
    if (
      moment('2022-02-16T00:14:00').format('HH:mm') >=
      moment(date).format('HH:mm')
    ) {
      setselectedValues(preData => ({
        ...preData,
        eventDuration: '',
        durationError: 'Duration must be minimum 15 minutes',
      }));
      return;
    }
    if (parseFloat(durationSelected) > settings.max_event_duration) {
      setselectedValues(preData => ({
        ...preData,
        eventDuration: '',
        durationError: `Max Allowed hours is ${settings.max_event_duration}`,
      }));
      return;
    }
    let allowedDuration = moment(actualDurationallowed + ':00', 'HH:mm')
      .format('HH:mm')
      .toString();
    allowedDuration = parseFloat(allowedDuration.replace(':', '.'));
    selectedDuration = parseFloat(selectedDuration.replace(':', '.'));
    if (selectedDuration > allowedDuration && profile.user_status_id === 1) {
      // setTimeout(() => {
      //   setaccUpgradePopup(true);
      // }, 500);
      // setselectedValues(preData => ({...preData, eventDuration: ''}));
      // setdurationError('Duration must be minimum 15 minutes');
    } else {
      setselectedValues(preData => ({
        ...preData,
        eventDuration: date,
        durationError: '',
      }));
    }
  };

  const onSelectEventDate = selectedDate => {
    if (isMount) {
      setliveEventDate(selectedDate);
    }
    if (
      moment(new Date()).format('DD:MM:YYYY') ==
      moment(selectedDate).format('DD:MM:YYYY')
    ) {
      if (
        !(moment().format('HH:mm') < moment(values.eventTime).format('HH:mm'))
      ) {
        setFieldValue('eventTime', new Date());
      }
    }
  };

  const onSelectEventTime = selectedTime => {
    if (
      moment().format('DD:MM:YYYY') ==
      moment(liveEventDate).format('DD:MM:YYYY')
    ) {
      if (
        moment().add(10, 'minutes').format('HH:mm') <
        moment(selectedTime).format('HH:mm')
      ) {
        setFieldValue('eventTime', selectedTime);
      } else {
        setFieldValue('eventTime', '');
      }
    } else {
      setFieldValue('eventTime', selectedTime);
    }
  };

  const getEventVisibilityType = (
    eventTypeId = selectedValues.eventVisibilityTypeId,
  ) => {
    return [...eventTypesList].find(item => item.id === eventTypeId);
  };

  const getDisplayDuration = () => {
    return selectedValues.eventDuration
      ? moment(selectedValues.eventDuration).format('HH:mm').toString()
      : '';
  };

  const getLayoutValue = () => {
    return [...EVENT_LAYOUT_LIST].find(
      item => item.id === selectedValues.event_layout_id,
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <ReplaceStatusBar />
      <HeaderWithBack
        title={'Create virtual meeting event'}
        //  title={eventId ? 'Edit Event' : 'Create Event'}
      />
      <KeyboardAwareScrollView
        extraScrollHeight={10}
        contentContainerStyle={{paddingBottom: 30}}
        style={{paddingHorizontal: 10}}
        enableOnAndroid={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'handled'}
        scrollEnabled={true}>
        <TextBox
          title="Event Title"
          value={values.eventTitle}
          onChangeText={handleChange('eventTitle')}
          errorText={errors.eventTitle}
          placeHolder="Event Title"
          maxLength={60}
          mainContainerMarginVertical={0}
          mainContainerMarginTop={15}
          inputContainerMarginVertical={5}
          titlePaddingVertical={5}
        />
        <DropDownPicker
          title="Event Type"
          dataList={[...eventTypesList]}
          value={getEventVisibilityType()}
          fieldName="type"
          placeHolderText="Event Type"
          onSelectItem={item => {
            setselectedValues(preData => ({
              ...preData,
              eventVisibilityTypeId: item.id,
            }));
          }}
        />
        <DropDownPicker
          title="Date"
          isDateTime
          value={getDisplayEventDate(
            liveEventDate,
            settings.default_date_format,
          )}
          dateValue={liveEventDate}
          dropDownIcon="calendar_black"
          placeHolderText="Date"
          onSelectItem={onSelectEventDate}
        />
        <DropDownPicker
          title="Time"
          isDateTime
          mainContainerMarginVertical={0}
          errorText={errors.eventTime}
          inputContainerMarginVertical={5}
          titlePaddingVertical={5}
          value={getDisplayEventTime(values.eventTime)}
          dateValue={values.eventTime}
          datePickerProps={{
            mode: 'time',
            is24Hour: false,
          }}
          dropDownIcon="clock_black"
          placeHolderText={getDisplayEventTime(new Date())}
          onSelectItem={onSelectEventTime}
        />
        <View style={styles.horizontalBoxesContainer}>
          <TextBox
            title="Max Participants"
            value={values.maxParticipants.toString()}
            onChangeText={text => {
              if (!isNaN(text) && !text.includes('.') && !text.includes(' ')) {
                setFieldValue('maxParticipants', text);
              }
            }}
            errorText={errors.maxParticipants}
            mainContainerWidth={'48%'}
            keyboardType="number-pad"
            placeHolder="Participants"
            maxLength={60}
            mainContainerMarginVertical={0}
            mainContainerMarginTop={0}
            inputContainerMarginVertical={5}
            titlePaddingVertical={5}
          />
          <DropDownPicker
            title="Duration"
            isDateTime
            mainContainerMarginVertical={0}
            mainContainerWidth={'48%'}
            errorText={selectedValues.durationError}
            inputContainerMarginVertical={5}
            titlePaddingVertical={5}
            value={getDisplayDuration()}
            dateValue={selectedValues.eventDuration}
            datePickerProps={{
              mode: 'time',
              is24Hour: true,
            }}
            dropDownIcon="clock_black"
            placeHolderText={'Select Duration'}
            onSelectItem={onSelectDuration}
          />
        </View>
        <View style={styles.horizontalBoxesContainer}>
          <DropDownPicker
            title="Layout"
            dataList={EVENT_LAYOUT_LIST}
            mainContainerWidth={'48%'}
            value={getLayoutValue()}
            fieldName="name"
            placeHolderText="Layout"
            onSelectItem={item => {
              setselectedValues(preData => ({
                ...preData,
                event_layout_id: item.id,
              }));
            }}
          />
          <DropDownPicker
            title="Melody"
            dataList={[...eventTypesList]}
            mainContainerWidth={'48%'}
            value={getEventVisibilityType()}
            fieldName="type"
            placeHolderText="Melody"
            onSelectItem={item => {
              setselectedValues(preData => ({
                ...preData,
                eventVisibilityTypeId: item.id,
              }));
            }}
          />
        </View>
        <CheckBox
          text="Waiting Room"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.waiting_room)}
          onPress={() => {
            setselectedValues(preData => ({
              ...preData,
              waiting_room: Boolean(preData.waiting_room) ? 0 : 1,
            }));
          }}
        />
        <CheckBox
          text="Join before host"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.join_before_host)}
          onPress={() => {
            setselectedValues(preData => ({
              ...preData,
              join_before_host: Boolean(preData.join_before_host) ? 0 : 1,
            }));
          }}
        />
        <CheckBox
          text="Use Sound to notify"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.sound_notify)}
          onPress={() => {
            setselectedValues(preData => ({
              ...preData,
              sound_notify: Boolean(preData.sound_notify) ? 0 : 1,
            }));
          }}
        />
        <CheckBox
          text="Allow participant to share screen"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.user_screenshare)}
          onPress={() => {
            setselectedValues(preData => ({
              ...preData,
              user_screenshare: Boolean(preData.user_screenshare) ? 0 : 1,
            }));
          }}
        />
        <SwtchesContainer
          title="Default Audio Settings"
          switchesList={[...SWITCHES_LIST]}
          isSwitchesFlexStart
          onStatusSwitchesIdsList={[...SWITCHES_LIST].map(item => item.id)}
          onChangeButtonStatus={id => {
            // setconnectionRequestSwitchStatus(preStatus => {
            //   return getChangedStatus(preStatus, id);
            // });
          }}
        />

        <SwtchesContainer
          title="Default Video Settings"
          switchesList={[...SWITCHES_LIST]}
          isSwitchesFlexStart
          onStatusSwitchesIdsList={[...SWITCHES_LIST].map(item => item.id)}
          onChangeButtonStatus={id => {
            // setconnectionRequestSwitchStatus(preStatus => {
            //   return getChangedStatus(preStatus, id);
            // });
          }}
        />
        <View style={styles.buttonContainer}>
          <SubmitButton
            buttonText="Cancel"
            borderRadius={20}
            bgColor={COLORS.white}
            borderWidth={1}
            borderColor={COLORS.black}
            textColor={COLORS.black}
            paddingVertical={5}
            paddingHorizontal={25}
            marginHorizontal={10}
            onPress={() => {}}
          />
          <SubmitButton
            buttonText="Next"
            borderRadius={20}
            bgColor={COLORS.radioSelectedColor}
            borderWidth={0}
            borderColor={COLORS.black}
            textColor={COLORS.black}
            paddingVertical={5}
            paddingHorizontal={35}
            marginHorizontal={10}
            onPress={() => {
              navigation.navigate('CreateEditEventSecond');
            }}
          />
        </View>
      </KeyboardAwareScrollView>
      <Modal visible={isLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} loaderText={loaderText} />
      </Modal>
    </View>
  );
};

export default CreateEditEvent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  horizontalBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
