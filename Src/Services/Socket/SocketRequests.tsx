import {sendSocketMessage} from './Socket';
import {SocketEvents} from './SocketEvents';
import {
  GroupChatEnableDisableProps,
  groupFunctionalitySocketProps,
} from './SocketTypes';

/**
 * Sends a socket message related to group functionality.
 * @param {groupFunctionalitySocketProps} props - The properties for the socket message.
 * @returns None
 */
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

  sendSocketMessage(socketMessage, 'groupchatting');
};

/**
 * Sends a socket message to enable or disable group chat for a specific user in a group.
 * @param {GroupChatEnableDisableProps} props - The properties needed to enable or disable group chat.
 * @returns None
 */
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

  sendSocketMessage(socketMessage, 'groupchatting');
};
