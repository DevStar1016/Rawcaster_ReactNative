import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../../Components/HOCView';
import {COLORS} from '../../../../Utilities/Colors';
import ReferalDashboardHeader from './ReferalDashboardHeader';
import {useToken} from '../../../../Utilities/StoreData';
import {getReferralListService} from '../../../../Services/ApiService';
import StyledText from '../../../../Components/StyledText';
import SVGIcon from '../../../../Components/SVGIcon';
import {getSlicedText} from '../../../../Utilities/Methods';
import ProfileWithBadge from '../../../../Components/ProfileWithBadge';
import {FONTS} from '../../../../Utilities/Fonts';
import moment from 'moment';
var isMount = true;
var currentPage = 1;
var totalPages = 1;
const ReferalDashboard = () => {
  const token = useToken();
  const [referalList, setreferalList] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [countData, setcountData] = useState({
    referalCount: 0,
    referalNeededCount: 0,
  });
  useEffect(() => {
    isMount = true;
    currentPage = 1;
    totalPages = 1;
    getReferalListAPICall();
    return () => {
      isMount = false;
      currentPage = 1;
      totalPages = 1;
    };
  }, []);

  const getReferalListAPICall = (pageNumber = 1) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('page_number', pageNumber);
    getReferralListService(formData)
      .then(res => {
        if (res.data.status === 1) {
          if (isMount) {
            if (pageNumber === 1) {
              totalPages = res.data.total_pages;
              if (res.data.referral_list) {
                setreferalList([...res.data.referral_list]);
              }
              setcountData({
                referalCount: res.data.referral_count,
                referalNeededCount: res.data.referral_needed_count,
              });
            } else {
              setreferalList(preList => [
                ...preList,
                ...res.data.referral_list,
              ]);
            }
          }
        } else if (res.data.status === 0) {
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setisLoading(false);
        }
      });
  };

  const renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.nameVerifiedIconContainer}>
          <View style={styles.nameProfileContainer}>
            <ProfileWithBadge
              profileImage={item.profile_img}
              profileSize={30}
              extraMargin={0}
              padding={0}
            />
            <View style={styles.nameContainer}>
              <StyledText style={styles.nameText}>
                {getSlicedText(item.display_name, 25)}
              </StyledText>
            </View>
          </View>
          {item.account_verified === 1 ? (
            <View style={styles.verifiedIconContainer}>
              <SVGIcon icon="tick" height={20} width={20} />
            </View>
          ) : (
            <SVGIcon icon="clock_orange" />
          )}
        </View>

        <StyledText style={styles.emailText}>{item.email_id}</StyledText>
        {item.invited_date || item.signedup_date ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            {item.invited_date ? (
              <View style={styles.dateContainer}>
                <StyledText style={styles.dateTitleText}>
                  Invited Date
                </StyledText>
                <StyledText style={styles.dateText}>
                  {moment(item.invited_date).format('DD MMM YYYY')}
                </StyledText>
              </View>
            ) : (
              false
            )}
            {item.signedup_date ? (
              <View style={styles.dateContainer}>
                <StyledText style={styles.dateTitleText}>Signed up</StyledText>
                <StyledText style={styles.dateText}>
                  {moment(item.signedup_date).format('DD MMM YYYY')}
                </StyledText>
              </View>
            ) : (
              false
            )}
          </View>
        ) : (
          false
        )}
      </View>
    );
  };

  return (
    <HOCView
      headerType="header_with_back"
      isEnableTopSafeAreaHomeHeader
      paddingHorizontal={0}
      isEnablePrimaryColorStatusBar
      backHeaderProps={{
        title: 'Referrals Dashboard',
        isTitleCenter: true,
      }}
      backgroundColor={COLORS.white}>
      <FlatList
        data={referalList}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 15}}
        ItemSeparatorComponent={() => <View style={{height: 15}} />}
        keyExtractor={item => item.user_ref_id.toString()}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={() => (
          <ReferalDashboardHeader
            listLength={referalList.length}
            referalCount={countData.referalCount}
            referalNeededCount={countData.referalNeededCount}
          />
        )}
        ListEmptyComponent={() =>
          isLoading && (
            <View style={styles.emptyDataContainer}>
              <ActivityIndicator size={'large'} color={COLORS.secondary} />
            </View>
          )
        }
      />
    </HOCView>
  );
};

export default ReferalDashboard;

const styles = StyleSheet.create({
  emptyDataContainer: {
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  verifiedIconContainer: {
    height: 25,
    width: 25,
    backgroundColor: COLORS.green,
    borderRadius: 30 / 2,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameVerifiedIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  dateContainer: {
    width: '47%',
  },
  nameText: {
    fontFamily: FONTS.DMSans.medium,
  },
  emailText: {
    fontFamily: FONTS.DMSans.medium,
    marginTop: 10,
  },
  dateTitleText: {
    fontFamily: FONTS.DMSans.medium,
  },
  dateText: {
    marginTop: 5,
    fontSize: 13,
  },
});
