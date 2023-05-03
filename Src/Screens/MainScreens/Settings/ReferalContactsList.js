import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
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

var isMount = true;
var currentPage = 1;
var totalPages = 1;

const ReferalContactsList = ({navigation}) => {
  const [contactList, setcontactList] = useState([]);
  const [contactToken, setcontactToken] = useState(null);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);

  const [isListLoading, setisListLoading] = useState(false);
  const [isActionLoading, setisActionLoading] = useState(false);

  useEffect(() => {
    console.log('saasaasssaassaasassa');
    if (isMount) {
      handleGoogleContacts(null);
    }
  }, []);

  const handleGoogleContacts = (token = null) => {
    if (IS_IOS) {
      SendIOSClientToken(GOOGLE_SIGNIN_IOS_CLIENT_ID);
      getContacts(token)
        .then(response => {
          //statement
          console.log(response);
          let contact = response.data;
          if (token) {
            setcontactList(pre => [...pre, ...contact]);
          } else {
            setcontactList(response.data);
          }
          setcontactToken(response.nextPageToken);
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
          getContacts(token)
            .then(response => {
              //statement
              console.log(response);
              let contact = response.data;
              if (token) {
                setcontactList(pre => [...pre, ...contact]);
              } else {
                setcontactList(response.data);
              }
              setcontactToken(response.nextPageToken);
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
            <StyledText style={styles.profileNameText}>
              {getSlicedText(item.name, 18)}
            </StyledText>
            <Text
              style={styles.profileDescriptionText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {getSlicedText(item.Mobile, 18)}
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

  const onRefresh = () => {
    if (isMount) {
      setisRefreshing(true);
    }
    handleGoogleContacts(null);
  };

  const onEndReached = () => {
    if (contactToken !== null || contactToken !== 'Reached End') {
      if (isMount) {
        setisLoadMore(true);
        handleGoogleContacts(contactToken);
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
      {isListLoading ? (
        <Loader indicatorColor={COLORS.white} bgColor={COLORS.transparent} />
      ) : (
        <>
          <FlatList
            data={contactList}
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
            onEndReachedThreshold={0.2}
            onEndReached={onEndReached}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={renderSeperator}
            ListFooterComponent={renderFooter}
          />
        </>
      )}
      <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
        <Loader bgColor={COLORS.transparentDimColor} />
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
  divider: {
    height: 10,
  },
  emptyComponent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
