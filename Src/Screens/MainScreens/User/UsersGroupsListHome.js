import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import SearchInput from '../../../Components/SearchInput';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useProfile} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import ConnectionsGroupsTopTabNavigation from '../../../Navigation/TopTabNavigationSearch/ConnectionsGroupsTopTabNavigation';

const UsersGroupsListHome = () => {
  const navigation = useNavigation();
  const profile = useProfile();

  function renderRecentChatItem({item, index}) {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
        <ProfileWithBadge
          profileImage={profile.profile_image}
          padding={0}
          isEnableOnlineOfflineStatus
          isOnline
        />
        <StyledText style={styles.profileNameText}>Solomon</StyledText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <CustomHomeHeader
        title="My Connections"
        isEnableSafeArea
        isEnableSearch={false}
        isEnableBack
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View style={styles.contentContainer}>
        <SearchInput
          placeHolderText="Search Connection"
          marginTop={15}
          marginBottom={10}
          searchButtonColor={COLORS.secondary}
          marginHorizontal={10}
        />
        <View style={{paddingBottom: 10}}>
          <FlatList
            data={[...Array(6)]}
            horizontal
            contentContainerStyle={{paddingHorizontal: 10}}
            showsHorizontalScrollIndicator={false}
            renderItem={renderRecentChatItem}
            ItemSeparatorComponent={() => {
              return <View style={{width: 10}} />;
            }}
          />
        </View>
        <View style={styles.topTabContainer}>
          <ConnectionsGroupsTopTabNavigation />
        </View>
      </View>
    </View>
  );
};

export default UsersGroupsListHome;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },

  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  topTabContainer: {
    flex: 1,
  },
});
