import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import ProfileTopSection from './ProfileTopSection';
import ProfileNameBioContainer from './ProfileNameBioContainer';
import ProfileIntroContainer from './ProfileIntroContainer';
import {COLORS} from '../../../Utilities/Colors';
import {
  useConnectionsList,
  useInsets,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {getAuthCode, htmlDecodeText} from '../../../Utilities/Methods';
import {
  followAndUnfollowService,
  getOthersProfileService,
} from '../../../Services/ApiService';
import Toast from '../../../Components/Toast';
import ProfilesListContainerWithSeeAll from './ProfilesListContainerWithSeeAll';
import DefaultBackground from '../../../Components/DefaultBackground';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import Loader from '../../../Components/Loader';
const PADDING_HORIZONTAL = 10;
const Profile = ({route}) => {
  let isMount = true;
  const {userId} = route.params ?? {};
  const token = useToken();
  const profile = useProfile();
  const insets = useInsets();
  const connections = useConnectionsList();
  const [isLoading, setisLoading] = useState(userId ? true : false);
  const [isActionLoading, setisActionLoading] = useState(false);
  const [othersProfile, setothersProfile] = useState(null);
  const [emptyText, setemptyText] = useState(null);
  const Divider = () => {
    return <View style={styles.divider} />;
  };

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
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

  const getOthersProfileAPI = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('user_id', userId);
    console.log(formData, 'FORMDATA');
    getOthersProfileService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setothersProfile({
            ...res.data.profile,
            first_name: htmlDecodeText(res.data.profile.first_name),
            name: htmlDecodeText(res.data.profile.name),
            last_name: htmlDecodeText(res.data.profile.last_name),
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

  const renderHeader = () => {
    return (
      <View style={{flex: 1, backgroundColor: COLORS.white}}>
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
          ProfileItemProps={{
            topRightIcon: 'message_primary',
            topRightIconContainerBackgroundColor: COLORS.white,
          }}
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
  };

  return (
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
          isEnableSafeArea
          bgColor={
            !isLoading && !isShowProfile() ? COLORS.transparent : COLORS.primary
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
          showsVerticalScrollIndicator={false}
          data={[]}
          keyExtractor={keyExtractor}
          contentContainerStyle={{
            paddingBottom: 20,
            backgroundColor: COLORS.white,
          }}
          getItemLayout={getItemLayout}
          renderItem={() => <View />}
          ListHeaderComponent={renderHeader}
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
});
