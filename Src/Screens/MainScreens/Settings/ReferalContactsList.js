import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  RefreshControl,
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
import {IS_IOS} from '../../../Utilities/Constants';
import {
  FIREBASE_APP_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_SECRET,
  GOOGLE_SIGNIN_IOS_CLIENT_ID,
} from '../../../Services/ServiceConstants';
import {getSlicedText} from '../../../Utilities/Methods';
import {FONTS} from '../../../Utilities/Fonts';
import ProfileIcon from '../../../Assets/Png/user.png';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import StyledText from '../../../Components/StyledText';
import Loader from '../../../Components/Loader';
import SVGIcon from '../../../Components/SVGIcon';
import {useProfile} from '../../../Utilities/StoreData';
import InviteFanModal from '../../../Modals/InviteFanModal';

var isMount = true;
var currentPage = 1;
var totalPages = 1;

const referalOptionsList = [
  {
    id: 1,
    icon: 'contact_rounded_fill_orange',
    name: 'Contacts',
    key: 'contacts',
  },
  {
    id: 2,
    icon: 'facebook_fill',
    name: 'Facebook',
    key: 'facebook',
  },
  {
    id: 3,
    icon: 'instagram_rounded_fill',
    name: 'Instagram',
    key: 'instagram',
  },
  {
    id: 4,
    icon: 'telegram',
    name: 'Telegram',
    key: 'telegram',
  },
  {
    id: 5,
    icon: 'whatsapp',
    name: 'Whatsapp',
    key: 'whatsapp',
  },
  {
    id: 6,
    icon: 'twitter_rounded_fill',
    name: 'Twitter',
    name: 'twitter',
  },
  {
    id: 7,
    icon: 'linkedin',
    name: 'Linkedin',
    key: 'linkedin',
  },
  {
    id: 8,
    icon: 'gmail_rounded',
    name: 'Gmail',
    key: 'gmail',
  },
  {
    id: 9,
    icon: 'share_rounded_fill_blue',
    name: 'Invite fans',
    key: 'invite_fans',
  },
];

const REFERAL_MESSAGE =
  'Hi, I have joined Rawcaster. A one-stop platform for all social media needs. I am asking all my friends and special people to join this platform to make it easier to reach everyone with content, personalized messages, Nuggets, and invitations to participate in my special events. I expect to see you there soon.';
const TWITTER_REFERAL_MESSAGE =
  'Hi, I have joined Rawcaster. A one-stop platform for all social media needs. I am asking all my special people to join this platform to make it easier to reach you with personalized messages.';

const ReferalContactsList = ({navigation}) => {
  const profile = useProfile();
  const [contactList, setcontactList] = useState([]);
  const [contactToken, setcontactToken] = useState(null);
  const [isEmail, setisEmail] = useState(false);

  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [openInviteFans, setopenInviteFans] = useState(false);

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
        console.log(Err), toastService('Telegram App not installed', 3000);
      });
    } else {
      try {
        const result = await RNSHARE.share(
          {
            message: TWITTER_REFERAL_MESSAGE,
            url: profile.referral_link,
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

  const handleSocialShare = appType => {
    if (
      IS_IOS &&
      appType !== 'contacts' &&
      appType !== 'gmail' &&
      appType !== 'facebook' &&
      appType !== 'whatsapp' &&
      appType !== 'invite_fans'
    ) {
      onShareHandler(appType);
      return;
    }
    switch (appType) {
      case 'whatsapp':
        Linking.openURL(
          `whatsapp://send?text=${
            REFERAL_MESSAGE + ' ' + profile.referral_link
          }`,
        )
          .then(res => {})
          .catch(err => {
            // handleAppNotFoundAlert();
          });
        break;

      case 'facebook':
        const shareOptionsfb = {
          ...SHARE_OBJECTS,
          social: Share.Social?.FACEBOOK,
        };

        Share.shareSingle(shareOptionsfb)
          .then(res => {
            console.log('FACEBOOK res: ', res);
          })
          .catch(err => {
            console.log('Facebook err:', err);
          });
        break;
      case 'instagram':
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

        break;
      case 'contacts':
        setisEmail(false);
        handlePhoneContacts();
        break;
      case 'gmail':
        setisEmail(true);
        handleGoogleContacts();
        break;
      case 'invite_fans':
        setopenInviteFans(true);
        break;
      case 'twitter':
        const shareOptionstwitter = {
          ...SHARE_OBJECTS_TWITTER,

          social: Share.Social?.TWITTER,
        };
        Share.shareSingle(shareOptionstwitter)
          .then(res => {
            console.log('Twitter Response:', res);
          })
          .catch(err => {
            console.log('Twitter Err:');
          });
        break;
      case 'linkedin':
        const shareOptionslinkedIn = {
          ...SHARE_OBJECTS,

          social: Share.Social.LINKEDIN,
        };
        Share.shareSingle(shareOptionslinkedIn)
          .then(res => {
            console.log('LINKLDEN Response:', res);
          })
          .catch(err => {
            console.log('LINKLDEN Err:', err);
          });
        break;
      case 'telegram':
        const shareOptionstelegram = {
          ...SHARE_OBJECTS,
          social: Share.Social.TELEGRAM,
          subject: 'Rawcaster - Invite from ' + profile.name,
        };
        Share.shareSingle(shareOptionstelegram)
          .then(res => {
            console.log('Telegram', res);
          })
          .catch(err => {
            console.log('Telegram:', err);
          });
        break;

      default:
        break;
    }
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
        let sortedContacts = lodash.orderBy(
          [...contactList, ...contact],
          'name',
          ['asc'],
        );
        if (token) {
          setcontactList(sortedContacts);
        } else {
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

  const RenderSuggestedProfile = ({item}) => {
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
          //   onPress={() => handleBecomeFan(item.user_ref_id)}
        >
          <StyledText style={styles.BecomeFanBtnText}>Invite</StyledText>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <SVGIcon icon="close_white" height={8} width={8} />
        </TouchableOpacity> */}
      </View>
    );
  };

  const RederReferalOptions = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => handleSocialShare(item.key)}>
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

  const RenderDivider = () => {
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

  return (
    <HOCView
      headerType="home_header"
      isEnableDefaultBackground
      isEnableTopSafeAreaHomeHeader
      isEnablePrimaryColorStatusBar
      isEnableScroll
      headerProps={{
        isEnableBack: true,
        title: 'Invite Fans & Contacts',
        onPressBack: () => navigation.goBack(),
        bgColor: COLORS.transparent,
      }}>
      <RenderDivider />
      <StyledText style={{color: COLORS.white, opacity: 0.7}}>
        Invite via
      </StyledText>
      <FlatList
        data={referalOptionsList}
        horizontal
        renderItem={({item}) => {
          return <RederReferalOptions item={item} />;
        }}
        keyExtractor={(item, index) => index.toString()}
      />
      <RenderDivider />
      {isListLoading ? (
        <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
      ) : contactList.length > 0 ? (
        <>
          <FlatList
            data={contactList}
            scrollEnabled={false}
            renderItem={({item}) => {
              return <RenderSuggestedProfile item={item} />;
            }}
            refreshControl={
              <RefreshControl
                tintColor={COLORS.secondary}
                refreshing={isRefreshing}
                onRefresh={onRefresh}
              />
            }
            onEndReachedThreshold={0.2}
            onEndReached={onEndReached}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeperator}
            ListFooterComponent={renderFooter}
          />
        </>
      ) : (
        <RenderEmptyComponent />
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
});
