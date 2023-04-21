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
import {addEventService} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';

var isMount = true;
const CreateEditEventSecond = ({route}) => {
  const navigation = useNavigation();
  const token = useToken();
  const {submitedData} = route.params ?? {};
  const [isLoading, setisLoading] = useState(false);
  const [bannerImage, setbannerImage] = useState(null);

  const inviteUserInputRef = useRef(null);
  const [inviteUserText, setinviteUserText] = useState('');
  const [selectedConnectionsIdsList, setselectedConnectionsIdsList] = useState(
    [],
  );
  const [invitedUsersList, setinvitedUsersList] = useState([]);
  const [selectedGroupsIdsList, setselectedGroupsIdsList] = useState([]);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const getDefaultCreateEditFormData = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('event_title', submitedData.event_title);
    formData.append('event_type', submitedData.event_type);
    formData.append('event_start_date', submitedData.event_start_date);
    formData.append('event_start_time', submitedData.event_start_time);
    formData.append('event_participants', submitedData.event_participants);
    formData.append('event_duration', submitedData.event_duration);
    formData.append('event_layout', submitedData.event_layout);
    formData.append('event_melody_id', submitedData.event_melody_id);
    formData.append('event_host_audio', submitedData.event_host_audio);
    formData.append('event_host_video', submitedData.event_host_video);
    formData.append('event_guest_audio', submitedData.event_guest_audio);
    formData.append('event_guest_video', submitedData.event_guest_video);
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

  function handleCreateEvent() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = getDefaultCreateEditFormData();
    console.log(formData, 'FORMDATAAA');
    addEventService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          navigation.reset({
            routes: [{name: 'Events'}],
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
  }

  const eventVisibilityTypeError = () => {
    return (
      submitedData?.event_type === 2 &&
      selectedConnectionsIdsList.length <= 0 &&
      selectedGroupsIdsList.length <= 0 &&
      invitedUsersList.length <= 0
    );
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

  function onPressCreateEvent() {
    Keyboard.dismiss();
    if (eventVisibilityTypeError()) {
      Toast.fail('Event type is Private, you must select the participants.');
      return;
    }
    handleCreateEvent();
  }

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <ReplaceStatusBar />
      <HeaderWithBack title={'Create virtual meeting event'} />
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
          isVisible={submitedData?.event_type !== 3}
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
          isVisible={submitedData?.event_type !== 3}
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
          isVisible={submitedData?.event_type !== 3}
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
                routes: [{name: 'Events'}],
              });
            }}
          />
          <SubmitButton
            buttonText="Create"
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
        <Loader
          bgColor={COLORS.transparentDimColor}
          loaderText={'Creating Event'}
        />
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
