import {Keyboard, Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import moment from 'moment';
import {useFormik} from 'formik';
import * as yup from 'yup';
import DocumentPicker from 'react-native-document-picker';
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
  getFileName,
  getSlicedText,
  getUtcToSystemTime,
  htmlDecodeText,
  utcToUserTimezone,
} from '../../../Utilities/Methods';
import {
  getEventMelodyService,
  getEventTypeService,
  viewEventService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import CheckBox from '../../../Components/CheckBox';
import SwtchesContainer from '../../../Components/SwtchesContainer';
import SubmitButton from '../../../Components/SubmitButton';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../../Components/Loader';
import {
  EVENT_LAYOUT_LIST,
  IS_IOS,
  RAWCASTER_DEFAULT_MESSAGE,
} from '../../../Utilities/Constants';
import SVGIcon from '../../../Components/SVGIcon';
import {FONTS} from '../../../Utilities/Fonts';
import StyledText from '../../../Components/StyledText';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import {setPremiumAlert} from '../../../Store/Slices/UtilitySlice';
import {useDispatch} from 'react-redux';
import CustomHourMinutePicker from '../../../Components/CustomHourMinutePicker';

var isMount = true;
const CreateEditEvent = ({route}) => {
  const navigation = useNavigation();
  const token = useToken();
  const profile = useProfile();
  const settings = useSettings();
  const dispatch = useDispatch();
  const {eventId, isFromEventSearch} = route.params ?? {};
  const [eventTypesList, seteventTypesList] = useState([]);
  const [liveEventDate, setliveEventDate] = useState(new Date());
  const [loaderText, setloaderText] = useState(
    'Fetching Event Types and Melodies',
  );
  const [isLoading, setisLoading] = useState(true);
  const [eventMelodies, seteventMelodies] = useState([]);
  const [selectedMelodyFile, setselectedMelodyFile] = useState(null);
  const [melodyFileError, setmelodyFileError] = useState('');

  const [selectedValues, setselectedValues] = useState({
    eventVisibilityTypeId: settings?.event_type,
    event_layout_id: 1,
    melody: {
      id: 1,
      type: 1,
    },
    eventDuration: new Date(
      moment('2021-01-05 ' + `${settings?.max_event_duration}:00`),
    ),
    durationError: '',
    maxParticipants: parseInt(settings?.max_event_participants_count),
    participantError: '',
    waiting_room: parseInt(settings?.waiting_room),
    join_before_host: parseInt(settings?.join_before_host),
    sound_notify: parseInt(settings?.participant_join_sound),
    user_screenshare: parseInt(settings?.screen_share_status),
    host_audio: parseInt(settings?.host_audio),
    participant_audio: parseInt(settings?.participant_audio),
    host_video: parseInt(settings?.host_video),
    participant_video: parseInt(settings?.participant_video),
    banner_image: null,
    selectedGroupsIdsList: [],
    removedGroupsIdsList: [],
    selectedConnectionsIdsList: [],
    removedConnectionsIdsList: [],
    invitedUsersList: [],
    removedInvitedUsersList: [],
  });

  const validationSchema = yup.object({
    eventTitle: yup
      .string()
      .min(1, 'Invalid Event Title.')
      .max(60, 'Invalid Event Title.')
      .required('Event Title is required.'),
    eventDescription: yup
      .string()
      .min(5, 'Invalid Event Description.')
      .max(120, 'Invalid Event Description.'),
    eventTime: yup.string().required('Select valid Time'),
  });

  const {handleSubmit, handleChange, values, errors, setValues, setFieldValue} =
    useFormik({
      initialValues: {
        eventTitle: 'Rawcaster Event',
        eventDescription: '',
        eventTime: moment().add(15, 'minute'),
      },
      validationSchema: validationSchema,
      onSubmit: values => {
        onSubmit(values);
      },
    });

  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    initialAPICalls();

    return () => {
      AvoidSoftInput.setAdjustPan();
      Keyboard.dismiss();
      isMount = false;
    };
  }, []);

  /**
   * Performs initial API calls to fetch event types and event melodies.
   * @returns None
   */
  function initialAPICalls() {
    const formData = new FormData();
    formData.append('token', token);
    Promise.all([
      getEventTypeService(formData),
      getEventMelodyService(formData),
    ])
      .then(res => {
        if (res[0].data.status === 1 || res[1].data.status === 1) {
          let tempSelectedData = {...selectedValues};
          if (res[0].data.status === 1) {
            seteventTypesList(res[0].data.event_types);

            tempSelectedData = {
              ...tempSelectedData,
              eventVisibilityTypeId:
                settings?.event_type ?? res[0].data.event_types[0].id,
            };
          }
          if (res[1].data.status === 1) {
            seteventMelodies([
              ...res[1].data.melody,
              {id: 0, title: 'Customize', type: 3},
            ]);
            tempSelectedData = {
              ...tempSelectedData,
              melody: {
                id: res[1].data.melody[0]?.id,
                type: res[1].data.melody[0]?.type,
              },
            };
          }
          setselectedValues(tempSelectedData);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          if (eventId) {
            setloaderText('Fetching Event Details');
            getEventDetailsAPICall();
          } else {
            setisLoading(false);
          }
        }
      });
  }

  /**
   * Handles the form submission for creating or editing an event.
   * @param {object} values - The form values submitted by the user.
   * @returns None
   */
  const onSubmit = values => {
    Keyboard.dismiss();
    if (selectedValues.durationError) {
      if (parseInt(profile?.user_status_id) === 4) {
        Toast.fail('Duration - ' + selectedValues.durationError);
      } else {
        dispatch(
          setPremiumAlert({
            status: true,
            text: `To host event for longer than ${settings?.max_event_duration} hours upgrade your membership!`,
          }),
        );
      }
    } else if (selectedValues.participantError) {
      if (
        parseInt(profile?.user_status_id) !== 4 &&
        parseInt(selectedValues.maxParticipants) >
          parseInt(settings?.max_event_participants_count)
      ) {
        dispatch(
          setPremiumAlert({
            status: true,
            text: `To add more than ${parseInt(
              settings?.max_event_participants_count,
            )} participants upgrade your membership!`,
          }),
        );
      } else {
        Toast.fail('Max Participants - ' + selectedValues.participantError);
      }
    } else if (
      parseInt(profile?.user_status_id) <= 1 &&
      parseInt(selectedValues.waiting_room) !== parseInt(settings?.waiting_room)
    ) {
      dispatch(
        setPremiumAlert({
          status: true,
          text: RAWCASTER_DEFAULT_MESSAGE.UPGRADE_MESSAGE,
        }),
      );
    } else if (
      parseInt(profile?.user_status_id) <= 1 &&
      parseInt(selectedValues.join_before_host) !==
        parseInt(settings?.join_before_host)
    ) {
      dispatch(
        setPremiumAlert({
          status: true,
          text: RAWCASTER_DEFAULT_MESSAGE.UPGRADE_MESSAGE,
        }),
      );
    } else if (selectedValues.melody.type === 3 && !selectedMelodyFile) {
      Toast.fail('Upload Melody');
      setmelodyFileError('Melody required');
    } else {
      const data = {
        event_title: values.eventTitle,
        event_message: values.eventDescription,
        event_start_date: moment(liveEventDate).utc().format('YYYY-MM-DD'),
        event_start_time: moment(values.eventTime).utc().format('HH:mm'),
        event_participants: selectedValues.maxParticipants,
        event_duration: getDisplayDuration(),
        melodyFile:
          selectedValues.melody.type === 3 ? selectedMelodyFile : null,
        ...selectedValues,
      };

      navigation.navigate(
        isFromEventSearch
          ? 'CreateEditSearchEventSecond'
          : 'CreateEditEventSecond',
        {
          isFromEventSearch: isFromEventSearch,
          submitedData: data,
          eventId,
        },
      );
    }
  };

  /**
   * Makes an API call to retrieve the details of an event.
   * @returns None
   */
  const getEventDetailsAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_id', eventId);
    viewEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempData = {...selectedValues};
          if (res.data.event_detail.banner_image) {
            tempData = {
              ...tempData,
              banner_image: {uri: res.data.event_detail.banner_image},
            };
          }
          setValues(preValues => {
            return {
              ...preValues,
              eventTitle: htmlDecodeText(res.data.event_detail.event_name),
              eventDescription: htmlDecodeText(res.data.event_detail.message),

              eventTime: getUtcToSystemTime(
                res.data.event_detail.start_date_time,
              ),
              maxParticipants: parseInt(
                res.data.event_detail.no_of_participants,
              ),
            };
          });

          console.log(res.data.event_detail, 'YUYUYUYU');

          setliveEventDate(
            getUtcToSystemTime(res.data.event_detail.start_date_time),
            // utcToUserTimezone(
            //   res.data.event_detail.start_date_time,
            //   settings?.time_zone,
            // ),
          );
          if (res.data.event_detail?.melodies?.path) {
            setselectedMelodyFile({
              name: getFileName(res.data.event_detail.melodies.path),
              uri: res.data.event_detail.melodies.path,
            });
          }

          tempData = {
            ...tempData,
            sound_notify: parseInt(res.data.event_detail.sound_notify),
            waiting_room: parseInt(res.data.event_detail.waiting_room),
            user_screenshare: parseInt(res.data.event_detail.user_screenshare),
            join_before_host: parseInt(res.data.event_detail.join_before_host),
            host_audio: parseInt(res.data.event_detail.default_host_audio),
            host_video: parseInt(res.data.event_detail.default_host_video),
            participant_audio: parseInt(
              res.data.event_detail.default_guest_audio,
            ),
            participant_video: parseInt(
              res.data.event_detail.default_guest_video,
            ),
            melody: {
              id: res.data.event_detail.event_melody_id,
              type: res.data.event_detail.event_melody_type,
            },
            event_layout_id: res.data.event_detail.event_layout_id,
            eventDuration: new Date(
              moment('2021-01-05 ' + res.data.event_detail.duration),
            ),
            eventVisibilityTypeId: res.data.event_detail.event_type_id,
            selectedGroupsIdsList: res.data.event_detail.invite_groups_id ?? [],
            removedGroupsIdsList: res.data.event_detail.invite_groups_id ?? [],
            selectedConnectionsIdsList:
              res.data.event_detail.invite_friends_id ?? [],
            removedConnectionsIdsList:
              res.data.event_detail.invite_friends_id ?? [],
            invitedUsersList: res.data.event_detail.invite_mails ?? [],
            removedInvitedUsersList: res.data.event_detail.invite_mails ?? [],
          };

          setselectedValues({...tempData});
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

  /**
   * Handles the selection of a duration for an event.
   * @param {Date} date - The selected date for the duration.
   * @returns None
   */
  const onSelectDuration = date => {
    let actualDurationallowed = settings?.max_event_duration;

    let selectedDuration = moment(date).format('HH:mm');

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
    if (selectedDuration > settings?.max_event_duration) {
      if (profile.user_status_id !== 4) {
        dispatch(
          setPremiumAlert({
            status: true,
            text: `To host event for longer than ${settings?.max_event_duration} hours upgrade your membership!`,
          }),
        );
        return;
      }
      setselectedValues(preData => ({
        ...preData,
        eventDuration: '',
        durationError: `Max Allowed hours is ${settings?.max_event_duration}`,
      }));
      return;
    }
    let allowedDuration = moment(actualDurationallowed, 'HH:mm').toString();
    allowedDuration = parseFloat(allowedDuration.replace(':', '.'));
    selectedDuration = parseFloat(selectedDuration.replace(':', '.'));
    if (selectedDuration > allowedDuration && profile?.user_status_id === 1) {
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

  /**
   * Handles the selection of an event date.
   * @param {Date} selectedDate - The selected date for the event.
   * @returns None
   */
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

  /**
   * Handles the selection of an event time.
   * @param {Date} selectedTime - The selected time for the event.
   * @returns None
   */
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

  /**
   * Retrieves the event visibility type based on the provided event type ID.
   * @param {string} [eventTypeId=selectedValues.eventVisibilityTypeId] - The event type ID to retrieve the visibility type for.
   * @returns {object | undefined} - The event visibility type object if found, otherwise undefined.
   */
  const getEventVisibilityType = (
    eventTypeId = selectedValues.eventVisibilityTypeId,
  ) => {
    return [...eventTypesList].find(item => item.id === eventTypeId);
  };

  /**
   * Returns the display duration of an event.
   * @returns {string} The formatted display duration in 'HH:mm' format, or an empty string if no duration is provided.
   */
  const getDisplayDuration = () => {
    return selectedValues.eventDuration
      ? moment(selectedValues.eventDuration).format('HH:mm').toString()
      : '';
  };

  /**
   * Retrieves the layout value from the EVENT_LAYOUT_LIST array based on the selected event layout ID.
   * @returns The layout value object that matches the selected event layout ID.
   */
  const getLayoutValue = () => {
    return [...EVENT_LAYOUT_LIST].find(
      item => item.id === selectedValues.event_layout_id,
    );
  };

  /**
   * Returns a list of audio or video settings based on the given type.
   * @param {number} [type=1] - The type of settings to retrieve. 1 for audio settings, 2 for video settings.
   * @returns {Array} - An array of objects representing the settings.
   * Each object has the following properties:
   * - id: The ID of the setting.
   * - name: The name of the setting.
   * - status: The status of the setting, true if selected, false otherwise.
   */
  function getAudioVideoSettingsList(type = 1) {
    //1 - audio , 2 - video
    return [
      {
        id: 1,
        name: 'Host',
        status: selectedValues[type === 1 ? 'host_audio' : 'host_video'] === 1,
      },
      {
        id: 2,
        name: 'Guest',
        status:
          selectedValues[
            type === 1 ? 'participant_audio' : 'participant_video'
          ] === 1,
      },
    ];
  }

  /**
   * Returns an array of enabled switches IDs from the given list.
   * @param {Array} list - The list of items.
   * @returns {Array} An array of enabled switches IDs.
   */
  function getEnabledSwitchesIds(list) {
    return list.filter(item => item.status).map(item => item.id);
  }

  /**
   * Retrieves the melody object from the eventMelodies array based on the selected melody ID.
   * @returns The melody object that matches the selected melody ID, or undefined if not found.
   */
  function getMelody() {
    return [...eventMelodies].find(
      item => item.type === selectedValues.melody.type,
    );
  }

  /**
   * Handles the selection of a melody file using the DocumentPicker.
   * @returns None
   */
  function handleSelectMelodyFile() {
    DocumentPicker.pick({
      type: [
        DocumentPicker.types.images,
        DocumentPicker.types.audio,
        DocumentPicker.types.video,
      ],
    })
      .then(res => {
        if (isMount) {
          setselectedMelodyFile({
            uri: res[0].uri,
            type: res[0].type,
            name: res[0].name,
          });
          setmelodyFileError('');
        }
      })
      .catch(e => {
        if (!e.message.includes('canceled')) {
          Toast.fail(e.message);
        }
      });
  }

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <ReplaceStatusBar />
      <HeaderWithBack
        title={`${eventId ? 'Edit' : 'Create'} virtual meeting event`}
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
        <TextBox
          title="Event Description"
          value={values.eventDescription}
          onChangeText={handleChange('eventDescription')}
          errorText={errors.eventDescription}
          placeHolder="Enter description here..."
          maxLength={120}
          mainContainerMarginVertical={0}
          mainContainerMarginTop={0}
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
            settings?.default_date_format,
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
            value={selectedValues.maxParticipants.toString()}
            onChangeText={text => {
              if (!isNaN(text) && !text.includes('.') && !text.includes(' ')) {
                if (
                  parseInt(text) >
                  parseInt(settings?.max_event_participants_count)
                ) {
                  setselectedValues({
                    ...selectedValues,
                    maxParticipants: text,
                    participantError:
                      profile.user_status_id !== 4
                        ? `To add more than ${parseInt(
                            settings?.max_event_participants_count,
                          )} participants upgrade your membership!`
                        : `Maximum ${parseInt(
                            settings?.max_event_participants_count,
                          )} participants only allowed`,
                  });
                } else if (parseInt(text) < 2) {
                  setselectedValues({
                    ...selectedValues,
                    maxParticipants: text,
                    participantError: 'Enter valid Participants',
                  });
                } else {
                  setselectedValues({
                    ...selectedValues,
                    maxParticipants: text,
                    participantError: '',
                  });
                }
              }
            }}
            errorText={selectedValues.participantError}
            mainContainerWidth={'48%'}
            keyboardType="number-pad"
            placeHolder="Participants"
            maxLength={60}
            mainContainerMarginVertical={0}
            mainContainerMarginTop={0}
            inputContainerMarginVertical={5}
            titlePaddingVertical={5}
          />
          <CustomHourMinutePicker
            title="Duration"
            minInterval={15}
            maxHours={
              settings?.max_event_duration
                ? parseInt(
                    moment(settings?.max_event_duration, 'HH:mm').get('hours'),
                  )
                : 10
            }
            mainContainerMarginVertical={0}
            inputContainerMarginVertical={5}
            titlePaddingVertical={5}
            mainContainerWidth={'48%'}
            value={getDisplayDuration()}
            dropDownIcon="clock_black"
            placeHolderText="Select Duration"
            onSelectItem={val => {
              const convertedDate = moment(val, 'HH:mm').toDate();
              onSelectDuration(convertedDate);
            }}
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
            dataList={[...eventMelodies]}
            mainContainerWidth={'48%'}
            value={getMelody()}
            fieldName="title"
            placeHolderText="Melody"
            onSelectItem={item => {
              setselectedValues(preData => ({
                ...preData,
                melody: {
                  id: item.id,
                  type: item.type,
                },
              }));
            }}
          />
        </View>
        {selectedValues.melody.type === 3 && (
          <View style={styles.uploadButtonContainer}>
            <View>
              <SubmitButton
                buttonText={
                  selectedMelodyFile
                    ? getSlicedText(selectedMelodyFile.name, 20)
                    : 'Upload'
                }
                marginTop={10}
                bgColor={COLORS.white}
                textColor={COLORS.black}
                borderWidth={1}
                buttonTextStyle={{fontSize: 15}}
                borderColor={melodyFileError ? COLORS.red : COLORS.black}
                paddingHorizontal={25}
                marginBottom={10}
                padding={5}
                onPress={() => {
                  handleSelectMelodyFile();
                }}
              />
              {melodyFileError ? (
                <StyledText style={styles.errorText}>
                  {melodyFileError}
                </StyledText>
              ) : (
                false
              )}
            </View>
            {selectedMelodyFile && (
              <SVGIcon
                isButton
                icon="close_rounded_black"
                marginLeft={10}
                height={22}
                width={22}
                onPress={() => {
                  if (isMount) {
                    setselectedMelodyFile(null);
                    setmelodyFileError('Melody required');
                  }
                }}
              />
            )}
          </View>
        )}
        <CheckBox
          text="Waiting Room"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.waiting_room)}
          onPress={() => {
            if (profile.user_status_id <= 1) {
              dispatch(
                setPremiumAlert({
                  status: true,
                  text: RAWCASTER_DEFAULT_MESSAGE.UPGRADE_MESSAGE,
                }),
              );
              return;
            }
            setselectedValues(preData => {
              return {
                ...preData,
                waiting_room: Boolean(preData.waiting_room) ? 0 : 1,
                join_before_host: Boolean(preData.waiting_room)
                  ? preData.join_before_host
                  : 0,
              };
            });
          }}
        />
        <CheckBox
          text="Join before host"
          mainContainerStyle={{marginVertical: 10}}
          isSelected={Boolean(selectedValues.join_before_host)}
          onPress={() => {
            if (profile.user_status_id <= 1) {
              dispatch(
                setPremiumAlert({
                  status: true,
                  text: RAWCASTER_DEFAULT_MESSAGE.UPGRADE_MESSAGE,
                }),
              );
              return;
            }
            setselectedValues(preData => ({
              ...preData,
              waiting_room: Boolean(preData.join_before_host)
                ? preData.waiting_room
                : 0,
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
          isSwitchesFlexStart={true}
          switchesList={getAudioVideoSettingsList(1)}
          onStatusSwitchesIdsList={getEnabledSwitchesIds(
            getAudioVideoSettingsList(1),
          )}
          titleDescriptionContainerProps={{
            titleStyle: {
              fontFamily: FONTS.DMSans.regular,
              fontSize: 15,
            },
          }}
          onChangeButtonStatus={id => {
            if (isMount) {
              setselectedValues(preData => {
                const keyName = id === 1 ? 'host_audio' : 'participant_audio';
                const changedStatus = Boolean(preData[keyName]) ? 0 : 1;
                return {
                  ...preData,
                  [keyName]: changedStatus,
                };
              });
            }
          }}
        />

        <SwtchesContainer
          title="Default Video Settings"
          isSwitchesFlexStart={true}
          switchesList={getAudioVideoSettingsList(2)}
          onStatusSwitchesIdsList={getEnabledSwitchesIds(
            getAudioVideoSettingsList(2),
          )}
          titleDescriptionContainerProps={{
            titleStyle: {
              fontFamily: FONTS.DMSans.regular,
              fontSize: 15,
            },
          }}
          onChangeButtonStatus={id => {
            if (isMount) {
              setselectedValues(preData => {
                const keyName = id === 1 ? 'host_video' : 'participant_video';
                const changedStatus = Boolean(preData[keyName]) ? 0 : 1;
                return {
                  ...preData,
                  [keyName]: changedStatus,
                };
              });
            }
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
            onPress={() => {
              navigation.goBack();
            }}
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
            onPress={handleSubmit}
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
  uploadButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorText: {
    color: COLORS.red,
  },
});
