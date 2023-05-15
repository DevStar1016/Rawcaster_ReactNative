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
import {getSlicedText} from '../../../Utilities/Methods';

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
        <StyledText style={styles.profileNameText}>
          {getSlicedText(item.display_name, 20)}
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
          isEnableSearch={false}
          // isEnableBack
          // onPressBack={() => {
          //   navigation.goBack();
          // }}
          isEnableLive={false}
        />
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
                  return <View style={{width: 10}} />;
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
  },
  profileNameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  topTabContainer: {
    flex: 1,
  },
});
