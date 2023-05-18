import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import CustomHomeHeader from '../../../Components/CustomHomeHeader';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../../Utilities/Colors';
import SearchInput from '../../../Components/SearchInput';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import {useConnectionsList, useProfile} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import ConnectionsGroupsTopTabNavigation from '../../../Navigation/TopTabNavigation/ConnectionsGroupsTopTabNavigation';
import {MyConnectionsContext} from '../../../Utilities/Contexts';
import DefaultBackground from '../../../Components/DefaultBackground';

const UsersGroupsListHome = () => {
  const navigation = useNavigation();
  const connectionsList = useConnectionsList();
  const [focusedTab, setfocusedTab] = useState(1); //1 - user, 2- group
  const [searchText, setsearchText] = useState('');
  const [headerHeight, setheaderHeight] = useState(0);

  const myConnectionsContextValue = {
    searchText: searchText,
    setFocusedTab: setfocusedTab,
    // setisActionLoading: setisActionLoading,
    // topLayerHeight: topLayerHeight + 50,
  };

  function getList() {
    return [...connectionsList].filter(item => parseInt(item.online) === 1);
  }

  function onLayout(e) {
    setheaderHeight(e.nativeEvent.layout.height);
  }

  function renderRecentChatItem({item, index}) {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.8}>
        <ProfileWithBadge
          profileImage={item.profile_img}
          padding={0}
          isEnableOnlineOfflineStatus
          isOnline
        />

        <StyledText
          style={styles.profileNameText}
          normalTextModeTextProps={{numberOfLines: 1}}>
          {item.display_name}
        </StyledText>
      </TouchableOpacity>
    );
  }

  return (
    <MyConnectionsContext.Provider value={myConnectionsContextValue}>
      <View style={styles.mainContainer}>
        <CustomHomeHeader
          title="My Connections"
          isEnableSafeArea
          bgColor={COLORS.transparent}
          isEnableSearch={true}
          isEnableLive={false}
        />
        <DefaultBackground isEnableRLogo={false} bgColor={COLORS.primaryDark} />
        <View style={styles.contentContainer}>
          <View onLayout={onLayout}>
            <SearchInput
              placeHolderText={`Search ${
                focusedTab === 2 ? 'Group' : 'Connection'
              }`}
              searchWhenClickedButton={false}
              onSearch={setsearchText}
              marginTop={15}
              marginBottom={10}
              searchButtonColor={COLORS.secondary}
              marginHorizontal={10}
            />
            <View style={{paddingBottom: 10}}>
              <FlatList
                data={getList()}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{paddingHorizontal: 10}}
                showsHorizontalScrollIndicator={false}
                renderItem={renderRecentChatItem}
                ItemSeparatorComponent={() => {
                  return <View style={{width: 5}} />;
                }}
              />
            </View>
          </View>
          <View style={styles.topTabContainer}>
            <ConnectionsGroupsTopTabNavigation />
          </View>
        </View>
      </View>
    </MyConnectionsContext.Provider>
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
    paddingBottom: 50,
  },

  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
  },
  profileNameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
    textAlign: 'center',
  },
  topTabContainer: {
    flex: 1,
  },
});
