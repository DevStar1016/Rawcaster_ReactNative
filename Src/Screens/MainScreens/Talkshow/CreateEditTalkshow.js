import {Keyboard, Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import moment from 'moment';
import {useFormik} from 'formik';
import * as yup from 'yup';
import HOCView from '../../../Components/HOCView';
import TextBox from '../../../Components/TextBox';
import DropDownPicker from '../../../Components/DropDownPicker';
import {EVENT_VISIBILITY_TYPE_LIST} from '../../../Utilities/Constants';
import {useSettings, useToken} from '../../../Utilities/StoreData';
import {
  getDisplayEventDate,
  getDisplayEventTime,
} from '../../../Utilities/Methods';
import EventImagePicker from '../EventsAndTalkshowsCommon/EventImagePicker';
import Toast from '../../../Components/Toast';
import ConnectionGroupsListContainer from '../EventsAndTalkshowsCommon/ConnectionGroupsListContainer';
import SubmitButton from '../../../Components/SubmitButton';
import {COLORS} from '../../../Utilities/Colors';
import StyledText from '../../../Components/StyledText';
import {
  addLiveEventService,
  getEventTypeService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import {useNavigation} from '@react-navigation/native';

var isMount = true;

const validationSchema = yup.object({
  eventTitle: yup
    .string()
    .min(1, 'Invalid event Title.')
    .required('Event Title required.'),
  eventTime: yup.string().required('Select valid Time'),
});
const CreateEditTalkshow = () => {
  const token = useToken();
  const settings = useSettings();
  const navigation = useNavigation();
  const [eventVisibilityType, seteventVisibilityType] = useState(null);

  const [bannerImage, setbannerImage] = useState(null);
  const [eventTypesList, seteventTypesList] = useState([]);
  const [inviteUserText, setinviteUserText] = useState('');
  const [liveEventDate, setliveEventDate] = useState(new Date());
  const [invitedUsersList, setinvitedUsersList] = useState([]);
  const inviteUserInputRef = useRef(null);
  const [selectedConnectionsIdsList, setselectedConnectionsIdsList] = useState(
    [],
  );
  const [loaderText, setloaderText] = useState('Fetching Event Types');
  const [selectedGroupsIdsList, setselectedGroupsIdsList] = useState([]);
  const [isLoading, setisLoading] = useState(true);

  const {handleSubmit, handleChange, values, errors, touched, setFieldValue} =
    useFormik({
      initialValues: {
        eventTitle: settings.event_name,
        eventTime: moment().add(15, 'minute'),
      },
      validationSchema: validationSchema,
      onSubmit: values => {
        Keyboard.dismiss();
        if (eventVisibilityTypeError()) {
          Toast.fail(
            'Event type is Private, you must select the participants.',
          );
        } else {
          if (isMount) {
            setloaderText('Creating Talkshow...');
            setisLoading(true);
          }
          createTalkshowAPICall();
        }
        // setisLoading(true);
        // handleLogin(values);
      },
    });

  useEffect(() => {
    isMount = true;
    getEventVisibilityTypesAPICall();
    return () => {
      isMount = false;
    };
  }, []);

  const getEventVisibilityTypesAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    getEventTypeService(formData)
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data.event_types);
          seteventVisibilityType(res.data.event_types[0]);
          seteventTypesList(res.data.event_types);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const createTalkshowAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_title', values.eventTitle);
    formData.append('event_type', eventVisibilityType.id);
    formData.append(
      'event_start_date',
      moment(liveEventDate).utc().format('YYYY-MM-DD'),
    );
    formData.append(
      'event_start_time',
      moment(values.eventTime).utc().format('HH:mm'),
    );
    if (bannerImage) {
      formData.append('event_banner', bannerImage);
    }
    formData.append(
      'event_invite_groups',
      JSON.stringify(selectedGroupsIdsList),
    );
    formData.append(
      'event_invite_friends',
      JSON.stringify(selectedConnectionsIdsList),
    );

    if (invitedUsersList) {
      formData.append('event_invite_mails', JSON.stringify(invitedUsersList));
    }

    addLiveEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'Talkshow'}],
          });
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

  const onSelectLiveEventTime = selectedTime => {
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

  const onSelectLiveEventDate = selectedDate => {
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

  const addInvitedUsers = () => {
    let newMail = [];
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let temp = inviteUserText.toLowerCase().replace(',', '');
    temp = temp.replace(' ', '');
    if (mailformat.test(temp) === false) {
      Toast.fail('Enter Valid Email id');
      if (isMount) {
        setinviteUserText(temp);
      }
      return;
    }
    if (invitedUsersList.includes(temp)) {
      Toast.fail('Email Already Added');
      if (isMount) {
        setinviteUserText(temp);
      }
      return;
    }
    const mailArr = inviteUserText.split(',').map(function (item) {
      return item.trim();
    });
    mailArr.forEach(val => {
      if (mailformat.test(val) === true) {
        newMail.push(val.toLowerCase());
      }
    });

    if (newMail.length >= 0) {
      if (isMount) {
        setinviteUserText('');
        setinvitedUsersList(prev => [...prev, ...newMail]);
      }

      // if (eventId) {
      //   setAddinvitedusers((prev) => [...prev, ...newMail]);
      // }
    } else {
      Toast.fail('Please enter valid email');
    }

    if (inviteUserInputRef.current) {
      inviteUserInputRef.current.focus();
    }
  };

  const handleRemoveInvitedUser = removeMailText => {
    let filteredInvitedUsersList = [...invitedUsersList].filter(
      mailText => mailText !== removeMailText,
    );
    if (isMount) {
      setinvitedUsersList(filteredInvitedUsersList);
    }
  };

  const onSelectUnSelectConnection = selectedId => {
    let tempList = [...selectedConnectionsIdsList];
    if (tempList.includes(selectedId)) {
      tempList = tempList.filter(id => id !== selectedId);
    } else {
      tempList.push(selectedId);
    }
    if (isMount) {
      setselectedConnectionsIdsList(tempList);
    }
  };

  const onSelectUnSelectGroup = selectedId => {
    let tempList = [...selectedGroupsIdsList];
    if (tempList.includes(selectedId)) {
      tempList = tempList.filter(id => id !== selectedId);
    } else {
      tempList.push(selectedId);
    }
    if (isMount) {
      setselectedGroupsIdsList(tempList);
    }
  };

  const eventVisibilityTypeError = () => {
    return (
      eventVisibilityType?.id === 2 &&
      selectedConnectionsIdsList.length <= 0 &&
      selectedGroupsIdsList.length <= 0 &&
      invitedUsersList.length <= 0
    );
  };

  return (
    <HOCView isEnableKeyboardAware backHeaderProps={{title: 'Create Talkshow'}}>
      <TextBox
        title="Event Title"
        value={values.eventTitle}
        onChangeText={handleChange('eventTitle')}
        errorText={errors.eventTitle}
        placeHolder="Event Title"
        mainContainerMarginVertical={0}
        mainContainerMarginTop={15}
        inputContainerMarginVertical={5}
        titlePaddingVertical={5}
      />
      <DropDownPicker
        title="Event Type"
        dataList={[...eventTypesList]}
        value={eventVisibilityType}
        fieldName="type"
        placeHolderText="Event Type"
        onSelectItem={seteventVisibilityType}
      />
      <DropDownPicker
        title="Date"
        isDateTime
        value={getDisplayEventDate(liveEventDate, settings.default_date_format)}
        dateValue={liveEventDate}
        dropDownIcon="calendar_black"
        placeHolderText="Date"
        onSelectItem={onSelectLiveEventDate}
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
        onSelectItem={onSelectLiveEventTime}
      />
      <EventImagePicker
        mainContainerStyle={{marginTop: 10}}
        selectedImage={bannerImage}
        setselectedImage={setbannerImage}
      />
      {eventVisibilityTypeError() && (
        <StyledText style={styles.errorText}>
          Event type is Private, you must select the participants.
        </StyledText>
      )}
      <TextBox
        innerRef={inviteUserInputRef}
        isVisible={eventVisibilityType?.id !== 3}
        title="Invite Users"
        placeHolder="Enter email address to send event invitation"
        value={inviteUserText}
        onChangeText={text => {
          if (isMount) {
            setinviteUserText(text);
          }
          if (text.includes(',') || text.includes(' ')) {
            addInvitedUsers();
          }
        }}
        isEnableListAppend
        appendedListProps={{
          list: invitedUsersList,
          onRemoveItem: handleRemoveInvitedUser,
        }}
        returnKeyType="send"
        clearButtonMode="while-editing"
        onSubmitEditing={addInvitedUsers}
        textAlignVertical={'top'}
      />

      <ConnectionGroupsListContainer
        isVisible={eventVisibilityType?.id !== 3}
        displayFieldName="display_name"
        idFieldName="friend_request_id"
        titleText="Connections"
        selectedAllButtonText="Remove All"
        onPressItem={onSelectUnSelectConnection}
        onPressSelectAll={(idsList, isSelectedAll) => {
          if (isMount) {
            if (isSelectedAll) {
              setselectedConnectionsIdsList(idsList);
            } else {
              setselectedConnectionsIdsList([]);
            }
          }
        }}
        selectAllButtonText="Invite All"
        type="connection"
        selectedIdsList={selectedConnectionsIdsList}
      />
      <ConnectionGroupsListContainer
        isVisible={eventVisibilityType?.id !== 3}
        displayFieldName="group_name"
        idFieldName="group_id"
        titleText="Groups"
        selectedAllButtonText="Remove All"
        onPressItem={onSelectUnSelectGroup}
        onPressSelectAll={(idsList, isSelectedAll) => {
          if (isMount) {
            if (isSelectedAll) {
              setselectedGroupsIdsList(idsList);
            } else {
              setselectedGroupsIdsList([]);
            }
          }
        }}
        selectAllButtonText="Add All"
        type="group"
        selectedIdsList={selectedGroupsIdsList}
      />

      <SubmitButton
        buttonText="Create Event"
        marginTop={10}
        onPress={() => {
          handleSubmit();
        }}
      />
      <SubmitButton
        buttonText="Cancel"
        bgColor={COLORS.white}
        textColor={COLORS.secondary}
        marginBottom={30}
        marginTop={10}
      />
      <Modal visible={isLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} loaderText={loaderText} />
      </Modal>
    </HOCView>
  );
};

export default CreateEditTalkshow;

const styles = StyleSheet.create({
  errorText: {
    color: COLORS.red,
    marginTop: 10,
  },
});
