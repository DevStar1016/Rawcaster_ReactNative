import {io} from 'socket.io-client';
import {SOCKET_URL} from './SocketConstants';
const socket = io(SOCKET_URL, {
  secure: false,
  reconnection: true,
  rejectUnauthorized: false,
});

const ConnectSocket = userId => {
  if (userId) {
    sendSocketMessage({
      event: 'userdata',
      userid: userId,
      status: 1,
      login_in: 1,
    });
  }
};

export default ConnectSocket;

export const socketListen = socket;

export const sendSocketMessage = (data, type = 'message') => {
  console.log(data, type, 'SOCKET SEND');
  socket.emit(type, data, res => {
    console.log(res, 'sendSocketMessage');
  });
};
