import {Modal, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import moment from 'moment';
import ConnectSocket, {socketListen} from '../Socket';
import ConectionRequestModal from '../../../Modals/ConectionRequestModal';
import {useUserData} from '../../../Utilities/StoreData';
import {
  setConnectionsList,
  setGroupsList,
} from '../../../Store/Slices/HomeSlice';
import {SocketEvents} from '../SocketEvents';
import {GROUP_PROCESS_SOCKET_TYPE} from '../SocketConstants';

const SocketListener = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const user = useUserData();
  const [isShowFriendRequestModal, setisShowFriendRequestModal] =
    useState(false);
  const [socketFriendRequestData, setsocketFriendRequestData] = useState(null);

  //Socket Connect and Disconnect
  useEffect(() => {
    if (user) {
      ConnectSocket(user.user_id);
    }
    return () => {
      console.log('OFF SOCKET');
      socketListen.off('call');
    };
  }, []);

  //Socket Connect and Disconnect Status
  useEffect(() => {
    socketListen.on('connect', () => {
      console.log(socketListen.connected, 'socket status');
    });
    socketListen.on('disconnect', () => {
      console.log('disconnect', 'socket status');
    });
  }, []);

  // Socket Type "groupchatting" Received
  useEffect(() => {
    socketListen.on(
      'groupchatting',
      message => {
        console.log('SocketListen  groupchatting on in Dashboard');
        switch (message.event) {
          case 'groupchatmessage':
            break;
          case 'groupchatmessagedelete':
            break;
          case 'groupchatmessageupdate':
            break;
          case 'grouptyping':
            break;
          case 'groupchatenable':
            handleEnableDisableGroupChat(message?.groupId, message?.status);
            break;
          case 'groupchatmsgtransfer':
            handleGroupFunctionalities(message);
            break;
        }
      },
      [],
    );
  }, []);

  // Socket Type "message" Received
  useEffect(() => {
    socketListen.on(
      'message',
      message => {
        switch (message.event) {
          case SocketEvents.friendRequest:
            handleSocketFriendRequests(message?.data);
            break;
          case SocketEvents.friendResponse:
            // FriendResponse(message);
            break;
          case SocketEvents.friendStatus:
            handleSocketFriendOnlineStatus(message);
            break;
        }
      },
      [],
    );
  }, []);

  function handleSocketFriendRequests(data) {
    setsocketFriendRequestData(data);
    setisShowFriendRequestModal(true);
  }

  function handleSocketFriendOnlineStatus(message) {
    let tempFriends = store.getState().home.connectionsList;
    let newFriendList = [...tempFriends];

    const index = newFriendList.findIndex(
      ele => parseInt(ele.user_id) === parseInt(message.friendid),
    );
    if (
      index > -1 &&
      (newFriendList[index].online === 0 || newFriendList[index].online === 1)
    ) {
      let login_from_web = newFriendList[index].login_from_web;
      let login_from_app = newFriendList[index].login_from_app;

      if (message.login_in === 2 && message.status === 1) {
        login_from_app = 1;
      } else if (message.login_in === 2 && message.status === 0) {
        login_from_app = 0;
      }

      if (message.login_in === 1 && message.status === 1) {
        login_from_web = 1;
      } else if (message.login_in === 1 && message.status === 0) {
        login_from_web = 0;
      }
      if (login_from_app === 0 && login_from_web === 0) {
        newFriendList[index].online = 0;
        newFriendList[index].last_seen = message.last_seen;
        newFriendList[index].login_from_app = login_from_app;
        newFriendList[index].login_from_web = login_from_web;
      } else {
        newFriendList[index].online = 1;
        newFriendList[index].last_seen = message.last_seen;
        newFriendList[index].login_from_app = login_from_app;
        newFriendList[index].login_from_web = login_from_web;
      }
    }
    newFriendList.sort((a, b) => {
      // if (a.online !== b.online) {
      //   return a.online ? -1 : 1;
      // }
      return (
        moment(b.last_msg_datetime ? b.last_msg_datetime : '1970-01-02').format(
          'X',
        ) -
        moment(a.last_msg_datetime ? a.last_msg_datetime : '1970-01-02').format(
          'X',
        )
      );
    });
    dispatch(setConnectionsList(newFriendList));
  }

  function handleGroupFunctionalities(message) {
    switch (message.processType) {
      case GROUP_PROCESS_SOCKET_TYPE.createGroup:
        handleCreateGroup(message?.groupData);
        break;
      case GROUP_PROCESS_SOCKET_TYPE.editGroup:
        handleUpdateGroup(message?.groupData);
        break;
      case GROUP_PROCESS_SOCKET_TYPE.deleteGroup:
        handleDeleteGroup(message?.groupId);
        break;
      case GROUP_PROCESS_SOCKET_TYPE.removeGroupMember:
        handleRemoveGroupMember(message?.removed_user_id, message?.groupData);
        break;
      case GROUP_PROCESS_SOCKET_TYPE.addGroupMember:
        handleUpdateGroup(message?.groupData);
        break;
      case GROUP_PROCESS_SOCKET_TYPE.exitGroup:
        handleExitGroup(message?.userId, message?.groupId);
        break;
    }
  }

  function handleCreateGroup(groupDetails) {
    if (groupDetails) {
      let tempGroupsList = [...store.getState().home.groupsList];
      const tempIndex = tempGroupsList.findIndex(
        item => item.group_id === groupDetails?.group_id,
      );
      if (tempIndex === -1) {
        tempGroupsList = [{...groupDetails}, ...tempGroupsList];
      }
      dispatch(setGroupsList(tempGroupsList));
    }
  }

  function handleUpdateGroup(groupDetails) {
    if (groupDetails) {
      let tempGroupsList = [...store.getState().home.groupsList];
      const tempIndex = tempGroupsList.findIndex(
        item => item.group_id === groupDetails?.group_id,
      );
      if (tempIndex !== -1) {
        tempGroupsList[tempIndex] = {...groupDetails};
      } else {
        tempGroupsList = [{...groupDetails}, ...tempGroupsList];
      }
      dispatch(setGroupsList(tempGroupsList));
    }
  }

  function handleDeleteGroup(groupId) {
    let tempGroupsList = [...store.getState().home.groupsList];
    tempGroupsList = [...tempGroupsList].filter(
      item => item.group_id !== groupId,
    );
    dispatch(setGroupsList(tempGroupsList));
  }

  function handleRemoveGroupMember(removedUserId, groupDetails) {
    const profile = store.getState().auth.profile;
    if (removedUserId === profile.user_id) {
      handleDeleteGroup(groupDetails?.group_id);
    } else {
      handleUpdateGroup(groupDetails);
    }
  }

  function handleEnableDisableGroupChat(groupId, changedStatus) {
    let tempGroupsList = [...store.getState().home.groupsList];
    const tempIndex = [...tempGroupsList].findIndex(
      item => item.group_id === groupId,
    );
    if (tempIndex !== -1) {
      tempGroupsList[tempIndex] = {
        ...tempGroupsList[tempIndex],
        chat_enabled: changedStatus,
      };
    }
    dispatch(setGroupsList(tempGroupsList));
  }

  function handleExitGroup(userId, groupId) {
    let tempGroupsList = [...store.getState().home.groupsList];
    let tempIndex = [...tempGroupsList].findIndex(
      item => item.group_id === groupId,
    );
    if (tempIndex !== -1) {
      let filteredMembersList = [
        ...tempGroupsList[tempIndex]?.group_members_list,
      ].filter(item => item.user_id !== userId);
      tempGroupsList[tempIndex] = {
        ...tempGroupsList[tempIndex],
        group_members_list: [...filteredMembersList],
      };
    }
    dispatch(setGroupsList(tempGroupsList));
  }

  return (
    <View>
      <Modal
        visible={isShowFriendRequestModal}
        onRequestClose={() => {
          setisShowFriendRequestModal(false);
        }}
        transparent>
        <ConectionRequestModal
          onClose={() => {
            setisShowFriendRequestModal(false);
          }}
          socketData={socketFriendRequestData}
        />
      </Modal>
    </View>
  );
};

export default SocketListener;

const styles = StyleSheet.create({});
