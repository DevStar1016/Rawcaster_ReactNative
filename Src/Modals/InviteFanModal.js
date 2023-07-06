import {Modal, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StyledText from '../Components/StyledText';
import SVGIcon from '../Components/SVGIcon';
import TextBox from '../Components/TextBox';
import SubmitButton from '../Components/SubmitButton';
import {COLORS} from '../Utilities/Colors';
import {FONTS} from '../Utilities/Fonts';
import Toast from '../Components/Toast';
import {useToken} from '../Utilities/StoreData';
import {inviteToRawcasterService} from '../Services/ApiService';
import {getAuthCode} from '../Utilities/Methods';
import Loader from '../Components/Loader';

var isMount = true;
const InviteFanModal = ({setModal}) => {
  const token = useToken();
  const inviteUserInputRef = useRef(null);
  const [inviteUserText, setinviteUserText] = useState('');
  const [invitedUsersList, setinvitedUsersList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [errorText, seterrorText] = useState('');

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  const inviteToRawcasterApiCall = (email = null) => {
    if (isMount) {
      setinviteUserText('');
    }
    let emailList = [...invitedUsersList];
    if (email) {
      emailList.push(email);
    }
    if (emailList.length > 0) {
      if (isMount) {
        setisLoading(true);
      }
      const formData = new FormData();
      formData.append('token', token);
      formData.append('email_id', JSON.stringify(emailList));
      formData.append('auth_code', getAuthCode(token));
      inviteToRawcasterService(formData)
        .then(response => {
          if (response.data.status === 1) {
            Toast.success(response.data.msg);
            if (isMount) {
              setinvitedUsersList([]);
              setModal(false);
            }
          } else {
            Toast.fail(response.data.msg);
          }
        })
        .catch(err => {
          Toast.fail(err.message);
          console.log(err);
        })
        .finally(e => {
          if (isMount) {
            setisLoading(false);
          }
        });
    }
  };

  const addInvitedUsers = (isSend = false) => {
    let newMail = [];
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let temp = inviteUserText.toLowerCase().replace(',', '');
    temp = temp.replace(' ', '');
    if (mailformat.test(temp) === false) {
      seterrorText('Enter Valid Email id');
      if (isMount) {
        setinviteUserText(temp);
      }
      return;
    }
    if (invitedUsersList.includes(temp)) {
      seterrorText('Email Already Added');
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
      if (isSend) {
        inviteToRawcasterApiCall(inviteUserText);
        if (isMount) {
          setinviteUserText('');
        }
      } else {
        if (isMount) {
          setinviteUserText('');
          setinvitedUsersList(prev => [...prev, ...newMail]);
        }
      }
    } else {
      seterrorText('Please enter valid email');
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

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={'handled'}
      contentContainerStyle={[
        styles.mainContainer,
        {justifyContent: 'center'},
      ]}>
      <SafeAreaView style={styles.subContainer}>
        <View style={styles.titleContainer}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <StyledText style={styles.titleText}>Invite Friends</StyledText>
          </View>
          <SVGIcon
            icon="close_rounded_black"
            isButton
            height={20}
            width={20}
            onPress={() => {
              setModal(false);
            }}
          />
        </View>

        <TextBox
          innerRef={inviteUserInputRef}
          title="Invite your friends via email"
          placeHolder="Your friend's email..."
          value={inviteUserText}
          onChangeText={text => {
            if (isMount) {
              seterrorText('');
              setinviteUserText(text);
            }
            if (text.includes(',') || text.includes(' ')) {
              addInvitedUsers();
            }
          }}
          errorText={errorText}
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
        <SubmitButton
          buttonText="SUBMIT"
          marginTop={5}
          onPress={() => {
            if (invitedUsersList.length === 0) {
              addInvitedUsers(true);
            } else {
              inviteToRawcasterApiCall();
            }
          }}
        />
      </SafeAreaView>
      <Modal visible={isLoading} transparent>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </KeyboardAwareScrollView>
  );
};

export default InviteFanModal;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: COLORS.transparentDimColor,
  },
  subContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 15,
  },
});
