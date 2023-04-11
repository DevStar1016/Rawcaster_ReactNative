import {sendMessage} from './Socket';
import {SocketEvents} from './SocketEvents';

export const friendRequestSocket = (user_id, data) => {
  const socketMessage = {
    event: SocketEvents.friendRequest,
    receiverId: user_id,
    data: data,
  };
  sendMessage(socketMessage, 'message');
};
