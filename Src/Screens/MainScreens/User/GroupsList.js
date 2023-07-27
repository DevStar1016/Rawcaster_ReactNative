import {
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
import {useGroupsList, useToken} from '../../../Utilities/StoreData';
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

var isMount = true;
const GroupsList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
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

  function onRefresh() {
    if (isMount) {
      setrefreshing(true);
      groupsListAPICall();
    }
  }

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
          // navigation.navigate('CreateEditGroup', {
          //   groupId: item.group_id,
          //   isLocked: parseInt(item.locked) === 1,
          // });
          if (item.locked === 1) {
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
            <StyledText style={styles.messageText}>
              {/* {getSlicedText(item.last_msg, 30)} */}Lorem ipsum dolor sit
              ame ...
            </StyledText>
          </View>
        </View>
        <View style={styles.actionIconsContainer}>
          <SVGIcon
            icon="audio_call_white"
            height={20}
            width={20}
            marginLeft={10}
          />
          <SVGIcon icon="event_white" height={21} width={21} marginLeft={20} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {getList().length > 0 ? (
        <FlatList
          data={getList()}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 20}}
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          onScroll={onScrollEvent}
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
          <StyledText style={styles.emptyListText}>No data found</StyledText>
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
