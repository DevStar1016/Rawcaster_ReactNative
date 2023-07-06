import {io} from 'socket.io-client';
import {CHIME_SOCKET_URL} from './ChimeSocketConstants';
import {ChimeEventsType} from './ChimeSocketPropTypes';
import {ChimeSocketEvents} from './ChimeSocketEvents';
const chimeSocket = io(CHIME_SOCKET_URL, {
  secure: false,
  reconnection: true,
  rejectUnauthorized: false,
});

/**
 * Function is used to connect Chime Socket
 * @param userId UserId to connect Socket
 */
const ConnectChimeSocket = (userId: any) => {
  if (userId) {
    sendChimeSocketMessage(
      {
        userId: userId,
      },
      ChimeSocketEvents.joinSocket,
    );
  }
};

export default ConnectChimeSocket;

export const chimeSocketListen = chimeSocket;

/**
 * Function to emit Events of Chime Socket.
 * It is used for sending data to socket.
 * @param data Data to send to the socket
 * @param type Chime Socket Event
 */
export const sendChimeSocketMessage = (data: any, type: ChimeEventsType) => {
  console.log(data, type, 'CHIME SOCKET SEND');
  chimeSocket.emit(type, data, (res: any) => {
    console.log(res, 'sendChimeSocketMessage');
  });
};
