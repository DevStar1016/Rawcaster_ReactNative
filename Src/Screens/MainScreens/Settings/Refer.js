import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share as RNSHARE,
  NativeModules,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  SendAndroidClientToken,
  SendIOSClientToken,
  getContacts,
  getOtherContacts,
} from 'react-native-google-contact-api';
import HOCView from '../../../Components/HOCView';
import SearchInput from '../../../Components/SearchInput';
import {COLORS} from '../../../Utilities/Colors';
import SVGIcon from '../../../Components/SVGIcon';
import StyledText from '../../../Components/StyledText';
import ProfileIcon from '../../../Assets/Png/user.png';
import {FONTS} from '../../../Utilities/Fonts';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import {
  getAuthCode,
  getSlicedText,
  htmlDecodeText,
} from '../../../Utilities/Methods';
import {
  influencerFollowService,
  influencerListService,
} from '../../../Services/ApiService';
import Loader from '../../../Components/Loader';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import Toast from '../../../Components/Toast';
import Share from 'react-native-share';
import {IS_IOS} from '../../../Utilities/Constants';
import {
  FIREBASE_APP_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_ID,
  GOOGLE_CONTACTS_SERVER_CLIENT_SECRET,
  GOOGLE_SIGNIN_IOS_CLIENT_ID,
} from '../../../Services/ServiceConstants';
// import {ShareDialog} from 'react-native-fbsdk-next';

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
    icon: 'share_rounded_fill_blue',
    name: 'Invite fans',
    key: 'invite_fans',
  },
];

const REFERAL_MESSAGE =
  'Hi, I have joined Rawcaster. A one-stop platform for all social media needs. I am asking all my friends and special people to join this platform to make it easier to reach everyone with content, personalized messages, Nuggets, and invitations to participate in my special events. I expect to see you there soon.';
const TWITTER_REFERAL_MESSAGE =
  'Hi, I have joined Rawcaster. A one-stop platform for all social media needs. I am asking all my special people to join this platform to make it easier to reach you with personalized messages.';

