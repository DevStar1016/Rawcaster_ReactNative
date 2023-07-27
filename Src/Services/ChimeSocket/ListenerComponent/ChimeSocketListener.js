import {StyleSheet} from 'react-native';
import {useEffect} from 'react';
import ConnectChimeSocket, {chimeSocketListen} from '../ChimeSocket';
import {useProfile, useUserData} from '../../../Utilities/StoreData';
import {ChimeSocketEvents} from '../ChimeSocketEvents';

const ChimeSocketListener = () => {
  const user = useUserData();
  const profile = useProfile();

  //Chime Socket Connect and Disconnect
  useEffect(() => {
    // if (user) {
    //   ConnectChimeSocket(user.user_id);
    // }
    if (profile) {
      console.log('CONNECT SOCKET CALL');

      ConnectChimeSocket(profile.user_id);
    }
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinSocket);
    };
  }, []);

  //Socket Connect and Disconnect Status
  useEffect(() => {
    chimeSocketListen.on('connect', () => {
      console.log(chimeSocketListen.connected, 'chime socket status');
    });
    chimeSocketListen.on('disconnect', () => {
      console.log('disconnect', 'chime socket status');
    });
  }, []);

  // Meeting Room Chat Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.meetingRoomMsg,
      message => {
        console.log('ChimeSocketListen  meetingRoomMsg');
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.meetingRoomMsg);
    };
  }, []);

  // Meeting Room Single User Chat Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.singleUserMsg,
      message => {
        console.log('ChimeSocketListen  singleUserMsg');
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.singleUserMsg);
    };
  }, []);

  return null;
};

export default ChimeSocketListener;
