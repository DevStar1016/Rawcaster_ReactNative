import { useEffect } from 'react';
import ConnectChimeSocket, { chimeSocketListen } from '../ChimeSocket';
import { useProfile } from '../../../Utilities/StoreData';
import { ChimeSocketEvents } from '../ChimeSocketEvents';

const ChimeSocketConnectionListener = () => {
  const profile = useProfile();

  //Chime Socket Connect and Disconnect
  useEffect(() => {
    if (profile) {
      ConnectChimeSocket(profile.user_id);
    }
    return () => {
      chimeSocketListen.off(ChimeSocketEvents.joinSocket);
    };
  }, [profile]);

  //Socket Connect and Disconnect Status
  useEffect(() => {
    chimeSocketListen.on('connect', () => {
      console.log(chimeSocketListen.connected, 'chime socket status');
    });
    chimeSocketListen.on('disconnect', () => {
      console.log('disconnect', 'chime socket status');
    });
  }, []);

  return null;
};

export default ChimeSocketConnectionListener;
