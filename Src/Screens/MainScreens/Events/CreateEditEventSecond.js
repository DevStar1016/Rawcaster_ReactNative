import {Keyboard, Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import ReplaceStatusBar from '../../../Components/ReplaceStatusBar';
import HeaderWithBack from '../../../Components/HeaderWithBack';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {COLORS} from '../../../Utilities/Colors';
import EventImagePicker from '../EventsAndTalkshowsCommon/EventImagePicker';
import StyledText from '../../../Components/StyledText';
import TextBox from '../../../Components/TextBox';
import Toast from '../../../Components/Toast';
import ConnectionGroupsListContainer from '../EventsAndTalkshowsCommon/ConnectionGroupsListContainer';
import SubmitButton from '../../../Components/SubmitButton';
import {useNavigation} from '@react-navigation/native';
import {useToken} from '../../../Utilities/StoreData';
import {addEventService, editEventService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import {createMeetingRoom} from '../../../Services/ChimeSocket/ChimeSocketRequests';

var isMount = true;
const CreateEditEventSecond = ({route}) => {
  const navigation = useNavigation();
  const token = useToken();
  const {submitedData, eventId, isFromEventSearch} = route.params ?? {};
  const [loaderText, setloaderText] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [bannerImage, setbannerImage] = useState(
    submitedData?.banner_image ? submitedData.banner_image : null,
  );
  const inviteUserInputRef = useRef(null);
  const [inviteUserText, setinviteUserText] = useState('');
  const [selectedConnectionsIdsList, setselectedConnectionsIdsList] = useState(
    submitedData?.selectedConnectionsIdsList ?? [],
  );
  const [invitedUsersList, setinvitedUsersList] = useState(
    submitedData?.invitedUsersList ?? [],
  );
  const [selectedGroupsIdsList, setselectedGroupsIdsList] = useState(
    submitedData?.selectedGroupsIdsList ?? [],
  );
  useEffect(() => {
    isMount = true;
    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Returns a FormData object with the default create/edit form data.
   * @returns {FormData} - The FormData object with the default form data.
   */
  const getDefaultCreateEditFormData = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_title', submitedData.event_title);
    formData.append('event_message', submitedData.event_message);
    formData.append('event_type', submitedData.eventVisibilityTypeId);
    formData.append('event_start_date', submitedData.event_start_date);
    formData.append('event_start_time', submitedData.event_start_time);
    formData.append('event_participants', submitedData.event_participants);
    formData.append('event_duration', submitedData.event_duration);
    formData.append('event_layout', submitedData.event_layout_id);
    formData.append('event_melody_id', submitedData.melody);
    formData.append('event_host_audio', submitedData.host_audio);
    formData.append('event_host_video', submitedData.host_video);
    formData.append('event_guest_audio', submitedData.participant_audio);
    formData.append('event_guest_video', submitedData.participant_video);
    formData.append('waiting_room', submitedData.waiting_room);
    formData.append('join_before_host', submitedData.join_before_host);
    formData.append('sound_notify', submitedData.sound_notify);
    formData.append('user_screenshare', submitedData.user_screenshare);
    if (submitedData.melodyFile) {
      formData.append('event_melody', submitedData.melodyFile);
    }
    if (bannerImage && bannerImage.type) {
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
    return formData;
  };

  /**
   * Resets the navigation stack to the view screen of the event details.
   * @param {object} eventDetails - The details of the event.
   * @returns None
   */
  const resetStackToViewScreen = eventDetails => {
    navigation.reset({
      routes: [
        {name: isFromEventSearch ? 'EventsSearch' : 'Events'},
        {
          name: isFromEventSearch
            ? 'SearchEventDetailsView'
            : 'EventDetailsView',
          params: {eventDetail: eventDetails},
        },
      ],
    });
  };

  /**
   * Handles the create event functionality. It retrieves the default form data,
   * adds the event using the addEventService function, and performs additional actions
   * based on the response.
   * @returns None
   */
  function handleCreateEvent() {
    const formData = getDefaultCreateEditFormData();
    addEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (res.data.event_detail?.reference_id) {
            createMeetingRoom({
              refId: res.data.event_detail.reference_id,
            });
          }
          Toast.success(res.data.msg);
          resetStackToViewScreen(res.data.event_detail);
          // navigation.reset({
          //   routes: [{name: isFromEventSearch ? 'EventsSearch' : 'Events'}],
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

  /**
   * Handles the edit event functionality by sending a request to the server with the updated form data.
   * @returns None
   */
  function handleEditEvent() {
    const formData = getDefaultCreateEditFormData();
    formData.append('event_id', eventId);
    let tempRemovedUsersList = [
      ...submitedData?.removedInvitedUsersList,
    ].filter(mailItem => ![...invitedUsersList].includes(mailItem));
    let tempRemovedGroupsIdsList = [
      ...submitedData?.removedGroupsIdsList,
    ].filter(id => ![...selectedGroupsIdsList].includes(id));
    let tempRemovedConnectionsIdsList = [
      ...submitedData?.removedConnectionsIdsList,
    ].filter(id => ![...selectedConnectionsIdsList].includes(id));

    if (tempRemovedUsersList.length > 0) {
      formData.append(
        'delete_invite_mails',
        JSON.stringify(tempRemovedUsersList),
      );
    }
    if (tempRemovedConnectionsIdsList.length > 0) {
      formData.append(
        'delete_invite_friends',
        JSON.stringify(tempRemovedConnectionsIdsList),
      );
    }
    if (tempRemovedGroupsIdsList.length > 0) {
      formData.append(
        'delete_invite_groups',
        JSON.stringify(tempRemovedGroupsIdsList),
      );
    }
    editEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          resetStackToViewScreen(res.data.event_detail);
          // navigation.reset({
          //   routes: [{name: isFromEventSearch ? 'EventsSearch' : 'Events'}],
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

  /**
   * Checks if there is a type error in the event visibility.
   * @returns {boolean} - true if there is a type error, false otherwise.
   */
  const eventVisibilityTypeError = () => {
    return (
      submitedData?.eventVisibilityTypeId === 2 &&
      selectedConnectionsIdsList.length <= 0 &&
      selectedGroupsIdsList.length <= 0 &&
      invitedUsersList.length <= 0
    );
  };

  /**
   * Adds invited users to the list of invited users.
   * Validates the email format and checks for duplicates before adding.
   * @returns None
   */
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

  /**
   * Removes the specified mail text from the invited users list and updates the state.
   * @param {string} removeMailText - The mail text to be removed from the invited users list.
   * @returns None
   */
  const handleRemoveInvitedUser = removeMailText => {
    let filteredInvitedUsersList = [...invitedUsersList].filter(
      mailText => mailText !== removeMailText,
    );
    if (isMount) {
      setinvitedUsersList(filteredInvitedUsersList);
    }
  };

  /**
   * Handles the selection and deselection of a connection.
   * @param {any} selectedId - The ID of the connection to select or deselect.
   * @returns None
   */
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

  /**
   * Handles the selection and deselection of a group.
   * @param {selectedId} selectedId - The ID of the group being selected or deselected.
   * @returns None
   */
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

  /**
   * Function called when the "Create Event" button is pressed.
   * Dismisses the keyboard and checks if there is an error with the event visibility type.
   * If there is an error, displays a toast message.
   * If there is no error, sets the loader text and isLoading state accordingly.
   * If there is an eventId, calls the handleEditEvent function.
   * If there is no eventId, calls the handleCreateEvent function.
   * @returns None
   */
  function onPressCreateEvent() {
    Keyboard.dismiss();
    if (eventVisibilityTypeError()) {
      Toast.fail('Event type is Private, you must select the participants.');
    } else {
      if (isMount) {
        setloaderText(`${eventId ? 'Editing' : 'Creating'} Event...`);
        setisLoading(true);
      }
      if (eventId) {
        handleEditEvent();
      } else {
        handleCreateEvent();
      }
    }
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
          isVisible={submitedData?.eventVisibilityTypeId !== 3}
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
          isVisible={submitedData?.eventVisibilityTypeId !== 3}
          displayFieldName="display_name"
          idFieldName="user_id"
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
          isVisible={submitedData?.eventVisibilityTypeId !== 3}
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
              navigation.reset({
                routes: [{name: isFromEventSearch ? 'EventsSearch' : 'Events'}],
              });
            }}
          />
          <SubmitButton
            buttonText={eventId ? 'Edit' : 'Create'}
            borderRadius={20}
            bgColor={COLORS.radioSelectedColor}
            borderWidth={0}
            borderColor={COLORS.black}
            textColor={COLORS.black}
            paddingVertical={5}
            paddingHorizontal={35}
            marginHorizontal={10}
            onPress={() => {
              onPressCreateEvent();
              //   navigation.navigate('CreateEditEventSecond');
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

export default CreateEditEventSecond;

const styles = StyleSheet.create({
  errorText: {
    color: COLORS.red,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
