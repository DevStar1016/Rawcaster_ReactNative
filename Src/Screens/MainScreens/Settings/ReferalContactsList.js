import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {
  SendAndroidClientToken,
  SendIOSClientToken,
  getOtherContacts,
} from 'react-native-google-contact-api';
import Contacts from 'react-native-contacts';
import lodash from 'lodash';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import {
  IS_IOS,
  REFERAL_MESSAGE,
  SHARE_OPTION,
  TWITTER_REFERAL_MESSAGE,
} from '../../../Utilities/Constants';
import {
  FIREBASE_APP_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_SECRET,
  GOOGLE_SIGNIN_IOS_CLIENT_ID,
} from '../../../Services/ServiceConstants';
import {
  getAuthCode,
  getSlicedText,
  isAlphabet,
} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import ProfileIcon from '../../../Assets/Png/user.png';
import Share from 'react-native-share';
import StyledText from '../../../Components/StyledText';
import Loader from '../../../Components/Loader';
import SVGIcon from '../../../Components/SVGIcon';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import InviteFanModal from '../../../Modals/InviteFanModal';
import {inviteToRawcasterService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import SubmitButton from '../../../Components/SubmitButton';

var isMount = true;
var currentPage = 1;
var totalPages = 1;

const REFERAL_OPTIONS_LIST = [
  {
    id: SHARE_OPTION.contacts,
    icon: 'contact_rounded_fill_orange',
    name: 'Contacts',
  },
  {
    id: SHARE_OPTION.facebook,
    icon: 'facebook_fill',
    name: 'Facebook',
  },
  {
    id: SHARE_OPTION.instagram,
    icon: 'instagram_rounded_fill',
    name: 'Instagram',
  },
  {
    id: SHARE_OPTION.telegram,
    icon: 'telegram',
    name: 'Telegram',
  },
  {
    id: SHARE_OPTION.whatsapp,
    icon: 'whatsapp',
    name: 'Whatsapp',
  },
  {
    id: SHARE_OPTION.twitter,
    icon: 'twitter_rounded_fill',
    name: 'Twitter',
  },
  {
    id: SHARE_OPTION.linked_in,
    icon: 'linkedin',
    name: 'Linkedin',
  },
  {
    id: SHARE_OPTION.gmail,
    icon: 'gmail_rounded',
    name: 'Gmail',
  },
  {
    id: SHARE_OPTION.invite_fans,
    icon: 'share_rounded_fill_blue',
    name: 'Invite fans',
  },
];

const ReferalContactsList = ({navigation}) => {
  const profile = useProfile();
  const token = useToken();
  const [contactList, setcontactList] = useState([]);
  const [contactToken, setcontactToken] = useState(null);
  const [contactsListType, setcontactsListType] = useState(0); // 1 - mobile, 2 - email, 0 - nothing
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [openInviteFans, setopenInviteFans] = useState(false);

  const inviteToRawcasterApiCall = (email = null) => {
    if (email) {
      if (isMount) {
        setisActionLoading(true);
      }
      const formData = new FormData();
      formData.append('token', token);
      formData.append('email_id', JSON.stringify([email]));
      formData.append('auth_code', getAuthCode(token));
      inviteToRawcasterService(formData)
        .then(response => {
          if (response.data.status === 1) {
            Toast.success(response.data.msg);
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
            setisActionLoading(false);
          }
        });
    }
  };

  function handleSocialShare({socialMedia, referalMessage = null, socialUrl}) {
    if (socialMedia) {
      Share.shareSingle({
        title: 'Rawcaster Invite',
        url: profile?.referral_link ?? '',
        message: referalMessage ?? REFERAL_MESSAGE,
        social: socialMedia,
        type: 'text/*',
        subject: 'Rawcaster - Invite from ' + profile?.name,
      })
        .then(res => {
          console.log(socialMedia, 'Share RESPONSE', res);
        })
        .catch(err => {
          console.log(socialMedia, 'Share Error', err);
        });
    } else {
      Linking.openURL(socialUrl)
        .then(() => {})
        .catch(e => {
          console.log(e, 'ERROR IN');
        });
    }
  }

  const onPressReferalOption = pressedShareType => {
    switch (pressedShareType) {
      case SHARE_OPTION.contacts:
        if (contactsListType === 2 || contactsListType === 0) {
          if (isMount) {
            // setcontactsListType(1);
            setisListLoading(true);
          }
          handlePhoneContacts();
        }
        break;
      case SHARE_OPTION.facebook:
        handleSocialShare({socialMedia: Share.Social.FACEBOOK});
        break;
      case SHARE_OPTION.instagram:
        handleSocialShare({socialMedia: Share.Social.INSTAGRAM});
        return;
      case SHARE_OPTION.telegram:
        if (IS_IOS) {
          handleSocialShare({socialMedia: Share.Social.TELEGRAM});
        } else {
          handleSocialShare({
            socialUrl: `https://telegram.me/share/url?text=${REFERAL_MESSAGE}&url=${profile?.referral_link}`,
          });
        }
        return;
      case SHARE_OPTION.whatsapp:
        handleSocialShare({
          socialUrl: `whatsapp://send?text=${encodeURIComponent(
            REFERAL_MESSAGE,
          )}`,
        });
        return;
      case SHARE_OPTION.twitter:
        if (IS_IOS) {
          handleSocialShare({
            socialUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
              profile?.referral_link,
            )}&text=${encodeURIComponent(TWITTER_REFERAL_MESSAGE)}`,
          });
        } else {
          handleSocialShare({
            socialMedia: Share.Social.TWITTER,
            referalMessage: TWITTER_REFERAL_MESSAGE,
          });
        }
        return;
      case SHARE_OPTION.linked_in:
        const encodedUrl = encodeURIComponent(profile?.referral_link);
        const encodedTitle = encodeURIComponent('Rawcaster Invite');
        const encodedDescription = encodeURIComponent(REFERAL_MESSAGE);
        handleSocialShare({
          socialUrl: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
        });
        return;
      case SHARE_OPTION.gmail:
        if (contactsListType === 1 || contactsListType === 0) {
          if (isMount) {
            // setcontactsListType(2);
            setisListLoading(true);
          }
          handleGoogleContacts();
        }
        return;
      case SHARE_OPTION.invite_fans:
        if (isMount) {
          setopenInviteFans(true);
        }
        return;
    }
    return;
  };

  const handleGoogleContacts = (token = null) => {
    if (IS_IOS) {
      if (!token) {
        SendIOSClientToken(GOOGLE_SIGNIN_IOS_CLIENT_ID);
      }
      getEmail(token);
    } else {
      if (token) {
        getEmail(token);
      } else {
        SendAndroidClientToken(
          GOOGLE_CONTACTS_SERVER_CLIENT_ID,
          FIREBASE_APP_ID,
          GOOGLE_CONTACTS_SERVER_CLIENT_SECRET,
        )
          .then(response => {
            //statement
            console.log(response);
            getEmail(token);
          })
          .catch(error => {
            if (isMount) {
              setisListLoading(false);
              setisRefreshing(false);
              setisLoadMore(false);
            }
            //Error Response
            console.log(error);
          });
      }
    }
  };

  const getEmail = token => {
    getOtherContacts(token)
      .then(response => {
        if (contactsListType !== 2 && isMount) {
          setcontactsListType(2);
        }
        let contact = response.data;
        if (token) {
          let sortedContacts = lodash.orderBy(
            [...contactList, ...contact],
            'name',
            ['asc'],
          );
          setcontactList(sortedContacts);
        } else {
          let sortedContacts = lodash.orderBy([...contact], 'name', ['asc']);
          setcontactList(sortedContacts);
        }
        setcontactToken(response.nextPageToken);
      })
      .catch(error => {
        //Error Response
        console.log('sdsfsfsdfds', error);
      })
      .finally(() => {
        if (isMount) {
          setisListLoading(false);
          setisRefreshing(false);
          setisLoadMore(false);
        }
      });
  };

  const handlePhoneContacts = () => {
    if (IS_IOS) {
      getPhoneContacts();
    } else {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
        .then(res => {
          console.log(res);
          if (res === PermissionsAndroid.RESULTS.GRANTED) {
            if (isMount) {
              getPhoneContacts();
            }
          } else {
            if (isMount) {
              setcontactList([]);
              setisListLoading(false);
            }
          }
        })
        .catch(e => {
          if (isMount) {
            setisListLoading(false);
            setisRefreshing(false);
          }
        });
    }
  };

  const getPhoneContacts = () => {
    Contacts.getAll()
      .then(contacts => {
        if (isMount) {
          if (contactsListType !== 1) {
            setcontactsListType(1);
          }
          let tempContactsList = lodash.orderBy(
            contacts,
            [IS_IOS ? 'givenName' : 'displayName'],
            ['asc'],
          );
          tempContactsList = [...tempContactsList]
            .map(item => {
              const contactName = IS_IOS ? item.givenName : item.displayName;
              return {
                name: contactName
                  ? contactName
                  : item.phoneNumbers[0]?.number || '',
                mobile: item.phoneNumbers[0]?.number || '',
              };
            })
            .filter(item => item.name && item.mobile);
          setcontactList(tempContactsList);
        }
      })
      .catch(e => {
        if (isMount) {
          setcontactList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisListLoading(false);
          setisRefreshing(false);
        }
      });
  };
  const openSms = phoneNumber => {
    const separator = IS_IOS ? '&' : '?';
    const message = REFERAL_MESSAGE + ' ' + profile?.referral_link;
    const url = `sms:${phoneNumber}${separator}body=${message}`;
    Linking.openURL(url).catch(e => {});
  };
  const onRefresh = () => {
    if (isMount) {
      setisRefreshing(true);
    }
    if (contactsListType === 2) {
      handleGoogleContacts(null);
    } else if (contactsListType === 1) {
      handlePhoneContacts();
    }
  };

  const onEndReached = () => {
    if (contactToken !== null && contactToken !== 'Reached End') {
      if (isMount && contactsListType === 2 && contactToken) {
        setisLoadMore(true);
        handleGoogleContacts(contactToken);
      }
    }
  };

  function getContactsListSections() {
    let tempContactsList = [...contactList];
    const sortedContactsList = [...tempContactsList].sort(
      (firstItem, secondItem) => {
        const nameA = firstItem.name.toLowerCase();
        const nameB = secondItem.name.toLowerCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      },
    );
    const sections = [...sortedContactsList].reduce((resultSections, item) => {
      if (isAlphabet(item.name[0])) {
        const tempNumberItemIndex = [...resultSections].findIndex(subItem =>
          subItem.title.toUpperCase().includes(item.name[0].toUpperCase()),
        );
        if (tempNumberItemIndex !== -1) {
          resultSections[tempNumberItemIndex] = {
            ...resultSections[tempNumberItemIndex],
            data: [...resultSections[tempNumberItemIndex].data, {...item}],
          };
        } else {
          resultSections.push({
            title: item.name[0].toUpperCase(),
            data: [{...item}],
          });
        }
      } else {
        const tempNumberItemIndex = [...resultSections].findIndex(subItem =>
          subItem.title.includes('#'),
        );
        if (tempNumberItemIndex !== -1) {
          resultSections[tempNumberItemIndex] = {
            ...resultSections[tempNumberItemIndex],
            data: [...resultSections[tempNumberItemIndex].data, {...item}],
          };
        } else {
          resultSections.push({
            title: '#',
            data: [{...item}],
          });
        }
      }
      return resultSections;
    }, []);
    return [...sections];
  }

  const getOptionNameColor = optionId => {
    let color;
    if (optionId === SHARE_OPTION.contacts && contactsListType === 1) {
      color = COLORS.secondary;
    } else if (optionId === SHARE_OPTION.gmail && contactsListType === 2) {
      color = COLORS.secondary;
    } else {
      color = COLORS.white;
    }
    return color;
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.profileContainer}>
        <ProfileWithBadge
          profileSize={35}
          extraMargin={0}
          padding={0}
          containerStyle={{marginRight: 10}}
        />
        <View style={styles.profileTextContainer}>
          <StyledText
            style={styles.profileNameText}
            numberOfLines={1}
            normalTextModeTextProps={{ellipsizeMode: 'tail'}}>
            {getSlicedText(item.name, 22)}
          </StyledText>

          <StyledText
            style={styles.profileDescriptionText}
            numberOfLines={1}
            normalTextModeTextProps={{ellipsizeMode: 'tail'}}>
            {contactsListType === 2 ? item.email : item.mobile}
          </StyledText>
        </View>
        <SubmitButton
          buttonText="Invite"
          buttonTextStyle={styles.becomeFanBtnText}
          marginHorizontal={0}
          marginTop={0}
          marginBottom={0}
          paddingVertical={2}
          paddingHorizontal={17}
          onPress={() => {
            if (contactsListType === 2) {
              inviteToRawcasterApiCall(item.email);
            } else {
              openSms(item.mobile);
            }
          }}
        />
      </View>
    );
  };

  const renderReferalOptions = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => onPressReferalOption(item.id)}>
        <View style={styles.optionNameLogoContainer}>
          <SVGIcon icon={item.icon} />
          <StyledText
            style={[styles.optionName, {color: getOptionNameColor(item.id)}]}>
            {item.name}
          </StyledText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.white} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.seperator} />;
  };

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  const renderSectionHeader = ({section}) => {
    return (
      <View style={{paddingVertical: 10}}>
        <StyledText style={styles.listSectionTitleText}>
          {section.title}
        </StyledText>
      </View>
    );
  };

  return (
    <HOCView
      headerType="home_header"
      isEnableDefaultBackground
      defaultBackgroundProps={{
        isEnableLoading: isListLoading,
        centerText:
          contactList.length > 0 || isListLoading
            ? ''
            : `We didn't find any results!`,
      }}
      isEnableTopSafeAreaHomeHeader
      isEnablePrimaryColorStatusBar
      headerProps={{
        isEnableBack: true,
        title: 'Invite Fans & Contacts',
        onPressBack: () => navigation.goBack(),
        bgColor: COLORS.transparent,
        isEnableSearch: false,
        isEnableLive: false,
        isEnableProfile: false,
      }}>
      <StyledText style={{color: COLORS.white, opacity: 0.7, paddingTop: 10}}>
        Invite via
      </StyledText>
      <View style={{paddingTop: 10}}>
        <FlatList
          data={REFERAL_OPTIONS_LIST}
          horizontal
          renderItem={renderReferalOptions}
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <Divider />

      <SectionList
        sections={getContactsListSections()}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(_, index) => index.toString()}
        ItemSeparatorComponent={renderSeperator}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={COLORS.secondary}
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      />
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
      <Modal
        onRequestClose={() => {
          setopenInviteFans(false);
        }}
        transparent
        visible={openInviteFans}>
        <InviteFanModal setModal={setopenInviteFans} />
      </Modal>
    </HOCView>
  );
};

export default ReferalContactsList;

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  profileNameText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 15,
    color: COLORS.white,
  },
  profileDescriptionText: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
  },
  profileTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  becomeFanBtnText: {
    color: COLORS.white,
    fontSize: 13,
  },
  seperator: {
    height: 30,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 5,
  },
  optionNameLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionName: {
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.whiteTransparent,
    marginVertical: 10,
  },
  listSectionTitleText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 17,
  },
});
