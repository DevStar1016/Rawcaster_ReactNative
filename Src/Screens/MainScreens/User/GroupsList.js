import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {
  useGroupListLoading,
  useGroupsList,
  useToken,
} from '../../../Utilities/StoreData';
import {COLORS} from '../../../Utilities/Colors';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import StyledText from '../../../Components/StyledText';
import {FONTS} from '../../../Utilities/Fonts';
import {getAuthCode, getSlicedText} from '../../../Utilities/Methods';
import SVGIcon from '../../../Components/SVGIcon';
import {useMyConnections} from '../../../Utilities/Contexts';
import {listAllFriendGroupsService} from '../../../Services/ApiService';
import {setGroupsList} from '../../../Store/Slices/HomeSlice';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import {IS_ENABLE_CHIME_FUNCTIONALITY} from '../../../Utilities/Constants';

var isMount = true;
const GroupsList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const [containerHeight, setcontainerHeight] = useState(0);
  const isGroupListLoading = useGroupListLoading();
  const groupsList = useGroupsList();
  const {searchText} = useMyConnections();
  const [refreshing, setrefreshing] = useState(false);
  const [isShowAddButton, setisShowAddButton] = useState(true);
  const listViewOffset = useRef(0);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  /**
   * Makes an API call to retrieve a list of friend groups.
   * @returns None
   */
  function groupsListAPICall() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('auth_code', getAuthCode(token));
    listAllFriendGroupsService(formData)
      .then(res => {
        if (res.data.status === 1) {
          dispatch(setGroupsList(res.data.friend_group_list));
        }
      })
      .catch(e => {})
      .finally(() => {
        if (isMount) {
          setrefreshing(false);
        }
      });
  }

  /**
   * Function called when refreshing the page.
   * If the component is mounted, it sets the refreshing state to true and makes an API call to retrieve the list of groups.
   * @returns None
   */
  function onRefresh() {
    if (isMount) {
      setrefreshing(true);
      groupsListAPICall();
    }
  }

  /**
   * Event handler for the scroll event.
   * @param {Object} event - The scroll event object.
   * @returns None
   */
  const onScrollEvent = event => {
    const CustomLayoutAnimation = {
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    };

    let currentOffset = event.nativeEvent.contentOffset.y;
    const direction =
      currentOffset > 0 && currentOffset > listViewOffset.current
        ? 'down'
        : 'up';
    const isEnableButton = direction === 'up';
    if (isEnableButton !== isShowAddButton) {
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      setisShowAddButton(isEnableButton);
    }
    listViewOffset.current = currentOffset;
  };

  /**
   * Retrieves a list of groups based on the provided search text.
   * If the search text is provided and not empty, it filters the groups list
   * based on the group name that includes the search text (case-insensitive).
   * If the search text is not provided or empty, it returns the entire groups list.
   * @returns {Array} - A list of groups that match the search text (if provided).
   */
  function getList() {
    if (searchText && searchText.trim()) {
      return [...groupsList].filter(item =>
        item?.group_name?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return [...groupsList];
  }

  function keyExtractor(item) {
    return item?.group_id?.toString();
  }

  function renderItem({item, index}) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          if (item.locked === 1 || !IS_ENABLE_CHIME_FUNCTIONALITY) {
            navigation.navigate('CreateEditGroup', {
              groupId: item.group_id,
              isLocked: parseInt(item.locked) === 1,
            });
          } else {
            navigation.navigate('GroupChat', {
              groupData: {...item},
            });
          }
        }}>
        <View style={styles.subContainer}>
          <ProfileWithBadge
            profileImage={item.group_icon}
            padding={0}
            profileSize={50}
            extraMargin={0}
          />
          <View style={styles.titleTextContainer}>
            <StyledText style={styles.nameText}>
              {getSlicedText(item.group_name, 20)}
            </StyledText>
            {IS_ENABLE_CHIME_FUNCTIONALITY && (
              <StyledText style={styles.messageText}>
                {getSlicedText(item.last_msg, 30)}
              </StyledText>
            )}
          </View>
        </View>
        {IS_ENABLE_CHIME_FUNCTIONALITY && (
          <View style={styles.actionIconsContainer}>
            <SVGIcon
              icon="audio_call_white"
              height={20}
              width={20}
              marginLeft={10}
            />
            <SVGIcon
              icon="event_white"
              height={21}
              width={21}
              marginLeft={20}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={styles.mainContainer}
      onLayout={e => {
        setcontainerHeight(e.nativeEvent.layout.height);
      }}>
      {!isGroupListLoading ? (
        <FlatList
          data={getList()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          onScroll={onScrollEvent}
          ListEmptyComponent={() => {
            return (
              !refreshing &&
              getList().length <= 0 && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: containerHeight,
                  }}>
                  <StyledText style={styles.emptyListText}>
                    No data found
                  </StyledText>
                </View>
              )
            );
          }}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.secondary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <ActivityIndicator size={'large'} color={COLORS.white} />
          {/* {isGroupListLoading ? (
            <ActivityIndicator size={'large'} color={COLORS.white} />
          ) : (
            <StyledText style={styles.emptyListText}>No data found</StyledText>
          )} */}
        </View>
      )}
      {isShowAddButton && (
        <RoundedPlusButton
          style={styles.addButton}
          onPress={() => {
            navigation.navigate('CreateEditGroup');
          }}
        />
      )}
    </View>
  );
};

export default GroupsList;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
  },
  subContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextContainer: {
    paddingHorizontal: 10,
  },
  nameText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.bold,
    marginVertical: 2,
  },
  messageText: {
    color: COLORS.white,
    opacity: 0.7,
    marginVertical: 2,
  },
  actionIconsContainer: {
    flexDirection: 'row',
  },
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    color: COLORS.white,
    fontFamily: FONTS.DMSans.medium,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 50,
    width: 50,
    borderRadius: 25,
  },
});
