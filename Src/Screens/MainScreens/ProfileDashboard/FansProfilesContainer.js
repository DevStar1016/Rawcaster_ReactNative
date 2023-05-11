import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile, useToken} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {COLORS} from '../../../Utilities/Colors';
import {FONTS} from '../../../Utilities/Fonts';
import {getFollowListService} from '../../../Services/ApiService';
import FansProfilesLoader from '../../../Components/Skelotons/FansProfilesLoader';

const FansProfilesContainer = ({profileSize = 40, userId}) => {
  let isMount = true;
  const token = useToken();
  const [fansListData, setfansListData] = useState({
    list: [],
    count: 0,
  });
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    isMount = true;
    if (token) {
      getFollowListAPICall();
    }

    return () => (isMount = false);
  }, []);

  const getFollowListAPICall = () => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('type', 2);
    if (userId) {
      formData.append('user_id', userId);
    }
    getFollowListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          setfansListData({
            list: res.data.follow_list,
            count: res.data.follow_count,
          });
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const getFansCount = () => {
    let tempCount = fansListData.count - 3;
    if (tempCount > 99) {
      return '99+';
    }
    return tempCount;
  };

  return (
    <View style={styles.mainContainer}>
      {isLoading ? (
        <FansProfilesLoader profileSize={profileSize} />
      ) : (
        fansListData.list.length > 0 &&
        [...fansListData.list].slice(0, 4).map((item, index) => {
          return (
            <ProfileWithBadge
              key={index.toString()}
              profileImage={index < 3 ? item.profile_img : null}
              profileSize={profileSize}
              containerStyle={{marginLeft: -12}}
              extraMargin={0}
              alternateProfileImageComponent={() => {
                return (
                  <StyledText style={styles.fansCountText}>
                    {getFansCount()}
                  </StyledText>
                );
              }}
              isEnableWhiteBorderArroundGradient={index < 3 ? false : true}
              isEnableGradient={index < 3 ? false : true}
            />
          );
        })
      )}
    </View>
  );
};

export default FansProfilesContainer;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  extraFansCountContainer: {
    marginLeft: -12,
  },
  fansCountText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    fontSize: 12,
  },
});
