import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import HOCView from '../../Components/HOCView';
import {COLORS} from '../../Utilities/Colors';
import {FONTS} from '../../Utilities/Fonts';
import StyledText from '../../Components/StyledText';
import SVGIcon from '../../Components/SVGIcon';
import {useProfile} from '../../Utilities/StoreData';

const PlansAndPrice = () => {
  const profile = useProfile();
  const [selectedTab, setselectedTab] = useState(1);
  const [plansList, setplansList] = useState([
    {
      id: 1,
      name: 'Valued Member',
      price: 'Free',
      tenure: 'Monthly',
      tenure_id: 1,
      badge: 'valued',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to One-on-One chat enabled.'},
        {id: 3, name: 'Full access to one-on-one Video and audio call'},
        {id: 4, name: 'Host up to 15 participants for up to 2hrs.'},
        {id: 5, name: 'Record events on PC'},
      ],
    },
    {
      id: 2,
      name: 'Premium',
      price: '$3',
      tenure: 'Monthly',
      tenure_id: 1,
      badge: 'premium',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to chat features'},
        {id: 3, name: 'Full access to Events features'},
        {id: 4, name: 'Host up to 25 participants.'},
        {id: 5, name: 'Up to 4hrs meeting time per event.'},
        {id: 6, name: 'All event features enabled'},
        {id: 7, name: 'Record events on the cloud'},
        {id: 8, name: 'Talk-show events with interaction with audience'},
        {id: 9, name: 'Full access to Rawcaster video and audio call'},
        {id: 10, name: 'Talk-show program without co-hosts'},
      ],
    },
    {
      id: 3,
      name: 'Diamond',
      price: '$7',
      tenure: 'Monthly',
      tenure_id: 1,
      badge: 'diamond',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to chat features'},
        {id: 3, name: 'Full access to Events features'},
        {id: 4, name: 'Host up to 150 participants in a meeting event.'},
        {id: 5, name: 'Unlimited meeting time per event.'},
        {id: 6, name: 'Talk-Show program with up to 3 co-hosts'},
        {id: 7, name: 'Full use of Rawcaster Live Events'},
        {id: 8, name: 'Record events on the cloud'},
        {id: 9, name: 'Talk-show events with interaction with audience'},
        {id: 10, name: 'Full access to Rawcaster video and audio call'},
      ],
    },
    {
      id: 4,
      name: 'Valued Member',
      price: 'Free',
      tenure: 'Annually',
      tenure_id: 2,
      badge: 'valued',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to One-on-One chat enabled.'},
        {id: 3, name: 'Full access to one-on-one Video and audio call'},
        {id: 4, name: 'Host up to 15 participants for up to 2hrs.'},
        {id: 5, name: 'Record events on PC'},
      ],
    },
    {
      id: 5,
      name: 'Premium',
      price: '$30',
      tenure: 'Annually',
      tenure_id: 2,
      badge: 'premium',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to chat features'},
        {id: 3, name: 'Full access to Events features'},
        {id: 4, name: 'Host up to 25 participants.'},
        {id: 5, name: 'Up to 4hrs meeting time per event.'},
        {id: 6, name: 'All event features enabled'},
        {id: 7, name: 'Record events on the cloud'},
        {id: 8, name: 'Talk-show events with interaction with audience'},
        {id: 9, name: 'Full access to Rawcaster video and audio call'},
        {id: 10, name: 'Talk-show program without co-hosts'},
      ],
    },
    {
      id: 6,
      name: 'Diamond',
      price: '$79.99',
      tenure: 'Annually',
      tenure_id: 2,
      badge: 'diamond',
      benefits: [
        {id: 1, name: 'Full access to Nuggets features'},
        {id: 2, name: 'Full access to chat features'},
        {id: 3, name: 'Full access to Events features'},
        {id: 4, name: 'Host up to 150 participants in a meeting event.'},
        {id: 5, name: 'Unlimited meeting time per event.'},
        {id: 6, name: 'Talk-Show program with up to 3 co-hosts'},
        {id: 7, name: 'Full use of Rawcaster Live Events'},
        {id: 8, name: 'Record events on the cloud'},
        {id: 9, name: 'Talk-show events with interaction with audience'},
        {id: 10, name: 'Full access to Rawcaster video and audio call'},
      ],
    },
  ]);

  const getIsCurrentPlan = plan => {
    if (parseInt(profile?.user_status_id) === 1 && (plan === 1 || plan === 4)) {
      return true;
    } else if (
      parseInt(profile?.user_status_id) === 3 &&
      (plan === 2 || plan === 5)
    ) {
      return true;
    } else if (
      parseInt(profile?.user_status_id) === 4 &&
      (plan === 3 || plan === 6)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const Divider = () => {
    return <View style={styles.divider} />;
  };
  const renderPlan = ({item}) => {
    return (
      <View style={styles.planCard}>
        <View style={styles.rowContainer}>
          <View>
            <StyledText style={styles.nameText}>{item.name}</StyledText>
            <StyledText style={styles.priceText}>{item.price}</StyledText>
            <StyledText style={styles.tenureText}>{item.tenure}</StyledText>
          </View>
          <SVGIcon icon={item.badge} width={60} height={60} />
        </View>
        <Divider />
        {item.benefits.map((value, index) => {
          return (
            <View style={styles.benefitsContainer} key={index}>
              <SVGIcon icon="tick_rounded_fill_pink" />
              <StyledText style={styles.benefitsText}>{value.name}</StyledText>
            </View>
          );
        })}
        <Divider />
        <TouchableOpacity style={styles.currentBtn}>
          <StyledText style={styles.btnText}>
            {getIsCurrentPlan(item.id) ? 'Current Plan' : 'Upgrade Plan'}
          </StyledText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <HOCView
      headerType="home_header"
      // isEnableTopSafeAreaHomeHeader
      headerProps={{
        bgColor: COLORS.primary,
        isEnableSearch: true,
        isEnableBack: true,
      }}
      isEnablePrimaryColorStatusBar
      //   isEnableDefaultBackground
      isEnableScroll
      isEnableRLogo={false}
      paddingBottom={10}
      backgroundColor={COLORS.white}>
      <StyledText style={styles.header}>Plans & Pricing</StyledText>
      <StyledText style={styles.describtion}>
        Whether your time-saving automation needs are large or small, we’re here
        to help you scale.
      </StyledText>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor:
                selectedTab === 1 ? COLORS.primary : COLORS.lightGrey,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setselectedTab(1);
          }}>
          <StyledText
            style={{
              color: selectedTab === 1 ? COLORS.white : COLORS.black,
            }}>
            Monthly
          </StyledText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              backgroundColor:
                selectedTab === 2 ? COLORS.primary : COLORS.lightGrey,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            setselectedTab(2);
          }}>
          <StyledText
            style={{
              color: selectedTab === 2 ? COLORS.white : COLORS.black,
            }}>
            Annual
          </StyledText>
        </TouchableOpacity>
      </View>
      <FlatList
        data={plansList.filter(val => val.tenure_id === selectedTab)}
        renderItem={renderPlan}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => {
          return <View style={{height: 10, width: 10}} />;
        }}
        keyExtractor={item => item.id.toString()}
        scrollEnabled={false}
      />
    </HOCView>
  );
};

export default PlansAndPrice;

const styles = StyleSheet.create({
  header: {
    fontFamily: FONTS.DMSans.bold,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  describtion: {
    color: COLORS.grey,
    textAlign: 'center',
  },
  tabContainer: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 25,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    alignSelf: 'center',
  },
  tab: {
    height: 35,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 25,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    padding: 10,
    backgroundColor: COLORS.white,
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  divider: {
    height: 1,
    borderWidth: 0.5,
    borderStyle: 'dashed',
    borderColor: COLORS.dividerColor,
    marginVertical: 10,
  },
  nameText: {
    fontFamily: FONTS.Inter.bold,
    fontSize: 16,
    marginBottom: 5,
  },
  priceText: {
    fontFamily: FONTS.Inter.black,
    fontSize: 20,
    marginBottom: 5,
  },
  tenureText: {
    fontFamily: FONTS.Inter.regular,
    color: COLORS.grey,
  },
  benefitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  benefitsText: {
    fontFamily: FONTS.Inter.regular,
    marginLeft: 10,
  },
  currentBtn: {
    height: 40,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  btnText: {
    fontFamily: FONTS.Inter.regular,
    color: COLORS.white,
  },
});
