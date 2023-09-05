import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import HOCView from '../../../../Components/HOCView';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../../Utilities/Colors';
import SVGIcon from '../../../../Components/SVGIcon';
import StyledText from '../../../../Components/StyledText';
import {FONTS} from '../../../../Utilities/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import TextBox from '../../../../Components/TextBox';
import {inviteToRawcasterService} from '../../../../Services/ApiService';
import {getAuthCode} from '../../../../Utilities/Methods';
import {useToken} from '../../../../Utilities/StoreData';
import Toast from '../../../../Components/Toast';
import {AvoidSoftInput} from 'react-native-avoid-softinput';
import GroupUsersImage from '../../../../Assets/Png/group_users_referal.png';

var isMount = true;
const ReferalDashboardHeader = ({
  referalCount = 0,
  referalNeededCount = 0,
  listLength = 0,
}) => {
  const navigation = useNavigation();
  const inviteUserInputRef = useRef(null);
  const token = useToken();
  const [inviteUserText, setinviteUserText] = useState('');
  const [invitedUsersList, setinvitedUsersList] = useState([]);
  const [isLoading, setisLoading] = useState(false);

  const iconsTextList = [
    {
      id: 1,
      icon: 'rocket_colored',
      text: 'Invite Friend',
    },
    {
      id: 2,
      icon: 'like_colored',
      text: 'Friend Signup',
    },
    {
      id: 3,
      icon: 'validate_colored',
      text: 'Validate Signup',
    },
    {
      id: 4,
      icon: 'lock_colored',
      text: 'Unlock Pro',
    },
  ];

  useEffect(() => {
    isMount = true;
    AvoidSoftInput.setAdjustResize();
    return () => {
      AvoidSoftInput.setAdjustPan();
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
            }
          } else {
            Toast.fail(response.data.msg);
          }
        })
        .catch(err => {
          Toast.fail(err.message);
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

  const IconTextContainer = ({icon, text = ''}) => {
    return (
      <View style={styles.iconContainer}>
        <SVGIcon icon={icon} />
        <StyledText style={styles.iconText}>{text}</StyledText>
      </View>
    );
  };

  const CountContainer = ({count = 0, text = ''}) => {
    return (
      <View style={styles.singleCountContainer}>
        <StyledText style={styles.count}>{count}</StyledText>
        <StyledText style={styles.countText}>{text}</StyledText>
      </View>
    );
  };

  return (
    <HOCView
      isEnableHeader={false}
      isEnableKeyboardAware
      paddingHorizontal={0}
      isLoading={isLoading}
      backgroundColor={COLORS.white}
      isEnablePrimaryColorStatusBar={false}
      keyBoardAwareScrollViewProps={{
        nestedScrollEnabled: true,
        keyboardShouldPersistTaps: 'handled',
      }}>
      <View style={styles.topContainer}>
        {iconsTextList.map(item => {
          return (
            <IconTextContainer
              key={item.id.toString()}
              icon={item.icon}
              text={item.text}
            />
          );
        })}
      </View>
      <View style={styles.divider} />
      <View style={styles.bottomContainer}>
        <Image
          source={GroupUsersImage}
          style={styles.groupImage}
          resizeMode="contain"
        />
        <LinearGradient
          colors={COLORS.gradientColorsSecondary}
          start={{x: 1, y: 1}}
          end={{x: 0, y: 0}}
          style={styles.referalHeaderContent}>
          <View style={{marginTop: 25}}>
            <StyledText style={styles.referalText}>
              Refer your friends & unlock Rawcaster Pro features
            </StyledText>
            <StyledText
              style={{
                fontSize: 16,
                color: COLORS.white,
                paddingBottom: 7,
              }}>
              Invite your friends via email
            </StyledText>
          </View>

          <TextBox
            innerRef={inviteUserInputRef}
            placeHolder="Your friend's email..."
            value={inviteUserText}
            onChangeText={text => {
              if (isMount) {
                setinviteUserText(text);
              }
              if (text.includes(',') || text.includes(' ')) {
                addInvitedUsers();
              }
            }}
            textColor={COLORS.white}
            isEnableListAppend
            appendedListProps={{
              list: invitedUsersList,
              onRemoveItem: handleRemoveInvitedUser,
              listContainerMaxHeight: 110,
            }}
            mainContainerMarginVertical={0}
            backgroundColor={COLORS.transparent}
            borderColor={COLORS.white}
            returnKeyType="done"
            clearButtonMode="while-editing"
            onSubmitEditing={() => {
              addInvitedUsers();
            }}
            textAlignVertical={'top'}
            additionalTextInputProps={{
              placeholderTextColor: COLORS.white,
            }}
          />

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={() => {
              if (invitedUsersList.length === 0) {
                addInvitedUsers(true);
              } else {
                inviteToRawcasterApiCall();
              }
            }}>
            <StyledText
              style={{
                fontSize: 15,
                color: '#1D1C1C',
              }}>
              Send
            </StyledText>
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.countsContainer}>
          <CountContainer
            count={referalCount}
            text="Total number of Valid Referrals Credit"
          />
          <CountContainer
            count={referalNeededCount}
            text="Referrals Needed for Upgrade to Premium"
          />
        </View>
      </View>
      {listLength > 0 && (
        <View style={styles.listTitleContainer}>
          <StyledText style={styles.listTitle}>Referral List</StyledText>
        </View>
      )}
    </HOCView>
  );
};

export default ReferalDashboardHeader;

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  iconContainer: {alignItems: 'center'},
  iconText: {
    fontSize: 12,
    fontFamily: FONTS.DMSans.medium,
    marginTop: 10,
  },
  divider: {
    padding: 7,
    backgroundColor: COLORS.borderColor,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
  },
  groupImage: {
    position: 'absolute',
    top: 15,
    left: 15,
    height: 80,
    width: 170,
    zIndex: 1,
  },
  referalHeaderContent: {
    backgroundColor: 'red',
    borderRadius: 20,
    marginTop: 50,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  referalText: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    paddingVertical: 5,
    lineHeight: 25,
  },
  inviteContainer: {
    maxHeight: 200,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: COLORS.white,
    justifyContent: 'center',
  },
  sendBtn: {
    height: 50,
    width: '40%',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  countsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 20,
  },
  singleCountContainer: {
    alignItems: 'center',
    width: '47%',
    borderRadius: 10,
    backgroundColor: COLORS.white,
    padding: 10,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  count: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  countText: {
    textAlign: 'center',
    marginTop: 10,
  },
  listTitleContainer: {
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  listTitle: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 18,
  },
});