const Refer = ({navigation}) => {
  const token = useToken();
  const {CalendarModule} = NativeModules;
  const profile = useProfile();
  const [suggestedAccountsList, setsuggestedAccountsList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);

  const [isListLoading, setisListLoading] = useState(false);
  const [isActionLoading, setisActionLoading] = useState(false);

  const SHARE_OBJECTS = {
    url: profile.referral_link,
    message: REFERAL_MESSAGE,
  };
  const IOS_FACEBOOK_SHARE_OBJECT = {
    contentType: 'link',
    contentUrl: profile.referral_link,
    contentDescription: REFERAL_MESSAGE,
  };
  const SHARE_OBJECTS_TWITTER = {
    url: profile.referral_link,
    message: TWITTER_REFERAL_MESSAGE,
  };

  useEffect(() => {
    if (isMount) {
      setisListLoading(true);
      handleSuggestedProfile();
    }
  }, []);

  const handleSuggestedProfile = (searchText = '') => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('page_number', 1);
    if (searchText) {
      formData.append('search_key', searchText);
    }
    influencerListService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedInfluencerList = [...res.data.users_list].map(item => {
              return {
                ...item,
                display_name: htmlDecodeText(item.display_name),
                first_name: htmlDecodeText(item.first_name),
                last_name: htmlDecodeText(item.last_name),
              };
            });

            // if (pageNumber === 1) {
            // totalPages = parseInt(res.data.total_pages);
            setsuggestedAccountsList(decodedInfluencerList);
            // } else {
            //   setsuggestedAccountsList(preList => [
            //     ...preList,
            //     ...decodedInfluencerList,
            //   ]);
            // }
          } else if (res.data.status === 0) {
            setsuggestedAccountsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setsuggestedAccountsList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisListLoading(false);
          setisRefreshing(false);
        }
      });
  };

  const handleBecomeFan = userRefId => {
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', JSON.stringify([userRefId]));
    formData.append('auth_code', getAuthCode(token));
    influencerFollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setisListLoading(true);
          handleSuggestedProfile();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisActionLoading(false);
        }
      });
  };

  const onShareHandler = async mediaType => {
    if (mediaType === 'facebook') {
      // ShareDialog.canShow(IOS_FACEBOOK_SHARE_OBJECT)
      //   .then(function (canShow) {
      //     if (canShow) {
      //       return ShareDialog.show(IOS_FACEBOOK_SHARE_OBJECT);
      //     } else {
      //       Linking.openURL(
      //         `https://www.facebook.com/sharer/sharer.php?u=${IOS_FACEBOOK_SHARE_OBJECT.contentUrl}&quote=${IOS_FACEBOOK_SHARE_OBJECT.contentDescription}`,
      //       );
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
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
    } else if (mediaType === 'instagram') {
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
      // Linking.openURL(
      //   `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      //     SHARE_OBJECTS.url,
      //   )}&text=${encodeURIComponent(TWITTER_REFERAL_MESSAGE)}`,
      // );
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
    } else if (mediaType === 'linkedIn') {
      Linking.openURL(
        `http://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          SHARE_OBJECTS.url,
        )}&title=${encodeURIComponent(SHARE_OBJECTS.message)}`,
      );
    } else if (mediaType === 'whatsapp') {
      Linking.openURL(
        `whatsapp://send?text=${REFERAL_MESSAGE + ' ' + profile.referral_link}`,
      ).catch(Err => console.log(Err));
    } else if (mediaType === 'gmail') {
      openComposer({
        subject: 'Rawcaster - Invite from ' + profile.name,
        body: SHARE_OBJECTS.message + ' ' + SHARE_OBJECTS.url,
      });
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
    if (IS_IOS && appType !== 'contacts') {
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
        // const shareOptionsmes = {
        //   ...SHARE_OBJECTS,
        //   appId: '204958358281864',
        //   social: Share.Social?.MESSENGER,
        // };
        // Share.shareSingle(shareOptionsmes)
        //   .then(res => {
        //     console.log('Mesenger Res:', res);
        //   })
        //   .catch(err => {
        //     console.log('Messenger Error', err);
        //   });

        // handleGoogleContacts();
        navigation.navigate('ReferalContacts');
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

  const handleGoogleContacts = () => {
    if (IS_IOS) {
      SendIOSClientToken(GOOGLE_SIGNIN_IOS_CLIENT_ID);
      getContacts(null)
        .then(response => {
          //statement
          console.log(response);
        })
        .catch(error => {
          //Error Response
          console.log('sdsfsfsdfds', error);
        });
    } else {
      SendAndroidClientToken(
        GOOGLE_CONTACTS_SERVER_CLIENT_ID,
        FIREBASE_APP_ID,
        GOOGLE_CONTACTS_SERVER_CLIENT_SECRET,
      )
        .then(response => {
          //statement
          console.log(response);
          getContacts(null)
            .then(response => {
              //statement
              console.log(response);
            })
            .catch(error => {
              //Error Response
              console.log('sdsfsfsdfds', error);
            });
        })
        .catch(error => {
          //Error Response
          console.log(error);
        });
    }
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
        <SVGIcon icon="arrow_right_white" height={14} width={14} />
      </TouchableOpacity>
    );
  };

  const RenderSuggestedProfile = ({item}) => {
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{uri: item.profile_img}}
            style={styles.profileImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.profileTextContainer}>
          <StyledText style={styles.profileNameText}>
            {getSlicedText(item.display_name, 18)}
          </StyledText>
          <Text
            style={styles.profileDescriptionText}
            numberOfLines={1}
            ellipsizeMode="tail">
            You may know {getSlicedText(item.display_name, 18)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.BecomeFanBtn}
          onPress={() => handleBecomeFan(item.user_ref_id)}>
          <StyledText style={styles.BecomeFanBtnText}>Become a fan</StyledText>
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <SVGIcon icon="close_white" height={8} width={8} />
        </TouchableOpacity> */}
      </View>
    );
  };

  const onRefresh = () => {
    currentPage = 1;
    totalPages = 1;
    if (isMount) {
      setisRefreshing(true);
    }
    handleSuggestedProfile(1);
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        handleSuggestedProfile(currentPage);
      }
    }
  };

  const renderFooter = () => {
    return isLoadMore ? (
      <ActivityIndicator size={'small'} color={COLORS.primary} />
    ) : null;
  };

  const renderSeperator = () => {
    return <View style={styles.divider} />;
  };

  function renderEmptyComponent() {
    return (
      <View style={[styles.emptyComponent]}>
        {/* <DefaultBackground /> */}
        <StyledText style={{color: COLORS.white, paddingVertical: 5}}>
          We didn't find any results!
        </StyledText>
      </View>
    );
  }

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
      <SearchInput
        marginVertical={15}
        searchButtonColor={COLORS.secondary}
        placeHolderText="Search by name"
        onSearch={searchText => handleSuggestedProfile(searchText)}
      />
      {referalOptionsList.map((item, index) => (
        <RederReferalOptions key={index} item={item} />
      ))}
      <View style={styles.headingContainer}>
        <StyledText style={styles.headingText}>Suggested accounts</StyledText>
        <SVGIcon icon="info" height={14} width={14} />
      </View>
      {isListLoading ? (
        <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
      ) : (
        <>
          <FlatList
            data={suggestedAccountsList}
            scrollEnabled={false}
            renderItem={({item}) => {
              return <RenderSuggestedProfile item={item} />;
            }}
            ListEmptyComponent={renderEmptyComponent}
            // refreshControl={
            //   <RefreshControl
            //     tintColor={COLORS.secondary}
            //     refreshing={isRefreshing}
            //     onRefresh={onRefresh}
            //   />
            // }
            // onEndReachedThreshold={0.2}
            // onEndReached={onEndReached}
            keyExtractor={(item, _) => item.user_ref_id.toString()}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeperator}
            // ListFooterComponent={renderFooter}
          />
        </>
      )}
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
      </Modal>
    </HOCView>
  );
};

export default Refer;

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  optionNameLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  optionName: {
    color: COLORS.white,
    marginLeft: 10,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '75%',
  },
  headingText: {
    color: COLORS.white,
    marginRight: 10,
    fontSize: 16,
    marginVertical: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    width: WINDOW_WIDTH - 20,
    // backgroundColor: 'green',
  },
  profileImageContainer: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: COLORS.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  profileNameText: {
    fontFamily: FONTS.DMSans.medium,
    fontSize: 15,
    color: COLORS.white,
    width: '100%',
  },
  profileDescriptionText: {
    fontFamily: FONTS.DMSans.regular,
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.7,
    width: '100%',
  },
  profileTextContainer: {
    width: '55%',
    // backgroundColor: 'red',
    // marginHorizontal: 10,
  },
  BecomeFanBtn: {
    height: 30,
    width: 100,
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
  divider: {
    height: 10,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
