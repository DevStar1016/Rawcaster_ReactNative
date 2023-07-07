import {StyleSheet} from 'react-native';
import {useEffect} from 'react';
import ConnectChimeSocket, {chimeSocketListen} from '../ChimeSocket';
import {useUserData} from '../../../Utilities/StoreData';
import {ChimeSocketEvents} from '../ChimeSocketEvents';

const ChimeSocketListener = () => {
  const user = useUserData();

  //Chime Socket Connect and Disconnect
  useEffect(() => {
    if (user) {
      ConnectChimeSocket(user.user_id);
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

  // Meeting Room Join Request Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestFromUser,
      message => {
        console.log('ChimeSocketListen  joinRequestFromUser');
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestFromUser);
    };
  }, []);

  // Meeting Room - Host Accept or Reject Join Request Received here - Socket
  useEffect(() => {
    chimeSocketListen.on(
      ChimeSocketEvents.joinRequestResponse,
      message => {
        console.log('ChimeSocketListen  joinRequestResponse');
      },
      [],
    );
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinRequestResponse);
    };
  }, []);

  return null;
};

export default ChimeSocketListener;

const styles = StyleSheet.create({});
