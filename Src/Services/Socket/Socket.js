import {io} from 'socket.io-client';
import {SOCKET_URL} from '../ServiceConstants';
const socket = io(SOCKET_URL, {
  secure: false,
  reconnection: true,
  rejectUnauthorized: false,
});

const ConnectSocket = userId => {
  if (userId) {
    sendMessage({
      event: 'userdata',
      userid: userId,
      status: 1,
      login_in: 1,
    });
  }
};

export default ConnectSocket;

export const socketListen = socket;

export const sendMessage = (data, type = 'message') => {
  socket.emit(type, data, res => {
    console.log(res, 'sendMessage');
  });
};
