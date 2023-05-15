import {sendMessage} from './Socket';
import {GROUP_PROCESS_SOCKET_TYPE} from './SocketConstants';
import {SocketEvents} from './SocketEvents';
import {
  FriendRequestSocketProps,
  groupFunctionalitySocketProps,
} from './SocketTypes';

export const friendRequestSocket = ({
  user_id,
  data,
}: FriendRequestSocketProps) => {
  const socketMessage = {
    event: SocketEvents.friendRequest,
    receiverId: user_id,
    data: data,
  };
  sendMessage(socketMessage, 'message');
};

export const groupFunctionalitySocket = ({
  groupId,
  userId,
  processType,
  groupData,
}: groupFunctionalitySocketProps) => {
  const socketMessage = {
    event: SocketEvents.groupchatmsgtransfer,
    processType: processType,
    groupId: groupId,
    userId: userId,
    groupData: groupData,
  };
  console.log(JSON.stringify(socketMessage), 'SOCKET MESSAGE SEND');

  sendMessage(socketMessage, 'groupchatting');
};
