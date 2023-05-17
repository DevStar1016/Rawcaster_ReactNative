import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import {
  addFriendsToGroupService,
  removeFriendsfFromGroupService,
} from '../../../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setGroupsList} from '../../../Store/Slices/HomeSlice';
import {useNavigation} from '@react-navigation/native';
import Toast from '../../../Components/Toast';
import {GROUP_PROCESS_SOCKET_TYPE} from '../../../Services/Socket/SocketConstants';
import {groupFunctionalitySocket} from '../../../Services/Socket/SocketRequests';
import SearchInput from '../../../Components/SearchInput';
import UserItem from './UserItem';

var isMount = true;
const AddUserToGroup = ({route}) => {
  const {groupId} = route.params ?? {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const profile = useProfile();
  const groupsList = useGroupsList();
  const [isLoading, setisLoading] = useState(false);
  const [loaderText, setloaderText] = useState('');
  const [searchText, setsearchText] = useState('');
  const connectionsList = useConnectionsList();
  const [selectedConnectionsIds, setselectedConnectionsIds] = useState([]);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function getGroupDetails() {
    return [...groupsList].find(item => item.group_id === groupId);
  }

  function handleAddusersToGroup() {
    if (isMount) {
      setloaderText('Adding Connections to Group');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    formData.append('group_members', JSON.stringify(selectedConnectionsIds));
    addFriendsToGroupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempGroupsList = [...groupsList];
          const tempIndex = tempGroupsList.findIndex(
            item => item.group_id === groupId,
          );
          if (tempIndex !== -1) {
            let groupMembersList = [
              ...tempGroupsList[tempIndex]?.group_members_list,
              ...res.data.memberdetails,
            ];
            tempGroupsList[tempIndex].group_members_list = [
              ...groupMembersList,
            ];
            groupFunctionalitySocket({
              groupId: groupId,
              processType: GROUP_PROCESS_SOCKET_TYPE.addGroupMember,
              userId: profile?.user_id,
              createdBy: profile.name,
              added_user_ids: selectedConnectionsIds,
              groupData: {...tempGroupsList[tempIndex]},
            });
          }

          dispatch(setGroupsList(tempGroupsList));
          Toast.success(res.data.msg);
          navigation.goBack();
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(e => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
          setloaderText('');
        }
      });
  }

  function handleSelectUnselectUser(id) {
    let tempSelectedIdsList = [...selectedConnectionsIds];
    if (tempSelectedIdsList.includes(id)) {
      tempSelectedIdsList = tempSelectedIdsList.filter(userId => userId !== id);
    } else {
      tempSelectedIdsList.push(id);
    }
    if (isMount) {
      setselectedConnectionsIds(tempSelectedIdsList);
    }
  }

  function isSelected(id) {
    return [...selectedConnectionsIds].includes(id);
  }

  function keyExtractor(item, index) {
    return item.user_id.toString();
  }

  function getUsersList() {
    let usersList = [...connectionsList];

    if (
      getGroupDetails() &&
      getGroupDetails()?.group_members_list?.length > 0
    ) {
      const groupDetails = {...getGroupDetails()};
      usersList = [...usersList].filter(
        item =>
          !groupDetails?.group_members_list?.find(
            subItem => subItem.user_id === item.user_id,
          ),
      );
    }

    if (searchText.trim()) {
      return [...usersList].filter(item =>
        item.display_name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    return [...usersList];
  }

  function renderItem({item}) {
    return (
      <UserItem
        item={item}
        isSelected={isSelected(item.user_id)}
        onPressItem={() => {
          handleSelectUnselectUser(item.user_id);
        }}
      />
    );
  }

  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `Add participant${
          selectedConnectionsIds.length > 0
            ? ` - ${selectedConnectionsIds.length}  added`
            : ''
        }`,
        isTitleCenter: true,
        rightIcon: 'tick',
        isEnableRightIcon: selectedConnectionsIds.length > 0,
        rightIconSize: 20,
        onPressRightIcon: handleAddusersToGroup,
      }}
      isLoading={isLoading}
      loaderProps={{loaderText: loaderText}}
      isEnableSafeArea={false}
      isEnableDefaultBackground={getUsersList().length <= 0}
      defaultBackgroundProps={{
        bgColor: COLORS.primaryDark,
        centerText: 'No users found',
      }}
      paddingBottom={0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
      <SearchInput
        searchButtonColor={COLORS.secondary}
        marginVertical={10}
        searchWhenClickedButton={false}
        placeHolderText="Search User"
        marginHorizontal={15}
        onSearch={setsearchText}
      />
      <View style={{flex: 1}}>
        <FlatList
          bounces={false}
          data={getUsersList()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </HOCView>
  );
};

export default AddUserToGroup;

const styles = StyleSheet.create({});
