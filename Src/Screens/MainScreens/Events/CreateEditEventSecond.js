import {StyleSheet, Text, View} from 'react-native';
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

var isMount = true;
const CreateEditEventSecond = () => {
  const navigation = useNavigation();
  const [bannerImage, setbannerImage] = useState('');
  const inviteUserInputRef = useRef(null);
  const [inviteUserText, setinviteUserText] = useState('');
  const [eventVisibilityTypeId, seteventVisibilityTypeId] = useState(null);
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

  const eventVisibilityTypeError = () => {
    return (
      eventVisibilityTypeId === 2 &&
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
          isVisible={eventVisibilityTypeId !== 3}
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
          isVisible={eventVisibilityTypeId !== 3}
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
          isVisible={eventVisibilityTypeId !== 3}
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
              //   navigation.navigate('CreateEditEventSecond');
            }}
          />
        </View>
      </KeyboardAwareScrollView>
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
