import {
  Alert,
  FlatList,
  LayoutAnimation,
  Modal,
  RefreshControl,
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
import {
  GROUP_CATEGORY,
  IS_ENABLE_CHIME_FUNCTIONALITY,
} from '../../../Utilities/Constants';
import {deleteFriendGroupService} from '../../../Services/ApiService';
import InputPopup from '../../../Modals/InputPopup';
import {
  groupChatEnableDisableSocket,
  groupFunctionalitySocket,
} from '../../../Services/Socket/SocketRequests';
import {GROUP_PROCESS_SOCKET_TYPE} from '../../../Services/Socket/SocketConstants';
import UserItem from './UserItem';
import BlurOverlay from '../../../Components/BlurOverlay';
import Clipboard from '@react-native-community/clipboard';
import {getAllFriendsGroupsList} from '../../../Store/ThunkAPIServices';

var isMount = true;
var isOnSameGroup = true;
const GROUP_OPERATIONS = {
  enableDisableMemberChat: 1,
  deleteGroup: 2,
  reportGroup: 3,
  exitGroup: 4,
  copylink: 5,
};
const CreateEditGroup = ({route}) => {
  const {groupId, isLocked} = route.params ?? {};
  const groupsList = useGroupsList();
  const profile = useProfile();
  const [refreshing, setrefreshing] = useState(false);
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
    isOnSameGroup = true;
    return () => {
      isMount = false;
      isOnSameGroup = false;
    };
  }, []);

  useEffect(() => {
    if (groupId && isOnSameGroup) {
      const tempIndex = [...groupsList].findIndex(
        item => item.group_id === groupId,
      );
      if (tempIndex === -1) {
        Toast.fail(
          "Either you've been removed from the group or the group has been deleted by the owner",
        );
        navigation.goBack();
      }
    }
  }, [groupsList]);

  /**
   * Returns a FormData object with common form data fields populated.
   * @returns {FormData} - The FormData object with the common form data fields.
   */
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

  /**
   * Handles the creation of a new friend group.
   * It calls the addFriendGroupService function with the common form data,
   * then performs various actions based on the response.
   * If the response status is 1, it emits a socket event to notify other users,
   * updates the groups list, displays a success toast message, and navigates back.
   * If the response status is 0, it displays a failure toast message.
   * If there is an error during the process, it displays a failure toast message.
   * Finally, it sets the isLoading state to false and clears the loaderText state.
   * @returns None
   */
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
        console.log(e);
        Toast.fail(e.message);
      })
      .finally(() => {
        if (isMount) {
          setisLoading(false);
          setloaderText('');
        }
      });
  }

  /**
   * Handles the editing of a friend group.
   * Calls the editFriendGroupService function with the common form data.
   * If the response status is 1, updates the corresponding group in the groupsList array with the new group details.
   * Emits a socket event to update the group functionality.
   * Dispatches an action to update the groupsList state with the updated tempGroupsList.
   * Displays a success toast message with the response message.
   * Navigates back to the previous screen.
   * If the response status is 0, displays a failure toast message with the response message.
   * If there is an error, displays a failure toast message with the error message.
   * Finally, if the component is still mounted, sets isLoading to false and
   */
  function handleEditGroup() {
    editFriendGroupService(getCommonFormData())
      .then(res => {
        if (res.data.status === 1) {
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
          groupFunctionalitySocket({
            groupId: groupId,
            processType: GROUP_PROCESS_SOCKET_TYPE.editGroup,
            userId: profile?.user_id,
            groupData: {...res.data.group_details},
          });
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

  /**
   * Handles the removal of a user from a group.
   * @param {string} userId - The ID of the user to be removed.
   * @returns None
   */
  function handleRemoveUser(userId) {
    if (isMount) {
      setloaderText('Removing member from group');
      setisLoading(true);
    }

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
      groupFunctionalitySocket({
        groupId: groupId,
        processType: GROUP_PROCESS_SOCKET_TYPE.removeGroupMember,
        userId: profile?.user_id,
        removed_user_id: userId,
        groupData: {...tempGroupsList[tempIndex]},
      });
    }

    const formData = new FormData();
    formData.append('token', token);
    formData.append('group_id', groupId);
    formData.append('group_members', JSON.stringify([userId]));
    removeFriendsfFromGroupService(formData)
      .then(res => {
        if (res.data.status === 1) {
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

  /**
   * Handles the deletion of a group.
   * If the component is mounted, it sets the loader text to 'Leaving and Deleting this Group' and sets isLoading to true.
   * Creates a new FormData object and appends the token and groupId to it.
   * Calls the deleteFriendGroupService function with the formData.
   * If the response status is 1, it calls the groupFunctionalitySocket function with the groupId, GROUP_PROCESS_SOCKET_TYPE.deleteGroup, and userId.
   * Calls the handleSuccessExitGroup function with the response message and true as arguments.
   * If the response status is 0, it displays a Toast with the response message.
   * If there is an error, it displays a Toast with the error message.
   * Finally,
   */
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
          handleSuccessExitGroup(res.data.msg, true);
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

  /**
   * Handles reporting and leaving from a group.
   * @param {string} [message=''] - The message to include in the report.
   * @returns None
   */
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

  /**
   * Handles the exit from a group.
   * If the component is mounted, it sets the loader text to 'Leaving from this Group' and
   * sets isLoading to true.
   * Creates a new FormData object and appends the token and group_id to it.
   * Calls the exitFromGroupService function with the formData.
   * If the response status is 1, calls the handleSuccessExitGroup function with the response message.
   * If the response status is 0, displays a Toast with the response message.
   * If there is an error, displays a Toast with the error message.
   * Finally, if the component is mounted, sets isLoading to false and clears the loader text.
   * @returns None
   */
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

  /**
   * Handles the successful exit from a group.
   * @param {string} [successMessage=''] - The success message to display.
   * @param {boolean} [isDelete=false] - Indicates if the group is being deleted.
   * @returns None
   */
  function handleSuccessExitGroup(successMessage = '', isDelete = false) {
    let filteredGroupsList = [...groupsList].filter(
      item => item.group_id !== groupId,
    );
    if (!isDelete) {
      groupFunctionalitySocket({
        groupId: groupId,
        processType: GROUP_PROCESS_SOCKET_TYPE.exitGroup,
        userId: profile?.user_id,
      });
    }
    isOnSameGroup = false;
    dispatch(setGroupsList(filteredGroupsList));
    Toast.success(successMessage);
    navigation.goBack();
  }

  /**
   * Function that is called when a form is submitted.
   * It performs validation checks and handles group creation or editing.
   * @returns None
   */
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

  /**
   * Handles enabling or disabling member chat functionality.
   * If member chat is currently enabled, it will be disabled and vice versa.
   * @returns None
   */
  function handleEnableDisableMemberChat() {
    const changedStatus = isEnabledMemberChat() ? 0 : 1;
    let tempGroupsList = [...groupsList];
    const tempIndex = [...tempGroupsList].findIndex(
      item => item.group_id === groupId,
    );
    if (tempIndex !== -1) {
      tempGroupsList[tempIndex] = {
        ...tempGroupsList[tempIndex],
        chat_enabled: changedStatus,
      };
    }
    groupChatEnableDisableSocket({
      groupId,
      userId: profile.user_id,
      status: changedStatus,
    });
    dispatch(setGroupsList(tempGroupsList));
  }

  /**
   * Handles the selection and unselection of a user with the given ID.
   * @param {any} id - The ID of the user to select or unselect.
   * @returns None
   */
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
        handleEnableDisableMemberChat();
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
      case GROUP_OPERATIONS.copylink:
        Clipboard.setString(groupDetails?.referral_link ?? '');
        Toast.success('Group Link Copied');
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

  function isEnabledMemberChat() {
    return parseInt(groupDetails?.chat_enabled) === 1;
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
      if (isOtherGroup()) {
        groupMenuList.push({
          id: GROUP_OPERATIONS.copylink,
          buttonName: `Share Link`,
        });
      }
      if (IS_ENABLE_CHIME_FUNCTIONALITY) {
        groupMenuList.push({
          id: GROUP_OPERATIONS.enableDisableMemberChat,
          buttonName: `${
            isEnabledMemberChat() ? 'Disable' : 'Enable'
          } Member Chat`,
        });
      }

      if (isOtherGroup()) {
        groupMenuList.push({
          id: GROUP_OPERATIONS.deleteGroup,
          buttonName: 'Exit and Delete Group',
        });
      }
    } else {
      if (isOtherGroup()) {
        groupMenuList.push({
          id: GROUP_OPERATIONS.exitGroup,
          buttonName: 'Exit Group',
        });
      }
      groupMenuList.push({
        id: GROUP_OPERATIONS.reportGroup,
        buttonName: 'Report and Exit Group',
      });
    }

    return [...groupMenuList];
  }

  function getList() {
    let list = [];
    if (!isLocked) {
      if (groupDetails) {
        list = groupDetails.group_members_list ?? [];
      } else {
        list = [...connectionsList];
      }
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
    return groupDetails?.group_category === GROUP_CATEGORY.other;
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
      'Remove!',
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
      <UserItem
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

  const MemberLockedView = () => {
    return (
      <View style={{flex: 1}}>
        {[...Array(6)].map((_, index) => {
          return (
            <View
              key={index.toString()}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                marginVertical: 8,
              }}>
              <ProfileWithBadge
                extraMargin={0}
                isEnableGradient
                padding={0}
                profileSize={50}
                containerStyle={{marginRight: 10}}
              />
              <View
                style={{flex: 1, justifyContent: 'center', paddingRight: 20}}>
                <StyledText style={{color: COLORS.white}}>Rawcaster</StyledText>
              </View>
            </View>
          );
        })}
        <BlurOverlay />
      </View>
    );
  };
  return (
    <HOCView
      headerType="header_with_back"
      backHeaderProps={{
        title: `${groupId ? 'Edit' : 'Create'} Group`,
        isTitleCenter: true,
        rightIcon: 'menu_vertical_white',
        isEnableRightIcon:
          groupId && getMenuOptions().length > 0 ? true : false,
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
            isButton={isGroupOwner() || !groupId}
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
          {(!groupId ||
            (groupId &&
              isGroupOwner() &&
              (isOtherGroup() || groupProfileImage?.type))) && (
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
      {isLocked ? (
        <MemberLockedView />
      ) : getList() && getList().length <= 0 ? (
        <DefaultBackground
          bgColor={COLORS.primaryDark}
          centerText="No user found"
        />
      ) : (
        <View style={{flex: 1}}>
          <FlatList
            bounces={false}
            data={getList()}
            renderItem={renderItem}
            onScroll={onScrollEvent}
            ItemSeparatorComponent={() => {
              return <View style={{height: 15}} />;
            }}
            refreshing={refreshing}
            refreshControl={
              <RefreshControl
                tintColor={COLORS.secondary}
                refreshing={refreshing}
                onRefresh={() => {
                  setrefreshing(true);
                  dispatch(getAllFriendsGroupsList())
                    .then(() => {})
                    .finally(() => {
                      setrefreshing(false);
                    });
                }}
              />
            }
            keyboardShouldPersistTaps={'handled'}
            contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
          requiredErrorText="Report Reason is required"
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
