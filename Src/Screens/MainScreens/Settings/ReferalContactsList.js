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
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  SendAndroidClientToken,
  SendIOSClientToken,
  getContacts,
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
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import ProfileIcon from '../../../Assets/Png/user.png';
import Share from 'react-native-share';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import StyledText from '../../../Components/StyledText';
import Loader from '../../../Components/Loader';
import SVGIcon from '../../../Components/SVGIcon';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import InviteFanModal from '../../../Modals/InviteFanModal';
import {inviteToRawcasterService} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import RNShare from 'react-native-share';

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
  const [isEmail, setisEmail] = useState(false);

  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [openInviteFans, setopenInviteFans] = useState(false);

  const SHARE_OBJECTS = {
    url: profile?.referral_link,
    message: REFERAL_MESSAGE,
  };
  const IOS_FACEBOOK_SHARE_OBJECT = {
    contentType: 'link',
    contentUrl: profile?.referral_link,
    contentDescription: REFERAL_MESSAGE,
  };
  const SHARE_OBJECTS_TWITTER = {
    url: profile?.referral_link,
    message: TWITTER_REFERAL_MESSAGE,
  };

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

  const onShareHandler = async mediaType => {
    if (mediaType === 'instagram') {
      const shareOptionsIns = {
        ...SHARE_OBJECTS,
        social: Share.Social?.INSTAGRAM,
      };

      Share.shareSingle(shareOptionsIns)
        .then(res => {
          console.log('instagram res: ', res);
        })
        .catch(err => {
          console.log('Instagram err:', err);
        });
    } else if (mediaType === 'twitter') {
      Linking.openURL(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          SHARE_OBJECTS.url,
        )}&text=${encodeURIComponent(TWITTER_REFERAL_MESSAGE)}`,
      );
    } else if (mediaType === 'linkedIn') {
      Linking.openURL(
        `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          SHARE_OBJECTS.url,
        )}&title=${encodeURIComponent(SHARE_OBJECTS.message)}`,
      );
    } else if (mediaType === 'telegram') {
      Linking.openURL(
        `tg://msg?text=${SHARE_OBJECTS.message + '\n ' + SHARE_OBJECTS.url}`,
      ).catch(Err => {
        console.log(Err),
          inviteToRawcasterService('Telegram App not installed', 3000);
      });
    } else {
      try {
        const result = await RNShare.share(
          {
            message: TWITTER_REFERAL_MESSAGE,
            url: profile?.referral_link,
          },
          {
            excludedActivityTypes: [
              'com.apple.UIKit.activity.PostToFacebook',
              'com.apple.UIKit.activity.PostToTwitter',
              'com.apple.UIKit.activity.Mail',
            ],
          },
        );
        if (result.action === RNSHARE.sharedAction) {
          if (result.activityType) {
            // shared with activity type of result.activityType
          } else {
            // shared
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error.message);
      }
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
        setisEmail(false);
        handlePhoneContacts();
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
        setisEmail(true);
        handleGoogleContacts();
        return;
      case SHARE_OPTION.invite_fans:
        setopenInviteFans(true);
        return;
    }
    return;
  };

  const handleGoogleContacts = (token = null) => {
    console.log(token, 'DDDDDDDDDDDDD');
    if (!token) {
      setisListLoading(true);
    }
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
        //statement
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
    setisListLoading(true);
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
          console.log(e, 'ffdffd');
          setisListLoading(false);
          setisRefreshing(false);
        });
    }
  };

  const getPhoneContacts = () => {
    Contacts.getAll()
      .then(contacts => {
        // console.log(contacts, 'ddfdsfdsf');
        if (isMount) {
          let sortedContacts = lodash.orderBy(
            contacts,
            [IS_IOS ? 'givenName' : 'displayName'],
            ['asc'],
          );
          let contactsList = sortedContacts.map(item => {
            return {
              name: IS_IOS ? item.givenName : item.displayName,
              mobile: item.phoneNumbers[0]?.number || '',
            };
          });

          // for section list data
          const result = lodash(contactList)
            .groupBy(item => item.name.toUpperCase().charAt(0))
            .map((value, key) => ({date: key, transactions: value}))
            .value();

          console.log(result);
          // console.log(contactsList, 'CCCCCC');
          setcontactList(contactsList);
        }
      })
      .catch(e => {
        console.log(e);
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
    if (isEmail) {
      handleGoogleContacts(null);
    } else {
      handlePhoneContacts();
    }
  };

  const onEndReached = () => {
    if (contactToken !== null && contactToken !== 'Reached End') {
      if (isMount && isEmail && contactToken) {
        console.log('dsdsfdsfdsf');
        setisLoadMore(true);
        handleGoogleContacts(contactToken);
      }
    }
  };

  function getContactsListSections() {
    console.log(contactList, 'LIST');

    //     const sortedData = [...contactList].sort((a, b) => {
    //       const nameA = a.name.toLowerCase();
    //       const nameB = b.name.toLowerCase();
    //       if (nameA < nameB) {
    //         return -1;
    //       }
    //       if (nameA > nameB) {
    //         return 1;
    //       }
    //       return 0;
    //     });

    //     const groupedData = {};
    //     [...contactList].forEach((item) => {
    //   const firstLetter = item.name[0].toUpperCase();
    //   if (!groupedData[firstLetter]) {
    //     groupedData[firstLetter] = [];
    //   }
    //   groupedData[firstLetter].push(item);
    // });
    return [
      {
        title: 'Contacts',
        data: contactList,
      },
    ];
  }

  const renderItem = ({item}) => {
    return (
      <View style={styles.profileContainer}>
        <View style={{flexDirection: 'row', width: WINDOW_WIDTH - 120}}>
          <View style={styles.profileImageContainer}>
            <Image
              source={ProfileIcon}
              style={styles.profileImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.profileTextContainer}>
            <Text
              style={styles.profileNameText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text
              style={styles.profileDescriptionText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {isEmail ? item.email : item.mobile}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.BecomeFanBtn}
          onPress={() => {
            if (isEmail) {
              inviteToRawcasterApiCall(item.email);
            } else {
              openSms(item.mobile);
            }
          }}>
          <StyledText style={styles.BecomeFanBtnText}>Invite</StyledText>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <SVGIcon icon="close_white" height={8} width={8} />
        </TouchableOpacity> */}
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
          <StyledText style={styles.optionName}>{item.name}</StyledText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.seperator} />;
  };

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  const RenderEmptyComponent = () => {
    return (
      <View style={[styles.emptyComponent]}>
        {/* <DefaultBackground /> */}
        <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
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
      isEnableTopSafeAreaHomeHeader
      isEnablePrimaryColorStatusBar
      headerProps={{
        isEnableBack: true,
        title: 'Invite Fans & Contacts',
        onPressBack: () => navigation.goBack(),
        bgColor: COLORS.transparent,
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
      {isListLoading ? (
        <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
      ) : (
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
      )}
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
    marginVertical: 5,
    width: WINDOW_WIDTH - 20,
    // backgroundColor: 'green',
  },
  profileImageContainer: {
    height: 35,
    width: 35,
    borderRadius: 19,
    backgroundColor: COLORS.grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profileImage: {
    height: 27,
    width: 27,
    borderRadius: 15,
  },
  profileNameText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 15,
    color: COLORS.white,
    width: WINDOW_WIDTH - 170,
  },
  profileDescriptionText: {
    fontFamily: FONTS.DMSans.regular,
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
    width: WINDOW_WIDTH - 170,
  },
  profileTextContainer: {
    width: WINDOW_WIDTH - 170,
    // backgroundColor: 'red',
    // marginHorizontal: 10,
  },
  BecomeFanBtn: {
    height: 30,
    width: 80,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    // marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  BecomeFanBtnText: {
    color: COLORS.white,
    fontSize: 13,
  },
  seperator: {
    height: 10,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 5,
  },
  optionNameLogoContainer: {
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // width: '50%',
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
