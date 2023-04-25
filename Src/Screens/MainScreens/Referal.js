import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../Components/HOCView';
import SearchInput from '../../Components/SearchInput';
import {COLORS} from '../../Utilities/Colors';
import SVGIcon from '../../Components/SVGIcon';
import StyledText from '../../Components/StyledText';
import ProfileIcon from '../../Assets/Png/user.png';
import {FONTS} from '../../Utilities/Fonts';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import {
  getAuthCode,
  getSlicedText,
  htmlDecodeText,
} from '../../Utilities/Methods';
import {influencerListService} from '../../Services/ApiService';
import Loader from '../../Components/Loader';
import {RefreshControl} from 'react-native-gesture-handler';
import DefaultBackground from '../../Components/DefaultBackground';

var isMount = true;
var currentPage = 1;
var totalPages = 1;

const referalOptionsList = [
  {
    id: 1,
    icon: 'contact_rounded_fill_orange',
    name: 'Contacts',
  },
  {
    id: 2,
    icon: 'facebook_fill',
    name: 'Facebook',
  },
  {
    id: 3,
    icon: 'instagram_rounded_fill',
    name: 'Instagram',
  },
  {
    id: 4,
    icon: 'share_rounded_fill_blue',
    name: 'Invite fans',
  },
];

const Referal = ({navigation}) => {
  const [suggestedAccountsList, setsuggestedAccountsList] = useState([]);
  const [isLoadMore, setisLoadMore] = useState(false);
  const [isRefreshing, setisRefreshing] = useState(false);

  const [isListLoading, setisListLoading] = useState(false);
  useEffect(() => {
    handleSuggestedProfile(1);
  }, []);

  const handleSuggestedProfile = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', 'RAWCAST');
    formData.append('auth_code', getAuthCode('RAWCAST'));
    formData.append('page_number', pageNumber);
    influencerListService(formData)
      .then(res => {
        console.log(res.data);
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

            if (pageNumber === 1) {
              totalPages = parseInt(res.data.total_pages);
              setsuggestedAccountsList(decodedInfluencerList);
            } else {
              setsuggestedAccountsList(preList => [
                ...preList,
                ...decodedInfluencerList,
              ]);
            }
          } else if (res.data.status === 0) {
            setsuggestedAccountsList([]);
          }
        }
      })
      .catch(e => {
        console.log(e, 'asdsdasddsaas');
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

  const RederReferalOptions = ({item}) => {
    return (
      <TouchableOpacity style={styles.optionContainer}>
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
          <StyledText style={styles.profileDescriptionText}>
            You may know {getSlicedText(item.display_name, 18)}
          </StyledText>
        </View>
        <TouchableOpacity style={styles.BecomeFanBtn}>
          <StyledText style={styles.BecomeFanBtnText}>Become a fan</StyledText>
        </TouchableOpacity>
        <TouchableOpacity>
          <SVGIcon icon="close_white" height={8} width={8} />
        </TouchableOpacity>
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
      }}>
      <SearchInput
        marginVertical={15}
        searchButtonColor={COLORS.secondary}
        placeHolderText="Search by name"
      />
      {referalOptionsList.map((item, index) => (
        <RederReferalOptions key={index} item={item} />
      ))}
      <View style={styles.headingContainer}>
        <StyledText style={styles.headingText}>Suggested accounts</StyledText>
        <SVGIcon icon="info" height={14} width={14} />
      </View>
      {isListLoading ? (
        <Loader indicatorColor={COLORS.primary} />
      ) : (
        // suggestedAccountsList.map((item, index) => (
        //   <RenderSuggestedProfile key={index} item={item} />
        // ))
        <FlatList
          // data={getFilteredDuplicatesList(profileList, 'user_ref_id')}
          data={suggestedAccountsList}
          scrollEnabled={false}
          renderItem={({item}) => {
            return (
              <RenderSuggestedProfile
                item={item}
                // onBecomeFan={() => {
                //   handleBecomeFan(item.user_ref_id);
                // }}
                // onConnectionRequest={() => {
                //   handleSendFriendRequest(item.user_ref_id, item.user_id);
                // }}
              />
            );
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
      )}
    </HOCView>
  );
};

export default Referal;

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
    height: 35,
    width: 35,
    borderRadius: 30,
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
    width: '50%',
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
