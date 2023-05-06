import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import TitleRowContainer from './TitleRowContainer';
import ProfileWithBadge, {
  ProfileWithBadgeProps,
} from '../../../Components/ProfileWithBadge';
import {useToken} from '../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
import SVGIcon from '../../../Components/SVGIcon';
import {StackActions, useNavigation} from '@react-navigation/native';
import UsersProfilesDoubleRowListLoader from '../../../Components/Skelotons/UsersProfilesDoubleRowListLoader';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {
  getFollowListService,
  listAllFriendsService,
  listUnClaimAccountService,
} from '../../../Services/ApiService';

type Props = {
  userId?: any;
  paddingHorizontal?: number;
  isLock?: boolean;
  list?: [];
  title?: string;
  listType: 'connections' | 'influencers' | 'fans' | 'unclaimed_influencers';
  ProfileItemProps: ProfileWithBadgeProps;
  isDisplayChat?: boolean;
  onPressChat?: () => void;
  isDisplayEvent?: boolean;
  onPressEvent?: () => void;
};

const EXTRA_MARGIN = 10;
const PROFILE_CONTAINER_MARGIN = 18;
const ProfilesListContainerWithSeeAll = ({
  userId,
  paddingHorizontal = 0,
  isLock,
  list = [],
  title = '',
  listType,
  ProfileItemProps,
  isDisplayChat = false,
  onPressChat,
  isDisplayEvent = false,
  onPressEvent,
}: Props) => {
  let isMount = true;
  const navigation = useNavigation();
  const token = useToken();
  const [isLoading, setisLoading] = useState(
    !isLock && (userId || list.length) <= 0 ? true : false,
  );
  const [usersList, setusersList] = useState(list.length > 0 ? [...list] : []);
  const PROFILE_SIZE =
    (DIMENSIONS.window.width -
      paddingHorizontal * 2 -
      EXTRA_MARGIN * 3 -
      PROFILE_CONTAINER_MARGIN * 6) /
    3;

  useEffect(() => {
    isMount = true;
    if (!isLock && token && (userId || list.length <= 0)) {
      if (listType) {
        switch (listType) {
          case 'connections':
            connectionsListAPICall();
            return;
          case 'fans':
            fansListAPICall();
            return;
          case 'influencers':
            fansListAPICall(2);
            return;
          case 'unclaimed_influencers':
            unclaimedInfluencersListAPICall();
            return;
        }
      }
    }

    return () => {
      isMount = false;
    };
  }, []);

  const connectionsListAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('allfriends', 1);
    if (userId) {
      formData.append('user_id', userId);
    }
    listAllFriendsService(formData)
      .then(res => {
        console.log(res.data, 'JJKKJJ');

        if (res.data.status === 1) {
          setusersList(res.data.friends_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const fansListAPICall = (type = 1) => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', type);
    if (userId) {
      formData.append('user_id', userId);
    }
    getFollowListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setusersList(res.data.follow_list);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const unclaimedInfluencersListAPICall = () => {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    listUnClaimAccountService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setusersList(res.data.unclaim_accounts);
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  function getIsShowButton() {
    if (isLoading || isLock || usersList.length <= 6) {
      return false;
    }
    return true;
  }

  function getTitle() {
    if (isLock) {
      return title;
    }
    return `${title} (${usersList.length})`;
  }

  return (
    <View style={[styles.mainContainer, {paddingHorizontal}]}>
      <TitleRowContainer
        title={getTitle()}
        isDisplayButton={getIsShowButton()}
        onPressButton={() => {
          navigation.navigate('ProfileSeeAllUsersList', {
            initialList: [...usersList],
            userId: userId,
            listType: listType,
            title: title,
          });
        }}
        buttonType="text"
        isDisplayChat={isDisplayChat}
        onPressChat={onPressChat}
        isDisplayEvent={isDisplayEvent}
        onPressEvent={onPressEvent}
      />

      {isLoading ? (
        <UsersProfilesDoubleRowListLoader
          containerMarginHorizontal={PROFILE_CONTAINER_MARGIN}
          extraMargin={EXTRA_MARGIN}
          itemSize={PROFILE_SIZE}
        />
      ) : (
        <View style={styles.profilesContainer}>
          {isLock ? (
            [...Array(6)].map((_, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  disabled={isLock}
                  activeOpacity={0.8}
                  style={{
                    alignItems: 'center',
                    marginHorizontal: PROFILE_CONTAINER_MARGIN,
                    marginVertical: 10,
                    width: PROFILE_SIZE + EXTRA_MARGIN,
                  }}>
                  <ProfileWithBadge
                    extraMargin={0}
                    isEnableGradient={false}
                    profileSize={PROFILE_SIZE}
                  />
                  <View style={{flex: 1, paddingTop: 10}}>
                    <StyledText style={{textAlign: 'center'}}>
                      Rawcaster
                    </StyledText>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : usersList && usersList.length > 0 ? (
            <View style={styles.profilesContainer}>
              {[...usersList]
                .filter((_, index) => index < 6)
                .map((item: any, index) => {
                  return (
                    <TouchableOpacity
                      key={index.toString()}
                      disabled={isLock}
                      activeOpacity={0.8}
                      onPress={() => {
                        const pushAction = StackActions.push('ProfileStack', {
                          userId: item.user_id,
                        });
                        navigation.dispatch(pushAction);
                      }}
                      style={{
                        alignItems: 'center',
                        marginHorizontal: PROFILE_CONTAINER_MARGIN,
                        marginVertical: 10,
                        width: PROFILE_SIZE + EXTRA_MARGIN,
                      }}>
                      <ProfileWithBadge
                        extraMargin={0}
                        isEnableGradient={false}
                        profileSize={PROFILE_SIZE}
                        profileImage={item.profile_img}
                        topRightIconAsButton
                        onPressTopRightIcon={() => {
                          if (listType === 'unclaimed_influencers') {
                            navigation.navigate('ClaimAccount', {
                              influencerId: item.user_id,
                            });
                          } else if (listType === 'influencers') {
                            navigation.navigate('InfluencerChat', {
                              influencerId: item.user_id,
                              influencerName: item.display_name,
                            });
                          }
                        }}
                        {...ProfileItemProps}
                      />
                      <View style={{flex: 1, paddingTop: 10}}>
                        <StyledText style={{textAlign: 'center'}}>
                          {getSlicedText(item.display_name.trim(), 15)}
                        </StyledText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 35,
              }}>
              <SVGIcon
                icon="user_list_placeholder"
                height={(35 / 100) * (DIMENSIONS.window.width - 20)}
                width={(35 / 100) * (DIMENSIONS.window.width - 20)}
              />
            </View>
          )}
          {isLock && <BlurOverlay />}
        </View>
      )}
    </View>
  );
};

export default ProfilesListContainerWithSeeAll;

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 16,
  },
  seeAllButtonText: {
    color: COLORS.secondary,
    fontFamily: FONTS.DMSans.medium,
  },
  profilesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
