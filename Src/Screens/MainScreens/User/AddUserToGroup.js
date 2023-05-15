import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import HOCView from '../../../Components/HOCView';
import {COLORS} from '../../../Utilities/Colors';
import {
  useConnectionsList,
  useGroupsList,
  useToken,
} from '../../../Utilities/StoreData';
import GroupUserItem from './GroupUserItem';
import {
  addFriendsToGroupService,
  removeFriendsfFromGroupService,
} from '../../../Services/ApiService';
import {useDispatch} from 'react-redux';
import {setGroupsList} from '../../../Store/Slices/HomeSlice';
import {useNavigation} from '@react-navigation/native';
import Toast from '../../../Components/Toast';

var isMount = true;
const AddUserToGroup = ({route}) => {
  const {groupId} = route.params ?? {};
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useToken();
  const groupsList = useGroupsList();
  const [isLoading, setisLoading] = useState(false);
  const [loaderText, setloaderText] = useState('');
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
    if (
      getGroupDetails() &&
      getGroupDetails()?.group_members_list?.length > 0
    ) {
      const groupDetails = {...getGroupDetails()};
      return [...connectionsList].filter(
        item =>
          !groupDetails?.group_members_list?.find(
            subItem => subItem.user_id === item.user_id,
          ),
      );
    }

    return [...connectionsList];
  }

  function renderItem({item}) {
    return (
      <GroupUserItem
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
        isEnableRightIcon: true,
        rightIconSize: 22,
        onPressRightIcon: handleAddusersToGroup,
      }}
      isLoading={isLoading}
      loaderProps={{loaderText: loaderText}}
      isEnableSafeArea={false}
      defaultBackgroundProps={{bgColor: COLORS.primaryDark}}
      paddingBottom={0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
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
