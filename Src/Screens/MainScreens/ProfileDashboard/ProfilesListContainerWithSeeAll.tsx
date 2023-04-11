import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import lodash from 'lodash';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {COLORS} from '../../../Utilities/Colors';
import TitleRowContainer from './TitleRowContainer';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {
  useConnectionsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {DIMENSIONS} from '../../../Utilities/Constants';
import BlurOverlay from '../../../Components/BlurOverlay';
import SVGIcon from '../../../Components/SVGIcon';
import {StackActions, useNavigation} from '@react-navigation/native';
import UsersProfilesDoubleRowListLoader from '../../../Components/Skelotons/UsersProfilesDoubleRowListLoader';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import {
  getFollowListService,
  listAllFriendsService,
} from '../../../Services/ApiService';

type Props = {
  userId?: any;
  paddingHorizontal?: number;
  isLock?: boolean;
  list?: [];
  title?: string;
  listType: 'connections' | 'influencers' | 'fans';
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
}: Props) => {
  let isMount = true;
  const navigation = useNavigation();
  const token = useToken();
  const [isLoading, setisLoading] = useState(
    userId || list.length <= 0 ? true : false,
  );
  const [usersList, setusersList] = useState(list.length > 0 ? [...list] : []);
  const PROFILE_SIZE =
    (DIMENSIONS.window.width -
      paddingHorizontal * 2 -
      EXTRA_MARGIN * 3 -
      PROFILE_CONTAINER_MARGIN * 6) /
    3;

  const profile = useProfile();

  useEffect(() => {
    isMount = true;
    if (userId || list.length <= 0) {
      if (listType) {
        switch (listType) {
          case 'connections':
            connectionsListAPICall();
            return;
          case 'fans':
            fansListAPICall();
          case 'influencers':
            fansListAPICall(2);
            return;
        }
      }
    }

    return () => {
      isMount = false;
    };
  }, []);

  function connectionsListAPICall() {
    if (isMount) {
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    formData.append('group_ids', JSON.stringify([userId]));
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
  }

  function fansListAPICall(type = 1) {
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
  }

  function getIsShowButton() {
    if (isLoading || isLock || usersList.length <= 6) {
      return false;
    }
    return true;
  }

  return (
    <View style={[styles.mainContainer, {paddingHorizontal}]}>
      <TitleRowContainer
        title={`${title} (${usersList.length})`}
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
      />

      {isLoading ? (
        <UsersProfilesDoubleRowListLoader
          containerMarginHorizontal={PROFILE_CONTAINER_MARGIN}
          extraMargin={EXTRA_MARGIN}
          itemSize={PROFILE_SIZE}
        />
      ) : usersList && usersList.length > 0 ? (
        <View style={styles.profilesContainer}>
          {[...usersList]
            .filter((_, index) => index < 6)
            .map((item: any, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
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
                    topRightIcon="shield_secondary"
                    profileSize={PROFILE_SIZE}
                    profileImage={item.profile_img}
                  />
                  <View style={{flex: 1, paddingTop: 10}}>
                    <StyledText style={{textAlign: 'center'}}>
                      {getSlicedText(item.display_name.trim(), 15)}
                    </StyledText>
                  </View>
                </TouchableOpacity>
              );
            })}

          {isLock && <BlurOverlay />}
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
