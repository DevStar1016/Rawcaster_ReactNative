import {
  Alert,
  FlatList,
  LayoutAnimation,
  Modal,
  StyleSheet,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {COLORS} from '../../../Utilities/Colors';
import HOCView from '../../../Components/HOCView';
import ProfileWithBadge from '../../../Components/ProfileWithBadge';
import TextBox from '../../../Components/TextBox';
import SubmitButton from '../../../Components/SubmitButton';
import SearchInput from '../../../Components/SearchInput';
import {
  useConnectionsList,
  useGroupsList,
  useProfile,
  useToken,
} from '../../../Utilities/StoreData';
import StyledText from '../../../Components/StyledText';
import DefaultBackground from '../../../Components/DefaultBackground';
import {
  addFriendGroupService,
  editFriendGroupService,
  exitFromGroupService,
  groupAbuseReportService,
  removeFriendsfFromGroupService,
} from '../../../Services/ApiService';
import {useNavigation} from '@react-navigation/native';
import Toast from '../../../Components/Toast';
import {useDispatch} from 'react-redux';
import {setGroupsList} from '../../../Store/Slices/HomeSlice';
import RoundedPlusButton from '../../../Components/RoundedPlusButton';
import MenuContainer from '../../../Modals/MenuContainer';
import {GROUP_CATEGORY} from '../../../Utilities/Constants';
import GroupUserItem from './GroupUserItem';
import {deleteFriendGroupService} from '../../../Services/ApiService';
import InputPopup from '../../../Modals/InputPopup';
import {groupFunctionalitySocket} from '../../../Services/Socket/SocketRequests';
import {GROUP_PROCESS_SOCKET_TYPE} from '../../../Services/Socket/SocketConstants';

var isMount = true;
const GROUP_OPERATIONS = {
  enableDisableMemberChat: 1,
  deleteGroup: 2,
  reportGroup: 3,
  exitGroup: 4,
};
const CreateEditGroup = ({route}) => {
  const {groupId} = route.params ?? {};
  const groupsList = useGroupsList();
  const profile = useProfile();
  const groupDetails = [...groupsList].find(item => item.group_id === groupId);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const token = useToken();
  const connectionsList = useConnectionsList();
  const [selectedConnectionsIds, setselectedConnectionsIds] = useState([]);
  const [searchText, setsearchText] = useState('');
  const [groupName, setgroupName] = useState(
    groupDetails ? groupDetails.group_name : '',
  );
  const [groupProfileImage, setgroupProfileImage] = useState(
    groupDetails ? {uri: groupDetails.group_icon} : null,
  );
  const [loaderText, setloaderText] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const [isShowAddButton, setisShowAddButton] = useState(true);
  const listViewOffset = useRef(0);
  const [isOpenGroupMenu, setisOpenGroupMenu] = useState(false);
  const [isOpenReportModal, setisOpenReportModal] = useState(false);

  useEffect(() => {
    isMount = true;

    return () => {
      isMount = false;
    };
  }, []);

  function getCommonFormData() {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_name', groupName.trim());
    if (!groupId) {
      formData.append('group_members', JSON.stringify(selectedConnectionsIds));
    }
    if (groupId) {
      formData.append('group_id', groupId);
    }
    if (groupProfileImage && groupProfileImage.type) {
      formData.append('group_icon', groupProfileImage);
    }
    return formData;
  }

  function handleCreateGroup() {
    addFriendGroupService(getCommonFormData())
      .then(res => {
        if (res.data.status === 1) {
          groupFunctionalitySocket({
            groupId: res.data.group_details.group_id,
            processType: GROUP_PROCESS_SOCKET_TYPE.createGroup,
            userId: profile?.user_id,
            groupData: {...res.data.group_details},
          });
          dispatch(setGroupsList([{...res.data.group_details}, ...groupsList]));
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

  function handleEditGroup() {
    editFriendGroupService(getCommonFormData())
      .then(res => {
        if (res.data.status === 1) {
          console.log(res.data.group_details, 'EDITED GROUP DATA');
          const tempGroupsList = [...groupsList];
          let tempIndex = [...tempGroupsList].findIndex(
            item => item.group_id === groupId,
          );
          if (tempIndex !== -1) {
            tempGroupsList[tempIndex] = {
              ...tempGroupsList[tempIndex],
              ...res.data.group_details,
            };
          }
          dispatch(setGroupsList([...tempGroupsList]));
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

  function handleRemoveUser(userId) {
    if (isMount) {
      setloaderText('Removing member from group');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    formData.append('group_members', JSON.stringify([userId]));
    removeFriendsfFromGroupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          let tempGroupsList = [...groupsList];
          const tempIndex = tempGroupsList.findIndex(
            item => item.group_id === groupId,
          );
          if (tempIndex !== -1) {
            let filteredGroupMembersList = [
              ...tempGroupsList[tempIndex]?.group_members_list,
            ].filter(item => item.user_id !== userId);
            tempGroupsList[tempIndex].group_members_list = [
              ...filteredGroupMembersList,
            ];
          }
          dispatch(setGroupsList(tempGroupsList));
          Toast.success(res.data.msg);
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

  function handleDeleteGroup() {
    if (isMount) {
      setloaderText('Leaving and Deleting this Group');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    deleteFriendGroupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          groupFunctionalitySocket({
            groupId: groupId,
            processType: GROUP_PROCESS_SOCKET_TYPE.deleteGroup,
            userId: profile?.user_id,
          });
          handleSuccessExitGroup(res.data.msg);
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

  function handleReportGroup(message = '') {
    if (isMount) {
      setloaderText('Reporting and Leaving from this Group');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    formData.append('message', message.trim());
    groupAbuseReportService(formData)
      .then(res => {
        if (res.data.status === 1) {
          handleSuccessExitGroup(res.data.msg);
        } else if (res.data.status === 0) {
          Toast.fail(res.data.msg);
        }
      })
      .catch(() => {
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
          setloaderText('');
        }
      });
  }

  function handleExitGroup() {
    if (isMount) {
      setloaderText('Leaving from this Group');
      setisLoading(true);
    }
    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    exitFromGroupService(formData)
      .then(res => {
        if (res.data.status === 1) {
          handleSuccessExitGroup(res.data.msg);
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

  function handleSuccessExitGroup(successMessage = '') {
    let filteredGroupsList = [...groupsList].filter(
      item => item.group_id !== groupId,
    );
    dispatch(setGroupsList(filteredGroupsList));
    Toast.success(successMessage);
    navigation.goBack();
  }

  function onSubmit() {
    if (getGroupNameError()) {
      Toast.fail(getGroupNameError());
      return;
    }

    if (isMount) {
      if (groupId) {
        setloaderText('Editing Group');
        handleEditGroup();
      } else {
        setloaderText('Creating Group');
        handleCreateGroup();
      }
      setisLoading(true);
    }
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

  function onDeleteGroup() {
    Alert.alert(
      'Exit and Delete!',
      'Are you sure to exit and delete this group?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            handleDeleteGroup();
          },
        },
      ],
      {cancelable: false},
    );
  }

  function onExitGroup() {
    Alert.alert(
      'Exit!',
      'Are you sure to exit from this group?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            handleExitGroup();
          },
        },
      ],
      {cancelable: false},
    );
  }

  function onPressMenuOption(selectedButtonId) {
    if (isMount) {
      setisOpenGroupMenu(false);
    }

    switch (selectedButtonId) {
      case GROUP_OPERATIONS.enableDisableMemberChat:
        break;
      case GROUP_OPERATIONS.deleteGroup:
        onDeleteGroup();
        break;
      case GROUP_OPERATIONS.reportGroup:
        if (isMount) {
          setisOpenReportModal(true);
        }
        break;
      case GROUP_OPERATIONS.exitGroup:
        onExitGroup();
        break;
    }
  }

  function isDisabledSubmitButton() {
    if (groupName.trim() && !getGroupNameError()) {
      return false;
    }
    return true;
  }

  function isSelected(id) {
    return [...selectedConnectionsIds].includes(id);
  }

  function getGroupNameError() {
    if (groupDetails?.group_name?.toLowerCase() !== 'my fans') {
      if (groupName.trim().toLowerCase() === 'my fans') {
        return `Group name already exists`;
      }
    }
    return '';
  }

  function getMenuOptions() {
    let groupMenuList = [];

    if (isGroupOwner()) {
      groupMenuList.push({
        id: GROUP_OPERATIONS.enableDisableMemberChat,
        buttonName: 'Enable Member Chat',
      });
      if (isOtherGroup()) {
        groupMenuList.push({
          id: GROUP_OPERATIONS.deleteGroup,
          buttonName: 'Exit and Delete Group',
        });
      }
    } else {
      groupMenuList.push({
        id: GROUP_OPERATIONS.exitGroup,
        buttonName: 'Exit Group',
      });
      groupMenuList.push({
        id: GROUP_OPERATIONS.reportGroup,
        buttonName: 'Report and Exit Group',
      });
    }

    return [...groupMenuList];
  }

  function getList() {
    let list = [];
    if (groupDetails) {
      list = groupDetails.group_members_list;
    } else {
      list = [...connectionsList];
    }
    if (searchText.trim()) {
      return list.filter(item =>
        item.display_name?.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
    return list;
  }

  function keyExtractor(item, index) {
    return item.user_id.toString();
  }

  function onScrollEvent(event) {
    if (!groupId) {
      return;
    }
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
  }

  function isOtherGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.other;
  }
  function isMyFansGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.myFans;
  }

  function isInfluencerGroup() {
    return groupDetails.group_category === GROUP_CATEGORY.influencer;
  }

  function isGroupOwner(id) {
    if (id) {
      return groupDetails?.group_owner === id;
    }
    return groupDetails?.group_owner === profile?.user_id;
  }

  function isMe(id) {
    return profile?.user_id === id;
  }

  function isEnableEdit() {
    return isGroupOwner() && isOtherGroup();
  }

  function onPressItemDelete(userId) {
    Alert.alert(
      'Delete!',
      'Do you want to remove this member from group?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            handleRemoveUser(userId);
          },
        },
      ],
      {cancelable: false},
    );
  }

  function renderItem({item}) {
    return (
      <GroupUserItem
        item={item}
        groupId={groupId}
        isEnableEdit={isEnableEdit()}
        isGroupOwner={isGroupOwner(item.user_id)}
        isMe={isMe(item.user_id)}
        isSelected={isSelected(item.user_id)}
        onPressItem={() => {
          handleSelectUnselectUser(item.user_id);
        }}
        onPressRemove={() => {
          onPressItemDelete(item.user_id);
        }}
      />
    );
  }

  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `${groupId ? 'Edit' : 'Create'} Group`,
        isTitleCenter: true,
        rightIcon: 'menu_vertical_white',
        isEnableRightIcon: groupId ? true : false,
        rightIconSize: 18,
        onPressRightIcon: () => {
          if (isMount) {
            setisOpenGroupMenu(getMenuOptions().length > 0);
          }
        },
      }}
      isLoading={isLoading}
      loaderProps={{loaderText: loaderText}}
      isEnableSafeArea={false}
      defaultBackgroundProps={{bgColor: COLORS.primaryDark}}
      paddingBottom={0}
      paddingHorizontal={0}
      backgroundColor={COLORS.primaryDark}>
      <View style={{paddingHorizontal: 10}}>
        <View style={styles.topContainer}>
          <ProfileWithBadge
            isEnableOnPressImagePicker
            isButton={isGroupOwner()}
            profileSize={45}
            profileImage={groupProfileImage?.uri}
            extraMargin={0}
            padding={0}
            onSelectImage={setgroupProfileImage}
          />
          <View style={styles.textInputCotainer}>
            <TextBox
              mainContainerMarginTop={0}
              value={groupName}
              isEditable={!groupId || (groupId && isEnableEdit())}
              borderColor={COLORS.transparent}
              textColor={COLORS.white}
              placeHolder="Enter group name"
              backgroundColor={COLORS.transparent}
              mainContainerMarginVertical={0}
              inputContainerMarginVertical={0}
              onChangeText={setgroupName}
            />
          </View>
          {(!groupId || (groupId && isGroupOwner())) && (
            <SubmitButton
              buttonText={groupId ? 'Edit' : 'Create'}
              marginTop={0}
              isDisabled={isDisabledSubmitButton()}
              marginBottom={0}
              paddingVertical={7}
              borderRadius={8}
              onPress={onSubmit}
            />
          )}
        </View>
        {getGroupNameError() ? (
          <StyledText style={{color: COLORS.red}}>
            {getGroupNameError()}
          </StyledText>
        ) : (
          false
        )}
        <SearchInput
          searchButtonColor={COLORS.secondary}
          marginVertical={5}
          marginTop={getGroupNameError() ? 10 : 5}
          searchWhenClickedButton={false}
          placeHolderText="Search Member"
          onSearch={setsearchText}
        />
      </View>
      {getList().length <= 0 && (
        <DefaultBackground
          bgColor={COLORS.primaryDark}
          centerText="No user found"
        />
      )}
      <View style={{flex: 1}}>
        <FlatList
          bounces={false}
          data={getList()}
          renderItem={renderItem}
          onScroll={onScrollEvent}
          ItemSeparatorComponent={() => {
            return <View style={{height: 15}} />;
          }}
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {groupId && isGroupOwner() && isOtherGroup() && isShowAddButton && (
        <RoundedPlusButton
          style={styles.addButton}
          icon="user_plus_white"
          iconSize={23}
          onPress={() => {
            navigation.navigate('AddUserToGroup', {
              groupId: groupId,
            });
          }}
        />
      )}

      <Modal
        visible={isOpenReportModal}
        transparent
        onRequestClose={() => {
          if (isMount) {
            setisOpenReportModal(false);
          }
        }}>
        <InputPopup
          closePopup={() => {
            if (isMount) {
              setisOpenReportModal(false);
            }
          }}
          title={'Report this group to Rawcaster'}
          submitButtonProps={{
            buttonText: 'Report',
          }}
          requiredErrorText="Report Reason is reuired"
          textInputProps={{
            placeHolder: 'Enter your message',
            multiline: true,
            inputContainerHeight: 100,
            textAlignVertical: 'top',
          }}
          onSubmit={message => {
            if (isMount) {
              setisOpenReportModal(false);
            }
            handleReportGroup(message);
          }}
        />
      </Modal>

      <Modal
        visible={isOpenGroupMenu}
        transparent
        onRequestClose={() => {
          setisOpenGroupMenu(false);
        }}>
        <MenuContainer
          setModal={status => {
            setisOpenGroupMenu(status);
          }}
          buttonsOptions={getMenuOptions()}
          onPressOption={onPressMenuOption}
        />
      </Modal>
    </HOCView>
  );
};

export default CreateEditGroup;

const styles = StyleSheet.create({
  topContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputCotainer: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
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
