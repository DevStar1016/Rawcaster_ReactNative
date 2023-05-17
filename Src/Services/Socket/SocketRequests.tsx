import {sendMessage} from './Socket';
import {GROUP_PROCESS_SOCKET_TYPE} from './SocketConstants';
import {SocketEvents} from './SocketEvents';
import {
  FriendRequestSocketProps,
  GroupChatEnableDisableProps,
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
  createdBy,
  added_user_ids,
  removed_user_id,
}: groupFunctionalitySocketProps) => {
  const socketMessage = {
    event: SocketEvents.groupchatmsgtransfer,
    processType: processType,
    groupId: groupId,
    userId: userId,
    groupData: groupData,
    createdBy: createdBy,
    added_user_ids: added_user_ids,
    removed_user_id: removed_user_id,
  };

  sendMessage(socketMessage, 'groupchatting');
};

export const groupChatEnableDisableSocket = ({
  groupId,
  userId,
  status,
}: GroupChatEnableDisableProps) => {
  const socketMessage = {
    event: SocketEvents.groupchatenable,
    groupId: groupId,
    userId: userId,
    status: status,
  };

  sendMessage(socketMessage, 'groupchatting');
};
