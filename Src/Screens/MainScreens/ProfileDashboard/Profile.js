import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import ProfileTopSection from './ProfileTopSection';
import ProfileNameBioContainer from './ProfileNameBioContainer';
import ProfileIntroContainer from './ProfileIntroContainer';
import {COLORS} from '../../../Utilities/Colors';
import {
  useConnectionsList,
  useInsets,
  useNuggetsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {getAuthCode, htmlDecodeText} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getOthersProfileService,
  listNuggetsService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ProfilesListContainerWithSeeAll from './ProfilesListContainerWithSeeAll';
import DefaultBackground from '../../../Components/DefaultBackground';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import Loader from '../../../Components/Loader';
import {NuggetParentActionsContext} from '../../../Utilities/Contexts';
import {useNavigation} from '@react-navigation/native';
import Nugget from '../HomeScreen/Nugget';
import SVGIcon from '../../../Components/SVGIcon';
import {DIMENSIONS} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
const PADDING_HORIZONTAL = 10;

var currentPage = 1;
var totalPages = 1;
const Profile = ({route}) => {
  let isMount = true;
  const {userId} = route.params ?? {};
  const navigation = useNavigation();
  const token = useToken();
  const profile = useProfile();
  const myNuggetsList = useNuggetsList();
  const insets = useInsets();
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);
  const [isListLoading, setisListLoading] = useState(false);
  const connections = useConnectionsList();
  const flatlistRef = useRef(null);
  const [nuggetsList, setnuggetsList] = useState(
    userId ? [] : [...myNuggetsList],
  );
  const [isMuted, setisMuted] = useState(true);
  const [isLoading, setisLoading] = useState(userId ? true : false);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [othersProfile, setothersProfile] = useState(null);
  const [emptyText, setemptyText] = useState(null);
  const [viewableItem, setviewableItem] = useState({
    nugget_id: '',
    viewed: false,
  });
  const viewConfigRef = useRef({
    waitForInteraction: false,
    minimumViewTime: 500,
    viewAreaCoveragePercentThreshold: 70,
  });
  const onViewRef = useRef(viewableItems => {
    if (viewableItems?.viewableItems?.length > 0) {
      setviewableItem({
        nugget_id: viewableItems.viewableItems[0].item.nugget_id || 0,
        viewed: viewableItems.viewableItems[0].item.viewed,
      });
    }
  });

  const Divider = () => {
    return <View style={styles.divider} />;
  };

  useEffect(() => {
    currentPage = 1;
    totalPages = 1;
    isMount = true;

    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  useEffect(() => {
    if (userId) {
      if (isMount) {
        setisLoading(true);
      }

      getOthersProfileAPI();
    }
  }, [userId]);

  useEffect(() => {
    if (
      (userId && othersProfile && parseInt(othersProfile.lock_nugget) === 0) ||
      (!userId && profile)
    ) {
      if (isMount) {
        setisListLoading(true);
        setnuggetsList([]);
      }
      listNuggetsAPICall(1);
    }
  }, [userId, othersProfile]);

  const getOthersProfileAPI = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_id', userId);
    getOthersProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setothersProfile({
            ...res.data.profile,
            first_name: htmlDecodeText(res.data.profile?.first_name),
            name: htmlDecodeText(res.data.profile?.name),
            last_name: htmlDecodeText(res.data.profile?.last_name),
          });
        } else if (res.data.status === 0) {
          setemptyText(res.data.msg);
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
  };

  function handleBecomeFan() {
    // 1 - follow, 2 - unfollow
    if (isMount) {
      setisActionLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('follow_userid', othersProfile.user_ref_id);
    formData.append('type', 1);
    followAndUnfollowService(formData)
      .then(res => {
        if (res.data.status === 1) {
          Toast.success(res.data.msg);
          setothersProfile(preData => {
            return {
              ...preData,
              follow: true,
            };
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
          setisActionLoading(false);
        }
      });
  }

  const listNuggetsAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', pageNumber);
    if (userId || profile?.user_id) {
      formData.append('user_id', userId ?? profile?.user_id);
    }
    listNuggetsService(formData)
      .then(res => {
        if (isMount) {
          if (res.data.status === 1) {
            let decodedNuggetList = [...res.data.nuggets_list].map(item => {
              return {
                ...item,
                content: htmlDecodeText(item.content),
                original_user_name: htmlDecodeText(item.original_user_name),
                user_name: htmlDecodeText(item.user_name),
              };
            });

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);

              setnuggetsList(decodedNuggetList);
            } else {
              setnuggetsList(preList => [...preList, ...decodedNuggetList]);
            }
          } else if (res.data.status === 0) {
            setnuggetsList([]);
          }
        }
      })
      .catch(e => {
        if (isMount) {
          setnuggetsList([]);
        }
      })
      .finally(() => {
        if (isMount) {
          setisLoadMore(false);
          setisRefreshing(false);
          setisListLoading(false);
        }
      });
  };

  const isShowProfile = () => {
    if (userId) {
      if (othersProfile) {
        return true;
      }
      return false;
    } else if (profile) {
      return true;
    }
    return false;
  };

  const getProfileData = () => {
    if (userId) {
      return othersProfile;
    }
    return profile;
  };

  const keyExtractor = useCallback((item, _) => item.nugget_id.toString(), []);
  const getItemLayout = useCallback(
    (_, index) => ({
      length: insets.mediaHeight,
      offset: insets.mediaHeight * index,
      index,
    }),
    [],
  );

  function scrollNuggetsListToTop() {
    // flatlistRef.current.scrollToOffset({animated: false, offset: 0});
  }

  const nuggetActions = {
    headerContainerHeight: 0,
    isMuted: isMuted,
    setisMuted: setisMuted,
    isAutoPlay: false,
    scrollNuggetsListToTop: scrollNuggetsListToTop,
    // viewableNuggetItem: viewableItem.nugget_id,
    viewableNuggetItem: viewableItem?.nugget_id,
    isFromGlobalSearch: false,
    isEnableADDButton: false,
    isEnableTopInsetsPadding: true,
    textNuggetNumberOfLines: 15,
    isEnableHeaderContainerHeightforTopButtons: true,
    onFinishPlaying: index => {
      if (index < nuggetsList.length - 1) {
        flatlistRef.current.scrollToIndex({
          index: index + 1,
        });
      }
    },
  };

  const onEndReached = () => {
    currentPage = currentPage + 1;
    if (currentPage <= totalPages) {
      if (isMount) {
        setisLoadMore(true);
        listNuggetsAPICall(currentPage);
      }
    }
  };

  const renderNuggetItem = useCallback(renderItem, [
    nuggetsList,
    isMuted,
    viewableItem,
  ]);

  function renderItem({item, index}) {
    return <Nugget nugget={item} nuggetIndex={index} />;
  }

  const renderFooter = () => {
    return isLoadMore ? (
      <View style={{flex: 1, backgroundColor: COLORS.primary}}>
        <ActivityIndicator size={'small'} color={COLORS.white} />
      </View>
    ) : null;
  };

  function renderHeader() {
    return (
      <View style={{flex: 1, backgroundColor: COLORS.white, paddingBottom: 10}}>
        <ProfileTopSection
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
        />
        <ProfileNameBioContainer
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
          onPressBecomeFan={() => {
            handleBecomeFan();
          }}
        />
        <Divider />
        <ProfileIntroContainer
          userId={userId}
          profile={getProfileData()}
          paddingHorizontal={PADDING_HORIZONTAL}
        />

        {!userId ? (
          <>
            <Divider />
            <ProfilesListContainerWithSeeAll
              listType="unclaimed_influencers"
              title={'Unclaimed Influencers Account'}
              paddingHorizontal={PADDING_HORIZONTAL}
              ProfileItemProps={{
                topRightIcon: 'shield_secondary',
                topRightIconContainerBackgroundColor: COLORS.white,
              }}
            />
          </>
        ) : (
          false
        )}
        <Divider />

        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId
              ? Boolean(parseInt(getProfileData().lock_my_influencer))
              : false
          }
          listType="influencers"
          title={'Influencers'}
          paddingHorizontal={PADDING_HORIZONTAL}
          // ProfileItemProps={{
          //   topRightIcon: 'message_primary',
          //   topRightIconContainerBackgroundColor: COLORS.white,
          // }}
        />
        <Divider />
        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId ? Boolean(parseInt(getProfileData().lock_fans)) : false
          }
          listType="fans"
          title={'Fans'}
          paddingHorizontal={PADDING_HORIZONTAL}
          isDisplayChat
          isDisplayEvent
          onPressChat={() => {
            navigation.navigate('InfluencerChat');
          }}
        />
        <Divider />

        <ProfilesListContainerWithSeeAll
          userId={userId}
          isLock={
            userId
              ? Boolean(parseInt(getProfileData().lock_my_connection))
              : false
          }
          list={userId ? [] : [...connections]}
          listType="connections"
          title={'Connections'}
          paddingHorizontal={PADDING_HORIZONTAL}
        />
      </View>
    );
  }

  return (
    <NuggetParentActionsContext.Provider value={nuggetActions}>
      <View style={{flex: 1}}>
        <View
          style={
            !isLoading &&
            !isShowProfile() && {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }
          }>
          <CustomHomeHeader
            isEnableProfile={false}
            isEnableSearch={false}
            isEnableSettings={true}
            isEnableBack
            onPressBack={() => {
              navigation.goBack();
            }}
            isEnableSafeArea
            bgColor={
              !isLoading && !isShowProfile()
                ? COLORS.transparent
                : COLORS.primary
            }
            isEnableAddUserButton={
              userId &&
              othersProfile &&
              (othersProfile.friend_status === null ||
                othersProfile.friend_status === '')
                ? true
                : false
            }
          />
        </View>

        {isLoading ? (
          <Loader
            indicatorColor={COLORS.primary}
            loaderText={'Fetching Profile'}
            loaderTextColor={COLORS.primary}
          />
        ) : isShowProfile() ? (
          <FlatList
            ref={flatlistRef}
            showsVerticalScrollIndicator={false}
            data={nuggetsList}
            keyExtractor={keyExtractor}
            contentContainerStyle={{
              // paddingBottom: 20,
              backgroundColor: COLORS.white,
            }}
            // pagingEnabled
            // getItemLayout={getItemLayout}
            renderItem={renderNuggetItem}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={() => {
              return isListLoading ? (
                <View style={{alignItems: 'center'}}>
                  <ActivityIndicator color={COLORS.primary} size="large" />
                </View>
              ) : (
                parseInt(getProfileData().lock_nugget) === 1 && (
                  <View style={styles.lockNuggetsContainer}>
                    <SVGIcon icon="logo_R" width={'50%'} height={'50%'} />
                    <BlurOverlay />
                  </View>
                )
              );
            }}
            renderFooter={renderFooter}
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
          />
        ) : // <BigList
        //   showsVerticalScrollIndicator={false}
        //   data={[...Array(6)]}
        //   keyExtractor={keyExtractor}
        //   getItemLayout={getItemLayout}
        //   renderItem={() => <View />}
        //   // pagingEnabled
        //   // refreshControl={
        //   //   <RefreshControl
        //   //     tintColor={COLORS.secondary}
        //   //     refreshing={refreshing}
        //   //     onRefresh={onRefresh}
        //   //   />
        //   // }
        //   // onEndReachedThreshold={0.5}
        //   // onEndReached={onEndReached}
        //   itemHeight={insets.mediaHeight}
        //   // renderHeader={renderHeader}
        //   ListHeaderComponent={renderHeader}
        //   contentContainerStyle={{flex: 1}}
        //   // headerHeight={hei => null}
        //   // footerHeight={50}
        //   // onViewableItemsChanged={onViewRef.current}
        //   // renderFooter={renderFooter}
        // />
        emptyText ? (
          <View style={styles.emptyComponent}>
            <DefaultBackground centerText={emptyText} />
          </View>
        ) : null}
        <Modal onRequestClose={() => {}} transparent visible={isActionLoading}>
          <Loader bgColor={COLORS.transparentDimColor} />
        </Modal>
      </View>
    </NuggetParentActionsContext.Provider>
  );
};

export default Profile;

const styles = StyleSheet.create({
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginVertical: 12,
  },
  emptyComponent: {
    flex: 1,
    backgroundColor: 'green',
  },
  lockNuggetsContainer: {
    height: DIMENSIONS.window.height,
    width: DIMENSIONS.window.width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
});
