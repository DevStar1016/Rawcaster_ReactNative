import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import moment from 'moment';
import ConnectSocket, {socketListen} from '../Services/Socket/Socket';
import ConectionRequestModal from '../Modals/ConectionRequestModal';
import {useUserData} from '../Utilities/StoreData';
import {setConnectionsList} from '../Store/Slices/HomeSlice';
import {SocketEvents} from '../Services/Socket/SocketEvents';

const SocketListener = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const user = useUserData();
  const [isShowFriendRequestModal, setisShowFriendRequestModal] =
    useState(false);
  const [socketFriendRequestData, setsocketFriendRequestData] = useState(null);

  useEffect(() => {
    if (user) {
      ConnectSocket(user.user_id);
    }
  }, []);

  useEffect(() => {
    socketListen.on('connect', () => {
      console.log(socketListen.connected, 'socket status');
    });
    socketListen.on('disconnect', () => {
      console.log('disconnect', 'socket status');
    });

    socketListen.on(
      'message',
      message => {
        console.log(message, 'Socket Received Message');
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
    socketListen.on(
      'groupchatting',
      message => {
        console.log('SocketListen  groupchatting on in Dashboard');
        switch (message.event) {
          case 'groupchatmessage':
            console.log(message, 'GROUP CHAT RECEIVED');
            break;
          case 'groupchatmessagedelete':
            break;
          case 'groupchatmessageupdate':
            break;
          case 'grouptyping':
            break;
          case 'groupchatenable':
            break;
          case 'groupchatmsgtransfer':
            break;
        }
      },
      [],
    );

    return () => {
      console.log('OFF SOCKET');
      socketListen.off('call');
    };
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
